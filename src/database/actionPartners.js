"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Action Partners" );
  }

  async create( actionId, name, imageUrl ){
    const transaction = await super.transaction();

    if( typeof name !== "string" || name === "" )
      name = null;

    const id = ( await transaction.query(
      `insert into action_partners( action_id, name, image_url )
      values( $1, $2, $3 )
      returning id`,
      [ actionId, name, imageUrl ]
    ) ).rows[0].id;

    return { transaction, id };
  }

  async get( id, client ){
    if( client === undefined ) client = this;

    const row = ( await client.query(
      `select *
      from action_partners
      where id = $1`,
      [ id ]
    ) ).rows[0];

    return row ? row : null;
  }

  async edit( id, name ){
    const transaction = await super.transaction();

    await transaction.query(
      `update action_partners
      set name = $1
      where id = $2`,
      [ name, id ]
    );

    return transaction;
  }

  async delete( id ){
    const transaction = await super.transaction();

    const row = ( await transaction.query(
      `delete from action_partners
      where id = $1
      returning image_url`,
      [ id ]
    ) ).rows[0];

    if( !row ){
      await transaction.end();

      return null;
    }

    const imageUrl = row.image_url;

    return { transaction, imageUrl };
  }
}
