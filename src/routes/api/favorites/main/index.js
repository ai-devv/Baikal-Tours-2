"use strict";

import { create, getAll } from "/database/favoritesMain";

export {
  post,
  get
};

async function post( {
  body: { actionId, before },
  database: { pool }
}, res ){
  if( typeof actionId !== "number" || actionId < 1 )
    return res.error( 13 );

  if( typeof before !== "number" || before < 1 )
    before = null;

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await create( client, actionId, before );

  if( typeof result === "string" ){
    await client.query( "rollback" );
    client.release();

    return res.json( { errors: [ result ] } );
  }

  await client.query( "commit" );
  client.release();

  res.success( 0, result );
}

async function get( {
  session: { locale, role },
  query: { allStatuses },
  database: { pool }
}, res ){
  const client = await pool.connect();
  const allStatuses_ = role === "admin" && typeof allStatuses === "string" ? true : false;

  await client.query( "begin" );

  const result = await getAll( client, locale, allStatuses_ );

  await client.query( "commit" );
  client.release();

  res.success( 0, result );
}
