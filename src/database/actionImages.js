"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Action Images" );
  }

  async create( actionId, paths, main ){
    if( !Array.isArray( paths ) || paths.length === 0 )
      return super.success();

    let values = [];
    const params = [ actionId ];
    let i = 2;
    const transaction = await super.transaction();

    paths.forEach( path => {
      values.push( `( $1, $${i++} )` );
      params.push( path );
    } );

    values = values.join( "," );

    const ids = ( await transaction.query(
      `insert into action_images( action_id, image_url )
      values ${values}
      returning id`,
      params
    ) ).rows.map( row => row.id );

    return { transaction, ids };
  }

  async setMain( id ){
    const transaction = await super.transaction();

    await transaction.query(
      `update action_images
      set is_main = false
      where
        action_id = (
          select action_id
          from action_images
          where id = $1
        ) and
        is_main = true`,
      [ id ]
    );

    await transaction.query(
      `update action_images
      set is_main = true
      where id = $1`,
      [ id ]
    );

    return transaction;
  }

  async get( id, client ){
    if( client === undefined ) client = this.modules.pool;

    const row = ( await client.query(
      `select *
      from action_images
      where id = $1`,
      [ id ]
    ) ).rows[0];

    return row ? row : null;
  }

  async delete( id ){
    const transaction = await super.transaction();

    const rows = ( await transaction.query(
      `delete from action_images
      where id = $1
      returning image_url`,
      [ id ]
    ) ).rows;

    if( rows.length === 0 ){
      await transaction.end();

      return null;
    }

    const imageUrl = rows[0].image_url;

    return { transaction, imageUrl };
  }
}
