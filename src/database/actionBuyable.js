import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Action Buyable" );
  }

  async create( actionId, type, price ){
    const transaction = await super.transaction();

    const id = ( await transaction.query(
      `insert into action_buyable( action_id, type, price )
      values( $1, $2, $3 )
      returning id`,
      [ actionId, type, price ]
    ) ).rows[0].id;

    return { transaction, id };
  }

  async edit( client, id, price ){
    await client.query(
      `update action_buyable
      set price = $1
      where id = $2`,
      [ price, id ]
    );
  }

  async delete( id ){
    await super.query(
      `delete from action_buyable
      where id = $1`,
      [ id ]
    );

    return super.success();
  }
}
