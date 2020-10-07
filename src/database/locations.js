"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Locations" );
  }

  async getAll( locale, location2name ){
    let fields = "";
    let from = "";

    if( location2name ){
      fields = ", l2.name as location2_name";
      from = "left join locations2 as l2 on l2.id = l.location2_id";
    }

    const rows = ( await super.query(
      `select l.id, l.name${fields}
      from locations as l ${from}
      where locale = $1
      order by l.id`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async edit( id, location2Id ){
    const transaction = await super.transaction();

    try{
      if( location2Id !== null ) await transaction.query(
        `update locations
        set location2_id = null
        where location2_id = $1`,
        [ location2Id ]
      );

      const { rowCount } = await transaction.query(
        `update locations
        set location2_id = $1
        where id = $2`,
        [ location2Id, id ]
      );

      if( rowCount === 0 ){
        await transaction.end( false );

        return `Invalid ID (${id})`;
      }

      await transaction.end();

      return true;
    } catch( e ) {
      await transaction.end( false );

      if( e.code === "23503" )
        return `Invalid location2 ID (${location2Id})`;

      throw e;
    }
  }
}
