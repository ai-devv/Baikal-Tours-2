"use strict";

import { toInt } from "/helpers/converters";
import { edit, del as del_ } from "/database/favoritesMain";

export {
  put,
  del
};

async function put( {
  params: { id },
  body: { number, action },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( ![ "before", "after", "swipe" ].includes( action ) )
    action = "before";

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await edit( client, id_, number, action );

  if( result !== true ){
    await client.query( "rollback" );
    client.release();

    return res.json( { errors: [ result ] } );
  }

  await client.query( "commit" );
  client.release();

  res.success();
}

async function del( {
  params: { id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const result = await del_( pool, id );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}
