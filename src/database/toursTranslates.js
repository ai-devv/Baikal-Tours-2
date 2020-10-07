"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Tours Translates" );
  }

  async create( client, tourId, locale, name ){
    await client.query(
      `insert into tours_translates( tour_id, locale, name )
      values( $1, $2, $3 )`,
      [ tourId, locale, name ]
    );
  }

  async createOrEdit( client, tourId, locale, name ){
    await client.query(
      `insert into tours_translates( tour_id, locale, name )
      values( $1, $2, $3 )
      on conflict ( tour_id, locale ) do update
      set name = excluded.name`,
      [ tourId, locale, name ]
    );
  }
}
