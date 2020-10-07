"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Subjects" );
  }

  async create( data, slug ){
    const transaction = await super.transaction();

    for( let locale in data )
      await transaction.query(
        `insert into subjects( id, name, slug, locale )
        values( (
          select max( id ) + 1
          from subjects
          where locale = $1
        ), $2, $3, $1 )`,
        [ locale, data[ locale ], slug ]
      );

    await transaction.end();

    return super.success();
  }

  async getAll( locale ){
    const rows = ( await super.query(
      `select *
      from subjects
      where locale = $1
      order by id`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async edit( id, { translated, slug } ){
    const transaction = await super.transaction();

    if( translated ) for( const locale in translated ){
      const name = translated[ locale ];
      const { rowCount } = await transaction.query(
        `update subjects
        set name = $1
        where
          locale = $2 and
          id = $3`,
        [ name, locale, id ]
      );

      if( rowCount === 0 ){
        await transaction.end( false );

        return `Invalid pair ID (${id}) and locale (${locale})`;
      }
    }

    if( slug ){
      const { rowCount } = await transaction.query(
        `update subjects
        set slug = $1
        where id = $2`,
        [ slug, id ]
      );

      if( rowCount === 0 ){
        await transaction.end( false );

        return `Invalid ID (${id})`;
      }
    }

    await transaction.end();

    return true;
  }

  async del( id ){
    await super.query(
      `delete from subjects
      where id = $1`,
      [ id ]
    );

    return super.success();
  }
}
