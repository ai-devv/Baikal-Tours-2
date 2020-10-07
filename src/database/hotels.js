"use strict";

import { toInt, toFloat } from "/helpers/converters";

export {
  create,
  getAll,
  getById,
  edit,
  remove
};

async function create( client, bookingUrl, bookingLocationId, name, price, rating ){
  try{
    const { rows: [ { id } ] } = await client.query(
      `insert into hotels( booking_url, booking_location_id, name, price, rating )
      values( $1, $2, $3, $4, $5 )
      returning id`,
      [ bookingUrl, bookingLocationId, name, price, rating ]
    );

    return id;
  } catch( e ) {
    if( e.code === "23503" )
      return { errors: [ e.detail ] };

    throw e;
  }
}

async function getAll( client, count, offset, search, locationIds, bookingLocationIds ){
  let filters = [];
  const params = [];
  let i = 1;
  let count_ = 0;

  count !== null ? count = `limit ${count}` : count = "";
  offset !== null ? offset = `offset ${offset}` : offset = "";

  if( search !== null ){
    filters.push( `h.name ilike any( $${i++} )` );
    params.push( search );
  }

  if( locationIds !== null ){
    filters.push( `bl.location2_id = any( $${i++} )` );
    params.push( locationIds );
  }

  if( bookingLocationIds !== null ){
    filters.push( `h.booking_location_id = any( $${i++} )` );
    params.push( bookingLocationIds );
  }

  if( filters.length > 0 )
    filters = `where ${filters.join( " and ")}`;
  else
    filters = "";

  const { rowCount, rows } = await client.query(
    `select
      h.id, h.booking_url, h.name, h.image_url, h.price, h.rating,
      bl.id as booking_location_id,
      bl.name as booking_location_name,
      count( 1 ) over ()
    from
      hotels as h
      left join booking_locations as bl
      on h.booking_location_id = bl.id
    ${filters}
    order by id
    ${count}
    ${offset}`,
    params
  );

  if( rowCount > 0 ){
    count_ = rows[0].count;
    rows.forEach( row => delete row.count );
  }

  return {
    hotels: rows,
    count: count_
  };
}

async function getById( client, id ){
  const { rows: [ row ] } = await client.query(
    `select
      h.booking_url, h.name, h.image_url, h.price, h.rating,
      bl.id as booking_location_id,
      bl.name as booking_location_name
    from
      hotels as h
      left join booking_locations as bl
      on h.booking_location_id = bl.id
    where
      h.id = $1`,
    [ id ]
  );

  return row;
}

async function edit( client, id, { bookingUrl, bookingLocationId, name, price, rating } ){
  let sets = [];
  const params = [ id ];
  let i = 2;

  price = toInt( price );
  rating = toFloat( rating );

  if( typeof bookingUrl === "string" && bookingUrl !== "" ){
    sets.push( `booking_url = $${i++}` );
    params.push( bookingUrl );
  }

  if( Number.isInteger( bookingLocationId ) && bookingLocationId > 0 ){
    sets.push( `booking_location_id = $${i++}` );
    params.push( bookingLocationId );
  }

  if( typeof name === "string" && name !== "" ){
    sets.push( `name = $${i++}` );
    params.push( name );
  }

  if( price !== null && price > 0 ){
    sets.push( `price = $${i++}` );
    params.push( price );
  }

  if( rating !== null && rating >= 1 && rating <= 10 ){
    sets.push( `rating = $${i++}` );
    params.push( rating );
  }

  if( sets.length > 0 ){
    sets = sets.join( "," );

    const { rowCount } = await client.query(
      `update hotels
      set ${sets}
      where id = $1
      returning 1`,
      params
    );

    if( rowCount === 0 )
      return { errors: [ `Hotel not found (${id})` ] };
  }

  return true;
}

async function remove( client, id ){
  const { rows: [ row ] } = await client.query(
    `delete from hotels
    where id = $1
    returning image_url`,
    [ id ]
  );

  if( row === undefined )
    return { errors: [ `Invalid hotel (${id})` ] };

  return row.image_url;
}
