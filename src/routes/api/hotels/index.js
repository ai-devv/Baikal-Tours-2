"use strict";

import { transliterate } from "transliteration";
import { toInt, toIntArray, toFloat } from "/helpers/converters";
import { create, getAll } from "/database/hotels";

export {
  post,
  get
};

async function post( {
  body: { bookingUrl, bookingLocationId, name, price, rating },
  database: { pool }
}, res ){
  if( typeof name !== "string" || name === "" )
    return res.error( 13 );

  if( typeof bookingUrl !== "string" || bookingUrl === "" )
    bookingUrl = null;

  if( !Number.isInteger( bookingLocationId ) || bookingLocationId < 1 )
    bookingLocationId = null;

  if( !Number.isInteger( price ) || price < 1 )
    price = null;

  if( typeof rating !== "number" || rating < 1 || rating > 10 )
    rating = null;

  const result = await create( pool, bookingUrl, bookingLocationId, name, price, rating );

  if( typeof result === "object" )
    return res.json( result );

  res.success( 0, result );
}

async function get( {
  query,
  database: { pool },
  session: { locale }
}, res ){
  let count = toInt( query.count );
  let offset = toInt( query.offset );
  let { search } = query;
  let locationIds = toIntArray( query.locationIds );
  let bookingLocationIds = toIntArray( query.bookingLocationIds );

  if( typeof search === "string" && search !== "" )
    search = search.split( "," ).map( el => `%${el}%` );
  else
    search = null;

  const data = await getAll( pool, count, offset, search, locationIds, bookingLocationIds );

  if( locale !== "ru" ) data.hotels = data.hotels.map( el => {
    el.name = transliterate( el.name );
    el.booking_location_name = transliterate( el.booking_location_name );

    return el;
  } );

  res.json( data );
}
