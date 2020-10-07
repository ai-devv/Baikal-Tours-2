"use strict";

import Foundation from "./helpers/foundation";
import { createMap, mergeMultiple } from "/helpers/merger";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Favorites" );
  }

  async create( subjectId, actionId, before ){
    const transaction = await super.transaction();

    const check = ( await transaction.query(
      `select count( 1 ) as count
      from favorites
      where subject_id = $1`,
      [ subjectId ]
    ) ).rows[0].count;

    if( check > 3 ){
      await transaction.end();

      return super.error( 17 );
    }

    const params = [ subjectId, actionId ];

    if( typeof before === "number" && before > 0 ){
      const before_ = ( await transaction.query(
        `select 1
        from favorites
        where
          subject_id = $1 and
          number = $2`,
        [ subjectId, before ]
      ) ).rows[0];

      if( before_ === undefined )
        return super.error();

      params.push( before );

      await transaction.query(
        `update favorites
        set number = number + 1
        where
          subject_id = $1 and
          number >= $2`,
        [ subjectId, before ]
      );
    }

    let sql =
      `insert into favorites( subject_id, action_id, number )
      values ( $1, $2, {number} )
      returning id`;

    if( typeof before === "number" && before > 0 )
      sql = sql.replace( "{number}", "$3" );
    else
      sql = sql.replace( "{number}",
        `( select
          case
            when max( number ) is null then 1
            else max( number + 1 )
          end
        from favorites
        where subject_id = $1 )`
      );

    const id = ( await transaction.query( sql, params ) ).rows[0].id;
    await transaction.end();

    return super.success( 0, id );
  }

  async get( locale, subjectIds, allStatuses ){
    const transaction = await super.transaction();
    let filters = [];
    const params = [ locale ];

    if( subjectIds !== null ){
      filters.push( "f.subject_id = any( $2 )" );
      params.push( subjectIds );
    }

    if( !allStatuses ){
      filters.push( `a.status = 'active'` );
    }

    if( filters.length > 0 ){
      filters = `${filters.join( " and " )} and`;
    } else {
      filters = "";
    }

    const { rows: main } = await transaction.query(
      `select
        f.*, a.slug, at.name, at.alt,
        ai.image_url,
        null as locations,
        null as dates,
        null as subjects
      from
      	favorites as f
        left join action_images as ai
        on f.action_id = ai.action_id and ai.is_main = true,
      	actions as a,
        actions_translates as at
      where
      	at.locale = $1 and
        ${filters}
        f.action_id = a.id and
      	f.action_id = at.action_id
      order by f.subject_id, f.number`,
      params
    );

    const map = createMap( main, "action_id" );
    const actionIds = Object.keys( map );

    const { rows: locations } = await transaction.query(
      `select al.action_id, al.address, l.name
      from
      	actions_locations as al,
      	locations as l
      where
      	l.locale = $1 and
      	al.action_id = any( $2 ) and
      	al.location_id = l.id`,
      [ locale, actionIds ]
    );

    const { rows: dates } = await transaction.query(
      `select action_id, date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = any( $1 )`,
      [ actionIds ]
    );

    const { rows: subjects } = await transaction.query(
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

    mergeMultiple( main, locations, "action_id", "locations", { map, remove: true } );
    mergeMultiple( main, dates, "action_id", "dates", { map, remove: true } );
    mergeMultiple( main, subjects, "action_id", "subjects", { map, field: "name" } );

    await transaction.end();

    return main;
  }

  async edit( id, number, action ){
    const transaction = await super.transaction();

    const tuple = ( await transaction.query(
      `select subject_id, number
      from favorites
      where id = $1`,
      [ id ]
    ) ).rows[0];

    if( tuple === undefined ){
      await transaction.end();

      return super.error();
    }

    const check = ( await transaction.query(
      `select 1
      from favorites
      where
        subject_id = $1 and
        number = $2 and
        number != $3`,
      [ tuple.subject_id, number, tuple.number ]
    ) );

    if( check.rowCount === 0 ){
      await transaction.end();

      return super.error();
    }

    if( action === "swipe" ){
      await transaction.query(
        `update favorites
        set number = $1
        where
          subject_id = $2 and
          number = $3`,
        [ tuple.number, tuple.subject_id, number ]
      );

      await transaction.query(
        `update favorites
        set number = $1
        where id = $2`,
        [ number, id ]
      );
    } else {
      let sign;
      let newNumber;
      const params = [ tuple.subject_id ];

      if( tuple.number > number ){
        sign = "+";

        if( action === "before" )
          newNumber = number;
        else
          newNumber = number + 1;

        params.push( newNumber );
        params.push( tuple.number );
      } else {
        sign = "-";
        params.push( tuple.number + 1 );

        if( action === "before" )
          newNumber = number - 1;
        else
          newNumber = number;

        params.push( newNumber );
      }

      await transaction.query(
        `update favorites
        set number = number ${sign} 1
        where
          subject_id = $1 and
          number between $2 and $3`,
        params
      );

      await transaction.query(
        `update favorites
        set number = $1
        where id = $2`,
        [ newNumber, id ]
      );
    }

    await transaction.end();

    return super.success();
  }

  async delete( id ){
    const transaction = super.transaction();

    const row = ( await transaction.query(
      `delete from favorites
      where id = $1
      returning subject_id, number`,
      [ id ]
    ) ).rows[0];

    if( row === undefined ){
      await transaction.end();

      return super.success();
    }

    const { subject_id: subjectId, number } = row;

    await transaction.query(
      `update favorites
      set number = number - 1
      where
        subject_id = $1 and
        number > $2`,
      [ subjectId, number ]
    );

    await transaction.end();

    return super.success();
  }
}
