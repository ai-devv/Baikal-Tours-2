"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Transfers" );
  }

  async create( actionId, transferIds, client ){
    if( !Array.isArray( transferIds ) || transferIds.length === 0 )
      return;

    let values = [];
    const params = [ actionId ];
    let i = 2;

    if( client === undefined )
      client = this.modules.pool;

    transferIds.forEach( transferId => {
      values.push( `( $1, $${i++} )` );
      params.push( transferId );
    } );

    values = values.join( "," );

    await client.query(
      `insert into actions_transfers( action_id, transfer_id )
      values ${values}
      on conflict do nothing`,
      params
    );
  }

  async edit( actionId, oldTransferId, newTransferId, client ){
    if( client === undefined )
      client = this.modules.pool;

    await client.query(
      `update actions_transfers
      set transfer_id = $1
      where
        action_id = $2 and
        transfer_id = $3`,
      [ newTransferId, actionId, oldTransferId ]
    );
  }

  async del( actionId, transferIds, client ){
    if( client === undefined )
      client = this.modules.pool;

    await client.query(
      `delete from actions_transfers
      where
        action_id = $1 and
        transfer_id = any( $2::int[] )`,
      [ actionId, transferIds ]
    );
  }
}
