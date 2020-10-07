"use strict";

import { createMap, mergeMultiple } from "/helpers/merger";

export {
  create,
  getAll,
  edit,
  del
};

async function create( client, actionId, before ){
  const check = ( await client.query(
    `select count( 1 ) as count
    from favorites_main`
  ) ).rows[0].count;

  if( check > 3 )
    return `Count of favorites > 3`;

  const params = [ actionId ];

  if( before !== null ){
    const before_ = ( await client.query(
      `select 1
      from favorites_main
      where number = $1`,
      [ before ]
    ) ).rows[0];

    if( before_ === undefined )
      return `Invalid before number (${before})`;

    params.push( before );

    await client.query(
      `update favorites_main
      set number = number + 1
      where number >= $1`,
      [ before ]
    );
  }

  let sql =
    `insert into favorites_main( action_id, number )
    values ( $1, {number} )
    returning id`;

  if( before !== null )
    sql = sql.replace( "{number}", "$2" );
  else
    sql = sql.replace( "{number}",
      `( select coalesce( max( number ), 0 ) + 1
      from favorites_main )`
    );

  try{
    const { rows: [ { id } ] } = await client.query( sql, params );

    return id;
  } catch( e ) {
    if( e.code === "23503" )
      return `Invalid action ID (${actionId})`;

    if( e.code === "23505" )
      return `Item with action ID (${actionId}) already exists`;

    throw e;
  }
}

async function getAll( client, locale, allStatuses ){
  allStatuses = !allStatuses ? "a.status = 'active' and" : "";

  const { rows: main } = await client.query(
    `select
      f.*, a.slug, at.name, at.alt,
      ai.image_url,
      null as locations,
      coalesce( min( ab.price ), 0 ) as price_min,
      coalesce( max( ab.price ), 0 ) as price_max,
      null as dates,
      null as subjects
    from
      favorites_main as f
      left join action_images as ai
      on f.action_id = ai.action_id and ai.is_main = true
      left join action_buyable as ab
      on f.action_id = ab.action_id and ab.type = 'ticket',
      actions as a,
      actions_translates as at
    where
      at.locale = $1 and
      ${allStatuses}
      f.action_id = a.id and
      f.action_id = at.action_id
    group by f.id, a.slug, at.name, at.alt, ai.image_url
    order by f.number`,
    [ locale ]
  );

  const map = createMap( main, "action_id" );
  const actionIds = Object.keys( map );

  const { rows: locations } = await client.query(
    `select al.action_id, al.address, l.name
    from
      actions_locations as al,
      locations as l
    where
      l.locale = $1 and
      al.action_id = any( $2 ) and
      al.location_id = l.id`,
    [ locale, actionIds ]
  );

  const { rows: dates } = await client.query(
    `select action_id, date_start, date_end, time_start, time_end, days
    from action_dates
    where action_id = any( $1 )`,
    [ actionIds ]
  );

  const { rows: subjects } = await client.query(
    `select asu.action_id, s.name
    from
      actions_subjects as asu,
      subjects as s
    where
      s.locale = $1 and
      asu.action_id = any( $2 ) and
      asu.subject_id = s.id`,
    [ locale, actionIds ]
  );

  mergeMultiple( main, locations, "action_id", "locations", { map, remove: true } );
  mergeMultiple( main, dates, "action_id", "dates", { map, remove: true } );
  mergeMultiple( main, subjects, "action_id", "subjects", { map, field: "name" } );

  return main;
}

async function edit( client, id, number, action ){
  const tuple = ( await client.query(
    `select number
    from favorites_main
    where id = $1`,
    [ id ]
  ) ).rows[0];

  if( tuple === undefined )
    return `Invalid ID (${id})`;

  const check = ( await client.query(
    `select 1
    from favorites_main
    where
      number = $1 and
      number != $2`,
    [ number, tuple.number ]
  ) );

  if( check.rowCount === 0 )
    return `Element with number (${number}) not exists or number is same`;

  if( action === "swipe" ){
    await client.query(
      `update favorites_main
      set number = $1
      where number = $2`,
      [ tuple.number, number ]
    );

    await client.query(
      `update favorites_main
      set number = $1
      where id = $2`,
      [ number, id ]
    );
  }
  // #fix add more actions

  return true;
}

async function del( client, id ){
  const row = ( await client.query(
    `delete from favorites_main
    where id = $1
    returning number`,
    [ id ]
  ) ).rows[0];

  if( row === undefined )
    return `Invalid ID (${id})`;

  await client.query(
    `update favorites_main
    set number = number - 1
    where number > $1`,
    [ row.number ]
  );

  return true;
}
