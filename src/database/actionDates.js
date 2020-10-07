"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Action dates" );
  }

  async create( actionId, data, client ){
    if( !Array.isArray( data ) || data.length === 0 )
      return;

    let values = [];
    const params = [ actionId ];
    let i = 2;

    data.forEach( ( { dateStart, dateEnd, timeStart, timeEnd, days } ) => {
      const values2 = [ "$1" ];
      let fl = false;

      if( dateStart === null || typeof dateStart === "string" ){
        values2.push( `$${i++}` );
        params.push( dateStart );
        fl = true;
      }
      else values2.push( "null" );

      if( dateEnd === null || typeof dateEnd === "string" ){
        values2.push( `$${i++}` );
        params.push( dateEnd );
        fl = true;
      }
      else values2.push( "null" );

      if( timeStart === null || typeof timeStart === "string" ){
        values2.push( `$${i++}` );
        params.push( timeStart );
        fl = true;
      }
      else values2.push( "null" );

      if( timeEnd === null || typeof timeEnd === "string" ){
        values2.push( `$${i++}` );
        params.push( timeEnd );
        fl = true;
      }
      else values2.push( "null" );

      if( days === null || days ){
        values2.push( `$${i++}::int[]` );
        params.push( days );
        fl = true;
      }
      else values2.push( "null" );

      if( fl ) values.push( `(${values2.join( "," )})` );
    } );

    if( values.length > 0 ){
      if( client === undefined ) client = this.modules.pool;

      values = values.join( "," );

      await client.query(
        `insert into action_dates( action_id, date_start, date_end, time_start, time_end, days )
        values ${values}`,
        params
      );
    }
  }

  async getByActionId( client, actionId ){
    const { rows } = await client.query(
      `select *
      from action_dates
      where action_id = $1`,
      [ actionId ]
    );

    return rows;
  }

  async edit( id, { dateStart, dateEnd, timeStart, timeEnd, days }, client ){
    let sets = [];
    let params = [ id ];
    let i = 2;

    if( dateStart === null || typeof dateStart === "string" ){
      sets.push( `date_start = $${i++}` );
      params.push( dateStart );
    }

    if( dateEnd === null || typeof dateEnd === "string" ){
      sets.push( `date_end = $${i++}` );
      params.push( dateEnd );
    }

    if( timeStart === null || typeof timeStart === "string" ){
      sets.push( `time_start = $${i++}` );
      params.push( timeStart );
    }

    if( timeEnd === null || typeof timeEnd === "string" ){
      sets.push( `time_end = $${i++}` );
      params.push( timeEnd );
    }

    if( days === null || days ){
      sets.push( `days = $${i++}` );
      params.push( days );
    }

    if( sets.length > 0 ){
      if( client === undefined ) client = this.modules.pool;

      sets = sets.join( "," );

      await client.query(
        `update action_dates
        set ${sets}
        where id = $1`,
        params
      );
    }
  }

  async del( ids, client ){
    if( ids && ids.length > 0 ){
      if( client === undefined ) client = this.modules.pool;

      await client.query(
        `delete from action_dates
        where id = any( $1::int[] )`,
        [ ids ]
      );
    }
  }
}
