"use strict";

import { toInt } from "/helpers/converters";
import { createMap, mergeMultiple } from "/helpers/merger";

export async function get( {
  session: { isLogged, locale, role, userId },
  params,
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const id = toInt( params.id );

  if( typeof id !== "number" || id < 1 )
    return res.error( 13 );

  if( role !== "admin" && id !== userId )
    return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: actions } = await transaction.query(
    `select
      a.id, a.slug, at.name, at.alt, a.balance,
      null as locations,
      null as dates,
      null as buyable,
      count( ar.id ) as reservations_count
    from
    	actions as a
      left join action_reservations as ar
      on a.id = ar.action_id
      left join action_dates as ad
      on a.id = ad.action_id,
      actions_translates as at
    where
    	at.locale = $1 and
    	not array_position( a.organizer_ids, $2 ) is null and
    	a.id = at.action_id
    group by a.id, a.slug, at.name, at.alt, ad.date_start
    order by ad.date_start`,
    [ locale, id ]
  );

  const map = createMap( actions, "id" );
  const actionIds = Object.keys( map );

  const { rows: locations } = await transaction.query(
    `select al2.action_id, l2.name, al2.address
    from
    	actions_locations2 as al2,
      locations2 as l2
    where
    	l2.locale = $1 and
      al2.location2_id = l2.id and
      al2.action_id = any( $2 )`,
    [ locale, actionIds ]
  );

  const { rows: dates } = await transaction.query(
    `select
    	action_id, date_start, date_end,
      time_start, time_end, days
    from action_dates as ad
    where ad.action_id = any( $1 )`,
    [ actionIds ]
  );

  const { rows: buyable } = await transaction.query(
    `select
    	ab.id as action_buyable_id,
      ab.action_id, ab.price, ab.type,
      null as count,
      abt.name
    from
    	action_buyable as ab,
      action_buyable_translates as abt
    where
    	abt.locale = $1 and
      ab.action_id = any( $2 ) and
      ab.id = abt.action_buyable_id`,
    [ locale, actionIds ]
  );

  const buyableMap = createMap( buyable, "action_buyable_id" );
  const actionBuyableIds = Object.keys( buyableMap );

  const { rows: buyableCount } = await transaction.query(
    `select
    	ar.paid, arb.action_buyable_id,
      sum( arb.count )::int as count
    from
    	action_reservations as ar,
      action_reservations_buyable as arb
    where
    	arb.action_buyable_id = any( $1 ) and
      ar.id = arb.action_reservation_id
    group by ar.paid, arb.action_buyable_id`,
    [ actionBuyableIds ]
  );

  await transaction.query( "commit" );
  transaction.release();

  mergeMultiple( actions, locations, "action_id", "locations", { remove: true, map } );
  mergeMultiple( actions, dates, "action_id", "dates", { remove: true, map } );
  mergeMultiple( buyable, buyableCount, "action_buyable_id", "count", { remove: true, map: buyableMap } );
  mergeMultiple( actions, buyable, "action_id", "buyable", { remove: true, map } );

  res.success( 0, actions );
}
