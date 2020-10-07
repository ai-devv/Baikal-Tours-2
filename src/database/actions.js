"use strict";

import fetch from "node-fetch";
import { transliterate, slugify } from "transliteration";
import Foundation from "./helpers/foundation";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

import { createMap, mergeMultiple } from "/helpers/merger";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions" );
  }

  async createEmpty(){
    const id = ( await super.query(
      `insert into actions( site_payment, instagram_widget_is_show )
      values( false, false )
      returning id`
    ) ).rows[0].id;

    return super.success( 0, id );
  }

  async getAll( allStatuses, locale, count, offset ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const limit = count && count > 0 ? `limit ${count}` : "";
    const offset_ = offset && offset > -1 ? `offset ${offset}` : "";

    const rows = ( await super.query(
      `select *
      from (
      	select
      		a.id, a.slug, a.status, at.name, at.alt,
      		ai.image_url,
      		array_agg( distinct s.name ) as subjects,
      		coalesce( min( ab.price ), 0 ) as price_min,
      		coalesce( max( ab.price ), 0 ) as price_max,
      		min( ad.date_start ) as date_start,
      		null as locations,
      		null as dates,
      		count( 1 ) over ()
      	from
      		actions as a
      		left join action_dates as ad
      		on a.id = ad.action_id
      		left join action_images as ai
      		on a.id = ai.action_id and ai.is_main = true
      		left join actions_subjects as acsu
      		on a.id = acsu.action_id
      		left join subjects as s
      		on acsu.subject_id = s.id and s.locale = $1
      		left join actions_locations2 as al2
      		on a.id = al2.action_id
      		left join locations2 as l2
      		on al2.location2_id = l2.id and l2.locale = $1
      		left join action_buyable as ab
      		on a.id = ab.action_id and ab.type = 'ticket',
      		actions_translates as at
      	where
      		${status}
      		a.id = at.action_id and
      		at.locale = $1
      	group by a.id, a.slug, a.status, at.name, at.alt, ai.image_url ) as tmp
      order by date_start, id
      ${limit}
      ${offset_}`,
      [ locale ]
    ) ).rows;

    const map = createMap( rows, "id" );
    const actionIds = Object.keys( map );

    const { rows: locations } = await super.query(
      `select
        al2.action_id, al2.address, al2.coords,
        l2.name
      from
        actions_locations2 as al2,
        locations2 as l2
      where
        l2.locale = $1 and
        action_id = any( $2 ) and
        al2.location2_id = l2.id`,
      [ locale, actionIds ]
    );

    const { rows: dates } = await super.query(
      `select action_id, date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = any( $1 )`,
      [ actionIds ]
    );

    mergeMultiple( rows, locations, "action_id", "locations", { map, remove: true } );
    mergeMultiple( rows, dates, "action_id", "dates", { map, remove: true } );

    return super.success( 0, rows );
  }

  async filter(
    client,
    allStatuses,
    locale,
    dateStart,
    dateEnd,
    locations,
    companions,
    subjects,
    search,
    priceMin,
    priceMax,
    count,
    offset
  ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const limit = count && count > 0 ? `limit ${count}` : "";
    const offset_ = offset && offset > -1 ? `offset ${offset}` : "";
    let filters = [];
    let priceFilters = [];
    const params = [ locale ];
    let i = 2;

    if( typeof priceMin === "number" && priceMin >= 0 ){
      priceFilters.push( `tmp.price_min >= $${i++}` );
      params.push( priceMin );
    }

    if( typeof priceMax === "number" && priceMax >= 0 ){
      priceFilters.push( `tmp.price_max <= $${i++}` );
      params.push( priceMax );
    }

    if( locations ){
      filters.push( `al2.location2_id = any( $${i++} )` );
      params.push( locations );
    }

    if( companions ){
      filters.push( `ac.companion_id = any( $${i++} )` );
      params.push( companions );
    }

    if( subjects ){
      filters.push( `asu.subject_id = any( $${i++} )` );
      params.push( subjects );
    }

    if( search && search !== "" ){
      search = search.split( "," ).map( item => `%${item}%` );

      filters.push(
        `(
          at.name ||
          at.full_description
        ) ilike any( $${i++} )`
      );

      params.push( search );
    }

    if( dateStart ){
      filters.push( `( ad.date_start is null or ad.date_start >= $${i++} )` );
      params.push( dateStart );
    }

    if( dateEnd ){
      filters.push( `( ad.date_end is null or ad.date_end <= $${i} )` );
      params.push( dateEnd );
    }

    if( filters.length === 0 ) filters = "";
    else filters = `${filters.join( " and " )} and`;

    if( priceFilters.length === 0 ) priceFilters = "";
    else priceFilters = `where ${priceFilters.join( " and " )}`;

    const { rows: actions } = await client.query(
      `select
      	tmp.id, tmp.slug, tmp.status,
        tmp.price_min, tmp.price_max,
        tmp.name, tmp.alt,
        tmp.image_url,
      	array[]::int[] as subjects,
      	null as locations,
      	null as dates,
        count( 1 ) over ()
      from (
      	select distinct
      		a.id, a.slug, a.status,
      		coalesce( min( ab.price ), 0 ) as price_min,
      		coalesce( max( ab.price ), 0 ) as price_max,
          at.name, at.alt, ai.image_url,
      		min( ad.date_start ) as date_start
      	from
      		actions as a
      		left join action_buyable as ab
      		on a.id = ab.action_id
          left join action_images as ai
          on a.id = ai.action_id and ai.is_main = true
      		left join actions_locations2 as al2
      		on a.id = al2.action_id
      		left join actions_companions as ac
      		on a.id = ac.action_id
      		left join actions_subjects as asu
      		on a.id = asu.action_id
      		left join action_dates as ad
      		on a.id = ad.action_id,
      		actions_translates as at
      	where
      		at.locale = $1 and
      		${status}
      		${filters}
      		a.id = at.action_id
      	group by a.id, a.slug, at.name, at.alt, ai.image_url ) as tmp
      ${priceFilters}
      order by tmp.date_start, tmp.id
      ${limit}
      ${offset_}`,
      params
    );

    const map = createMap( actions, "id" );
    const actionIds = Object.keys( map );

    const { rows: subjects_ } = await super.query(
      `select asu.action_id, s.name
      from
      	actions_subjects as asu,
      	subjects as s
      where
      	s.locale = $1 and
      	asu.action_id = any( $2 ) and
      	asu.subject_id = s.id`,
      [ locale, actionIds ]
    );

    const { rows: locations_ } = await super.query(
      `select
        al2.action_id, al2.address, al2.coords,
        l2.name
      from
        actions_locations2 as al2,
        locations2 as l2
      where
        l2.locale = $1 and
        action_id = any( $2 ) and
        al2.location2_id = l2.id`,
      [ locale, actionIds ]
    );

    const { rows: dates } = await super.query(
      `select action_id, date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = any( $1 )`,
      [ actionIds ]
    );

    mergeMultiple( actions, subjects_, "action_id", "subjects", { map, field: "name" } );
    mergeMultiple( actions, locations_, "action_id", "locations", { map, remove: true } );
    mergeMultiple( actions, dates, "action_id", "dates", { map, remove: true } );

    return actions;
  }

  async getOne( allStatuses, id, locale ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const transaction = await super.transaction();

    const main = ( await transaction.query(
      `select
        a.*, at.*
      from
        actions as a,
        actions_translates as at
      where
        ${status}
        a.id = $1 and
        a.id = at.action_id and
        at.locale = $2`,
      [ id, locale ]
    ) ).rows[0];

    if( main === undefined ){
      await transaction.end();

      return super.error( 10 );
    }

    delete main.locale;
    delete main.action_id;

    main.dates = ( await transaction.query(
      `select id, date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = $1
      order by date_start`,
      [ id ]
    ) ).rows;

    main.images = ( await transaction.query(
      `select id, image_url, is_main
      from action_images
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.partners = ( await transaction.query(
      `select id, name, image_url
      from action_partners
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.companions = ( await transaction.query(
      `select c.id, c.name
      from
        actions_companions as ac,
        companions as c
      where
        ac.action_id = $1 and
        c.locale = $2 and
        c.id = ac.companion_id`,
      [ id, locale ]
    ) ).rows;

    main.locations = ( await transaction.query(
      `select l2.id as location_id, l2.name, al2.id, al2.address, al2.coords
      from
        actions_locations2 as al2,
        locations2 as l2
      where
        al2.action_id = $1 and
        l2.locale = $2 and
        l2.id = al2.location2_id`,
      [ id, locale ]
    ) ).rows;

    main.locations2 = main.locations;/*( await transaction.query(
      `select
      	al2.address, al2.coords,
      	l2.id, l2.name
      from
      	actions_locations2 as al2,
      	locations2 as l2
      where
      	al2.action_id = $1 and
      	al2.location2_id = l2.id`,
      [ id ]
    ) ).rows;*/

    main.subjects = ( await transaction.query(
      `select s.id, s.name
      from
        actions_subjects as acsu,
        subjects as s
      where
        acsu.action_id = $1 and
        s.locale = $2 and
        s.id = acsu.subject_id`,
      [ id, locale ]
    ) ).rows;

    main.transfers = ( await transaction.query(
      `select t.id, t.name
      from
        actions_transfers as at,
        transfers as t
      where
        at.action_id = $1 and
        t.locale = $2 and
        t.id = at.transfer_id`,
      [ id, locale ]
    ) ).rows;

    main.excursions = ( await transaction.query(
      `select e.*, et.name
      from
        actions_excursions as ae,
        excursions as e,
        excursions_translates as et
      where
        ae.action_id = $1 and
        et.locale = $2 and
        ae.excursion_id = e.id and
        e.id = et.excursion_id
      order by ae.number`,
      [ id, locale ]
    ) ).rows;

    main.tours = ( await transaction.query(
      `select t.*, tt.name
      from
        actions_tours as at,
        tours as t,
        tours_translates as tt
      where
        at.action_id = $1 and
        tt.locale = $2 and
        at.tour_id = t.id and
        t.id = tt.tour_id
      order by at.number`,
      [ id, locale ]
    ) ).rows;

    main.buyable = ( await transaction.query(
      `select ab.id, ab.type, ab.price, abt.name
      from
        action_buyable as ab,
        action_buyable_translates as abt
      where
        ab.action_id = $1 and
        abt.locale = $2 and
        ab.id = abt.action_buyable_id`,
      [ id, locale ]
    ) ).rows;

    main.hotels = ( await transaction.query(
      `select
      	h.id, h.booking_url, h.name,
        h.image_url, h.price, h.rating
      from
      	actions_hotels as ah,
        hotels as h
      where
      	ah.action_id = $1 and
      	ah.hotel_id = h.id
      order by ah.number`,
      [ id ]
    ) ).rows;

    await transaction.end();

    if( locale !== "ru" ){
      main.locations = main.locations.map( location => {
        if( location.address ) location.address = transliterate( location.address );

        return location;
      } );

      main.partners = main.partners.map( partner => {
        partner.name = transliterate( partner.name );

        return partner;
      } );

      main.hotels = main.hotels.map( hotel => {
        hotel.name = transliterate( hotel.name );

        return hotel;
      } );
    }

    return super.success( 0, main );
  }

  async getOneBySlug( allStatuses, slug, locale ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const transaction = await super.transaction();

    const main = ( await transaction.query(
      `select
        a.*, at.*
      from
        actions as a,
        actions_translates as at
      where
        ${status}
        a.slug = $1 and
        a.id = at.action_id and
        at.locale = $2`,
      [ slug, locale ]
    ) ).rows[0];

    if( main === undefined ){
      await transaction.end();

      return super.error( 10 );
    }

    const id = main.action_id;

    delete main.locale;
    delete main.action_id;

    main.dates = ( await transaction.query(
      `select id, date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = $1
      order by date_start`,
      [ id ]
    ) ).rows;

    main.images = ( await transaction.query(
      `select id, image_url, is_main
      from action_images
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.partners = ( await transaction.query(
      `select id, name, image_url
      from action_partners
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.companions = ( await transaction.query(
      `select c.id, c.name
      from
        actions_companions as ac,
        companions as c
      where
        ac.action_id = $1 and
        c.locale = $2 and
        c.id = ac.companion_id`,
      [ id, locale ]
    ) ).rows;

    main.locations = ( await transaction.query(
      `select l2.id as location_id, l2.name, al2.id, al2.address, al2.coords
      from
        actions_locations2 as al2,
        locations2 as l2
      where
        al2.action_id = $1 and
        l2.locale = $2 and
        l2.id = al2.location2_id`,
      [ id, locale ]
    ) ).rows;

    main.locations2 = main.locations;/*( await transaction.query(
      `select
      	al2.address, al2.coords,
      	l2.id, l2.name
      from
      	actions_locations2 as al2,
      	locations2 as l2
      where
      	al2.action_id = $1 and
      	al2.location2_id = l2.id`,
      [ id ]
    ) ).rows;*/

    main.subjects = ( await transaction.query(
      `select s.id, s.name
      from
        actions_subjects as acsu,
        subjects as s
      where
        acsu.action_id = $1 and
        s.locale = $2 and
        s.id = acsu.subject_id`,
      [ id, locale ]
    ) ).rows;

    main.transfers = ( await transaction.query(
      `select t.id, t.name
      from
        actions_transfers as at,
        transfers as t
      where
        at.action_id = $1 and
        t.locale = $2 and
        t.id = at.transfer_id`,
      [ id, locale ]
    ) ).rows;

    main.excursions = ( await transaction.query(
      `select e.*, et.name
      from
        actions_excursions as ae,
        excursions as e,
        excursions_translates as et
      where
        ae.action_id = $1 and
        et.locale = $2 and
        ae.excursion_id = e.id and
        e.id = et.excursion_id
      order by ae.number`,
      [ id, locale ]
    ) ).rows;

    main.tours = ( await transaction.query(
      `select t.*, tt.name
      from
        actions_tours as at,
        tours as t,
        tours_translates as tt
      where
        at.action_id = $1 and
        tt.locale = $2 and
        at.tour_id = t.id and
        t.id = tt.tour_id
      order by at.number`,
      [ id, locale ]
    ) ).rows;

    main.buyable = ( await transaction.query(
      `select ab.id, ab.type, ab.price, abt.name
      from
        action_buyable as ab,
        action_buyable_translates as abt
      where
        ab.action_id = $1 and
        abt.locale = $2 and
        ab.id = abt.action_buyable_id`,
      [ id, locale ]
    ) ).rows;

    main.hotels = ( await transaction.query(
      `select
      	h.id, h.booking_url, h.name,
        h.image_url, h.price, h.rating
      from
      	actions_hotels as ah,
        hotels as h
      where
      	ah.action_id = $1 and
      	ah.hotel_id = h.id
      order by ah.number`,
      [ id ]
    ) ).rows;

    await transaction.end();

    if( locale !== "ru" ){
      main.locations = main.locations.map( location => {
        if( location.address ) location.address = transliterate( location.address );

        return location;
      } );

      main.partners = main.partners.map( partner => {
        partner.name = transliterate( partner.name );

        return partner;
      } );

      main.hotels = main.hotels.map( hotel => {
        hotel.name = transliterate( hotel.name );

        return hotel;
      } );
    }

    return super.success( 0, main );
  }

  // #fix переделать (???)
  async getOneForEmail( id, locale ){
    const result = ( await super.query(
      `select
        at.name, at.short_description, a.emails, a.phones,
        a.price_min, a.price_max, at.contact_faces
      from
        actions as a,
        actions_translates as at
      where
        a.status = 'active' and
        id = $1 and
        at.locale = $2 and
        a.id = at.action_id`,
      [ id, locale ]
    ) ).rows[0];

    return result !== undefined ? result : null;
  }

  async edit( id, {
    slug, status, organizer_ids,
    site_payment, organizer_payment, emails, phones,
    websites, vk_link, facebook_link, instagram_link,
    twitter_link, instagram_widget_is_show, title, name,
    short_description, full_description,
    organizer_name, contact_faces, alt, instagram_widget_title,
    dates, companions, locations, subjects, transfers
  } ){
    let set = [];
    const params = [ id ];
    let sc = 2;
    const transaction = await super.transaction();
    let translated = {};
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const yandexEngineHTML = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch, { format: "html" } );
    const translator = new Translator( yandexEngine );
    const translatorHTML = new Translator( yandexEngineHTML );

    if( slug ){
      set.push( `slug = $${sc++}` );
      params.push( slug );
    }

    if( status ){
      set.push( `status = $${sc++}` );
      params.push( status );
    }

    if( organizer_ids === null || Array.isArray( organizer_ids ) ){
      set.push( `organizer_ids = $${sc++}::int[]` );
      params.push( organizer_ids );
    }

    if( typeof site_payment === "boolean" ){
      set.push( `site_payment = $${sc++}` );
      params.push( site_payment );
    }

    if( organizer_payment !== undefined && organizer_payment !== "" ){
      set.push( `organizer_payment = $${sc++}` );
      params.push( organizer_payment );
    }

    if( emails === null || Array.isArray( emails ) ){
      set.push( `emails = $${sc++}::character varying[]` );
      params.push( emails );
    }

    if( phones === null || Array.isArray( phones ) ){
      set.push( `phones = $${sc++}::character varying[]` );
      params.push( phones );
    }

    if( websites === null || Array.isArray( websites ) ){
      set.push( `websites = $${sc++}::character varying[]` );
      params.push( websites );
    }

    if( vk_link === null || vk_link ){
      set.push( `vk_link = $${sc++}` );
      params.push( vk_link );
    }

    if( facebook_link === null || facebook_link ){
      set.push( `facebook_link = $${sc++}` );
      params.push( facebook_link );
    }

    if( instagram_link === null || instagram_link ){
      set.push( `instagram_link = $${sc++}` );
      params.push( instagram_link );
    }

    if( twitter_link === null || twitter_link ){
      set.push( `twitter_link = $${sc++}` );
      params.push( twitter_link );
    }

    if( typeof instagram_widget_is_show === "boolean" ){
      set.push( `instagram_widget_is_show = $${sc++}` );
      params.push( instagram_widget_is_show );
    }

    if( set.length > 0 ){
      set = set.join( "," );

      await transaction.query(
        `update actions
        set ${set}
        where id = $1`,
        params
      );
    }

    if( title ){
      const locale = title.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].title = title.text;

      if( title.autoTranslate === true )
        translator.add( "title", title.text, locale, title.toLocales );
    }

    if( name ){
      const locale = name.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].name = name.text;

      if( name.autoTranslate === true )
        translator.add( "name", name.text, locale, name.toLocales );

      if( !slug && !name.toLocales.includes( "en" ) )
        translator.add( "name", name.text, locale, "en" );
    }

    if( short_description ){
      const locale = short_description.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].short_description = short_description.text;

      if( short_description.autoTranslate === true )
        translator.add( "short_description", short_description.text, locale, short_description.toLocales );
    }

    if( full_description ){
      const locale = full_description.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].full_description = full_description.text;

      if( full_description.autoTranslate === true )
        translatorHTML.add( "full_description", full_description.text, locale, full_description.toLocales );
    }

    if( organizer_name ){
      const locale = organizer_name.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].organizer_name = organizer_name.text;

      if( organizer_name.autoTranslate === true ){
        const translited = transliterate( organizer_name.text );

        organizer_name.toLocales.forEach( toLocale => {
          if( translated[ toLocale ] === undefined )
            translated[ toLocale ] = {};

          translated[ toLocale ].organizer_name = translited;
        } );
      }
    }

    if( contact_faces ){
      const locale = contact_faces.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].contact_faces = contact_faces.source;

      if( contact_faces.autoTranslate === true ){
        const translited = contact_faces.source.map( contactFace => transliterate( contactFace ) );

        contact_faces.toLocales.forEach( toLocale => {
          if( translated[ toLocale ] === undefined )
            translated[ toLocale ] = {};

          translated[ toLocale ].contact_faces = translited;
        } );
      }
    }

    if( alt ){
      const locale = alt.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].alt = alt.text;

      if( alt.autoTranslate === true )
        translator.add( "alt", alt.text, locale, alt.toLocales );
    }

    if( instagram_widget_title ){
      const locale = instagram_widget_title.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].instagram_widget_title = instagram_widget_title.text;

      if( instagram_widget_title.autoTranslate === true )
        translator.add( "instagram_widget_title", instagram_widget_title.text, locale, instagram_widget_title.toLocales );
    }

    await translator.translate();
    await translatorHTML.translate();
    translator.transform();
    translatorHTML.transform();

    for( let key in translator.transformed )
      if( translated[ key ] !== undefined )
        translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
      else
        translated[ key ] = translator.transformed[ key ];

    for( let key in translatorHTML.transformed )
      if( translated[ key ] !== undefined )
        translated[ key ] = { ...translated[ key ], ...translatorHTML.transformed[ key ] };
      else
        translated[ key ] = translatorHTML.transformed[ key ];

    for( let key in translated )
      await this.modules.actionsTranslates.createOrEdit( transaction, id, key, translated[ key ] );

    if( !slug && name ) await transaction.query(
      `update actions
      set slug = $1
      where id = $2`,
      [ slugify( translator.translated.name.en ), id ]
    );

    // Action dates
    if( dates ){
      if( dates.del )
        await this.modules.actionDates.del( dates.del, transaction );
      if( dates.edit )
        for( let item of dates.edit )
          await this.modules.actionDates.edit( item.id, item, transaction );
      if( dates.create )
        await this.modules.actionDates.create( id, dates.create, transaction );
    }

    // Actions companions
    if( companions ){
      if( companions.del )
        await this.modules.actionsCompanions.del( id, companions.del, transaction );
      if( companions.edit )
        for( let item of companions.edit )
          await this.modules.actionsCompanions.edit( id, item.oldCompanionId, item.newCompanionId, transaction );
      if( companions.create )
        await this.modules.actionsCompanions.create( id, companions.create, transaction );
    }

    // Actions locations
    if( locations ){
      if( locations.del )
        await this.modules.actionsLocations.del( locations.del, transaction );
      if( locations.edit )
        for( let item of locations.edit )
          await this.modules.actionsLocations.edit( item, transaction );
      if( locations.create )
        await this.modules.actionsLocations.create( id, locations.create, transaction );
    }

    // Actions subjects
    if( subjects ){
      if( subjects.del )
        await this.modules.actionsSubjects.del( id, subjects.del, transaction );
      if( subjects.edit )
        for( let item of subjects.edit )
          await this.modules.actionsSubjects.edit( id, item.oldSubjectId, item.newSubjectId, transaction );
      if( subjects.create )
        await this.modules.actionsSubjects.create( id, subjects.create, transaction );
    }

    // Actions transfers
    if( transfers ){
      if( transfers.del )
        await this.modules.actionsTransfers.del( id, transfers.del, transaction );
      if( transfers.edit )
        for( let item of transfers.edit )
          await this.modules.actionsTransfers.edit( id, item.oldTransferId, item.newTransferId, transaction );
      if( transfers.create )
        await this.modules.actionsTransfers.create( id, transfers.create, transaction );
    }

    return transaction;
  }
}
