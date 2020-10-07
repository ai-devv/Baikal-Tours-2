"use strict";

import { toInt } from "/helpers/converters";
import { create } from "/database/actionsHotels";

export {
  post
};

async function post( {
  params: { id },
  body: { hotelId, before },
  database: { pool }
}, res ){
  const actionId = toInt( id );

  if(
    !Number.isInteger( actionId ) || actionId < 1 ||
    !Number.isInteger( hotelId ) || hotelId < 1
  ) return res.error( 13 );

  if( !Number.isInteger( before ) || before < 1 )
    before = null;

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const result = await create( transaction, actionId, hotelId, before );

  if( result !== true ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( result );
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
