"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Filters" );
  }

  async get( locale ){
    const transaction = await super.transaction();

    const locations = ( await transaction.query(
      `select distinct l2.id, l2.n0, l2.n1, l2.n2, l2.name, l2.slug
      from
      	locations2 as l2,
      	actions_locations2 as al2,
      	actions as a
      where
      	l2.locale = $1 and
      	a.status = 'active' and
      	l2.id = al2.location2_id and
      	al2.action_id = a.id
      order by l2.n0, l2.n1, l2.n2`,
      [ locale ]
    ) ).rows;

    const companions = ( await transaction.query(
      `select id, name
      from companions
      where locale = $1
      order by id`,
      [ locale ]
    ) ).rows;

    const subjects = ( await transaction.query(
      `select id, name, slug
      from subjects
      where locale = $1
      order by id`,
      [ locale ]
    ) ).rows;

    const transfers = ( await transaction.query(
      `select id, name
      from transfers
      where locale = $1
      order by id`,
      [ locale ]
    ) ).rows;

    const prices = ( await transaction.query(
      `select
      	coalesce( min( price ), 0 ) as min,
      	coalesce( max( price ), 0 ) as max
      from action_buyable
      where type = 'ticket'`
    ) ).rows;

    await transaction.end();

    return super.success( 0, { locations, companions, subjects, transfers, prices } );
  }
}
