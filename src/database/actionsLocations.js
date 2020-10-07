"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Locations" );
  }

  async create( actionId, data, client ){
    if( !Array.isArray( data ) || data.length === 0 )
      return;

    const values = [];
    const params = [ actionId ];
    let i = 2;

    data.forEach( ( { locationId, address, coords } ) => {
      const values2 = [ "$1", `$${i++}` ];

      params.push( locationId );

      if( address === null || typeof address === "string" ){
        values2.push( `$${i++}` );
        params.push( address );
      }
      else values2.push( "null" );

      if( coords === null || Array.isArray( coords ) ){
        values2.push( `$${i++}` );
        params.push( coords );
      }
      else values2.push( "null" );

      values.push( `(${values2.join( "," )})` );
    } );

    if( client === undefined ) client = this.modules.pool;

    await client.query(
      `insert into actions_locations2( action_id, location2_id, address, coords )
      values ${values}`,
      params
    );
  }

  async edit( { actionLocationId, locationId, address, coords }, client ){
    let sets = [];
    const params = [ actionLocationId ];
    let i = 2;

    if( typeof locationId === "number" ){
      sets.push( `location2_id = $${i++}` );
      params.push( locationId );
    }

    if( address === null || typeof address === "string" ){
      sets.push( `address = $${i++}` );
      params.push( address );
    }

    if( coords === null || Array.isArray( coords ) ){
      sets.push( `coords = $${i++}` );
      params.push( coords );
    }

    if( sets.length === 0 ) return;
    if( client === undefined ) client = this.modules.pool;

    sets = sets.join( "," );

    await client.query(
      `update actions_locations2
      set ${sets}
      where id = $1`,
      params
    );
  }

  async del( actionLocationIds, client ){
    if( !Array.isArray( actionLocationIds ) || actionLocationIds.length === 0 ) return;

    if( client === undefined ) client = this.modules.pool;

    await client.query(
      `delete from actions_locations2
      where id = any( $1 )`,
      [ actionLocationIds ]
    );
  }
}
