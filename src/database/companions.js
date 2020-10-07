"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Companions" );
  }

  async create( data ){
    const transaction = await super.transaction();

    for( let locale in data )
      await transaction.query(
        `insert into companions( id, name, locale )
        values( (
          select max( id ) + 1
          from companions
          where locale = $1
        ), $2, $1 )`,
        [ locale, data[ locale ] ]
      );

    await transaction.end();

    return super.success();
  }

  async getAll( locale ){
    const rows = ( await super.query(
      `select id, name
      from companions
      where locale = $1
      order by id`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async edit( id, data ){
    const transaction = await super.transaction();

    for( let locale in data )
      await transaction.query(
        `insert into companions( id, name, locale )
        values( $1, $2, $3 )
        on conflict ( id, locale ) do update
        set name = excluded.name`,
        [ id, data[ locale ], locale ]
      );

    await transaction.end();

    return super.success();
  }

  async del( id ){
    await super.query(
      `delete from companions
      where id = $1`,
      [ id ]
    );

    return super.success();
  }
}
