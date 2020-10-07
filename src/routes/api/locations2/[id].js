"use strict";

import { transliterate } from "transliteration";

import { toInt } from "/helpers/converters";
import { edit, del as del_ } from "/database/locations2";

export {
  put,
  del
};

async function put( {
  params: { id },
  body: { name, slug },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const client = await pool.connect();

  await client.query( "begin" );

  if( name !== null && typeof name === "object" && !Array.isArray( name ) ){
    const translated = {
      [ name.locale ]: { name: name.text }
    };

    if( name.autoTranslate ) for( const locale of name.toLocales )
      translated[ locale ] = { name: transliterate( name.text ) };

    for( const locale in translated ){
      const { name: name_ } = translated[ locale ];
      const result = await edit( client, id_, { name: { locale, text: name_ } } );

      if( result !== true ){
        await client.query( "rollback" );
        client.release();

        return res.json( { errors: [ result ] } );
      }
    }
  }

  if( typeof slug === "string" && slug !== "" ){
    const result = await edit( client, id_, { slug } );

    if( result !== true ){
      await client.query( "rollback" );
      client.release();

      return res.json( { errors: [ result ] } );
    }
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

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await del_( client, id_ );

  if( result !== true ){
    await client.query( "rollback" );
    client.release();

    return res.json( { errors: [ result ] } );
  }

  await client.query( "commit" );
  client.release();

  res.success();
}
