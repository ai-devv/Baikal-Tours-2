"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Excursions Translates" );
  }

  async create( client, excursionId, locale, name ){
    await client.query(
      `insert into excursions_translates( excursion_id, locale, name )
      values( $1, $2, $3 )`,
      [ excursionId, locale, name ]
    );
  }

  async createOrEdit( client, excursionId, locale, name ){
    await client.query(
      `insert into excursions_translates( excursion_id, locale, name )
      values( $1, $2, $3 )
      on conflict ( excursion_id, locale ) do update
      set name = excluded.name`,
      [ excursionId, locale, name ]
    );
  }
}
