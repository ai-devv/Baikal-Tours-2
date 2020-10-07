"use strict";

import isValidActionDate from "/helpers/isValidActionDate";
import { create, getByUserId } from "/database/actionReservations";
import { toInt } from "/helpers/converters";
import { createMap, mergeSingle, mergeMultiple } from "/helpers/merger";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";
import { get as getCron } from "/cron/index";

export async function post( req, res ){
  const { userId, actionId, name, surname, phone, email } = req.body;
  let { date, buyable } = req.body;

  if( !req.session.isLogged )
    return res.json( {
      ok: false,
      message: "Unauthorized"
    } );

  if(
    typeof userId !== "number" || userId < 1 ||
    typeof actionId !== "number" || actionId < 1 ||
    typeof name !== "string" || name === "" ||
    typeof surname !== "string" || surname === "" ||
    typeof phone !== "string" || phone === "" ||
    typeof email !== "string" || email === "" ||
    typeof date !== "string" || date === ""
  ) return res.error( 13 );

  if( req.session.role !== "admin" && userId !== req.session.userId )
    return res.error( 12 );

  date = new Date( date );

  const transaction = await req.database.pool.connect();

  await transaction.query( "begin" );

  const { rows: [ { organizer_payment } ] } = await transaction.query(
    `select organizer_payment
    from actions
    where id = $1`,
    [ actionId ]
  );

  if( typeof organizer_payment === "string" && organizer_payment !== "" ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Payment on the organizer (${organizer_payment}) site`
    } );
  }

  const actionDates = await req.database.actionDates.getByActionId( transaction, actionId );

  if(
    actionDates.length > 0 &&
    !actionDates.some( actionDate => isValidActionDate( actionDate, date ) )
  ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.error( 18 );
  }

  if(
    !Array.isArray( buyable ) ||
    buyable.length === 0 ||
    !buyable.every( el => el !== null && typeof el === "object" && !Array.isArray( el ) )
  ){
    const { rowCount } = await transaction.query(
      `select 1
      from action_buyable
      where
        action_id = $1 and
        type = 'ticket'`,
      [ actionId ]
    );

    if( rowCount > 0 ){
      await transaction.query( "rollback" );
      transaction.release();

      return res.json( {
        ok: false,
        message: "Tickets must be sended for this action"
      } );
    }

    buyable = null;
  }

  const result = await create( transaction, userId, actionId, name, surname, phone, email, date, buyable );

  if( buyable ){
    const taskId = await getCron().add( "notificationAboutUnpaidReservation", {
      // #fix вынести
      timestamp: Math.floor( Date.now() / 1000 ) + 4 * 60 * 60,
      settings: {
        success: { limit: {
          value: 1,
          action: "delete"
        } },
        error: {
          limit: {
            value: 6,
            action: "delete"
          },
          timeModifierSettings: [ "basic", 10 ]
        },
        onExpires: "run"
      },
      params: { actionReservationId: result }
    }, transaction );

    await transaction.query(
      `update action_reservations
      set task_id = $1
      where id = $2`,
      [ taskId, result ]
    );
  }

  await transaction.query( "commit" );
  await transaction.release();

  const templateName = "eventRegistration";
  // #fix проверка
  const filler = fillers[ templateName ];
  // #fix проверка
  const template = await getTemplate( templateName );
  // #fix проверка
  const { [ req.session.locale ]: texts } = await getTemplateTexts( req.database.pool, [ req.session.locale ], templateName );

  const { rows: [ { action_name } ] } = await req.database.pool.query(
    `select name as action_name
    from actions_translates
    where
      locale = $1 and
      action_id = $2`,
    [ req.session.locale, actionId ]
  );

  const locations = ( await req.database.pool.query(
    `select
    	l2.name ||
    	case
  			when al2.address is null then ''
  			else ', ' || al2.address
  		end as location
    from
    	actions_locations2 as al2,
    	locations2 as l2
    where
    	l2.locale = $1 and
    	al2.action_id = $2 and
    	al2.location2_id = l2.id`,
    [ req.session.locale, actionId ]
  ) ).rows.map( ( { location } ) => location );

  const mail = filler( template, texts, {
    userName: `${name} ${surname}`,
    eventName: action_name,
    eventLocations: locations,
    eventDate: date,
    domain: process.env.SELF_URL
  } );

  req.mail.send(
    email,
    req._( "action_register_success" ),
    "",
    mail
  );

  res.success( 0, result );
}

export async function get( {
  session: { isLogged, locale, userId, role },
  query,
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const userId_ = toInt( query.userId );

  if( typeof userId_ !== "number" || userId_ < 1 )
    return res.error( 13 );

  if( role !== "admin" && userId !== userId_ )
    return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const reservations = await getByUserId( transaction, locale, userId_ );
  const map = createMap( reservations, "action_id" );
  const actionIds = Object.keys( map );
  const actionReservationsIds = [];

  reservations.forEach( reservation => {
    if( !actionReservationsIds.includes( reservation.action_reservation_id ) )
      actionReservationsIds.push( reservation.action_reservation_id );

    reservation.image_url = null;
    reservation.locations = null;
    reservation.buyable = null;
  } );

  const { rows: images } = await transaction.query(
    `select action_id, image_url
    from action_images
    where
      action_id = any( $1 ) and
      is_main = true`,
    [ actionIds ]
  );

  const { rows: locations } = await transaction.query(
    `select al.action_id, l.name, al.address
    from
    	actions_locations as al,
      locations as l
    where
    	l.locale = $1 and
    	action_id = any( $2 ) and
      al.location_id = l.id`,
    [ locale, actionIds ]
  );

  const { rows: buyable } = await transaction.query(
    `select arb.action_reservation_id, arb.count, ab.price, ab.type, abt.name
    from
    	action_reservations_buyable as arb,
      action_buyable as ab,
      action_buyable_translates as abt
    where
    	abt.locale = $1 and
    	action_reservation_id = any( $2 ) and
      arb.action_buyable_id = ab.id and
      ab.id = abt.action_buyable_id`,
    [ locale, actionReservationsIds ]
  );

  await transaction.query( "commit" );
  await transaction.release();

  mergeSingle( reservations, images, "action_id", "image_url", { field: ".", map } );
  mergeMultiple( reservations, locations, "action_id", "locations", { remove: true, map } );
  mergeMultiple( reservations, buyable, "action_reservation_id", "buyable", { remove: true } );

  res.success( 0, reservations );
}
