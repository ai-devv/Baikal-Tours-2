"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Companions" );
  }

  async create( actionId, companionIds, client ){
    if( !Array.isArray( companionIds ) || companionIds.length === 0 )
      return;

    let values = [];
    const params = [ actionId ];
    let i = 2;

    if( client === undefined )
      client = this.modules.pool;

    companionIds.forEach( companionId => {
      values.push( `( $1, $${i++} )` );
      params.push( companionId );
    } );

    values = values.join( "," );

    await client.query(
      `insert into actions_companions( action_id, companion_id )
      values ${values}
      on conflict do nothing`,
      params
    );
  }

  async edit( actionId, oldCompanionId, newCompanionId, client ){
    if( client === undefined )
      client = this.modules.pool;

    await client.query(
      `update actions_companions
      set companion_id = $1
      where
        action_id = $2 and
        companion_id = $3`,
      [ newCompanionId, actionId, oldCompanionId ]
    );
  }

  async del( actionId, companionIds, client ){
    if( client === undefined )
      client = this.modules.pool;

    await client.query(
      `delete from actions_companions
      where
        action_id = $1 and
        companion_id = any( $2::int[] )`,
      [ actionId, companionIds ]
    );
  }
}
