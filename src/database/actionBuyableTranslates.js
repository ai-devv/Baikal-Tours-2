import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Action Buyable Translates" );
  }

  async create( client, actionBuyableId, locale, name ){
    await client.query(
      `insert into action_buyable_translates( action_buyable_id, locale, name )
      values( $1, $2, $3 )`,
      [ actionBuyableId, locale, name ]
    );
  }

  async edit( client, actionBuyableId, locale, name ){
    await client.query(
      `update action_buyable_translates
      set name = $1
      where
        action_buyable_id = $2 and
        locale = $3`,
      [ name, actionBuyableId, locale ]
    );
  }
}
