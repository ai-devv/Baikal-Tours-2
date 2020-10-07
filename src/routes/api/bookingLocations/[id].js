"use strict";

import { toInt } from "/helpers/converters";
import { edit } from "/database/bookingLocations";

export {
  put
};

async function put( {
  params: { id },
  body: { location2Id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if(
    location2Id !== null &&
    ( !Number.isInteger( location2Id ) || location2Id < 1 )
  ) return res.error( 13 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const result = await edit( transaction, id, location2Id );

  if( result !== true ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( { errors: [ result ] } );
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
