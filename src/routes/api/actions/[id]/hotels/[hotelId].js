"use strict";

import { toInt } from "/helpers/converters";
import { edit, del as del_ } from "/database/actionsHotels";

export {
  put,
  del
};

async function put( {
  params: { id, hotelId },
  body: { number, action },
  database: { pool }
}, res ){
  const actionId = toInt( id );
  const hotelId_ = toInt( hotelId );

  if(
    !Number.isInteger( actionId ) || actionId < 1 ||
    !Number.isInteger( hotelId_ ) || hotelId_ < 1 ||
    !Number.isInteger( number ) || number < 1
  ) return res.error( 13 );

  if( ![ "before", "after", "swipe" ].includes( action ) )
    action = "before";

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const result = await edit( transaction, actionId, hotelId_, number, action );

  if( result !== true ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( result );
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}

async function del( {
  params: { id, hotelId },
  database: { pool }
}, res ){
  const actionId = toInt( id );
  const hotelId_ = toInt( hotelId );

  if(
    !Number.isInteger( actionId ) || actionId < 1 ||
    !Number.isInteger( hotelId_ ) || hotelId_ < 1
  ) return res.error( 13 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const result = await del_( transaction, actionId, hotelId_ );

  if( result !== true ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( result );
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
