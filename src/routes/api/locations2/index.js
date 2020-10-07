"use strict";

import { transliterate, slugify } from "transliteration";

import { toInt } from "/helpers/converters";
import { create, getAll } from "/database/locations2";

export {
  post,
  get
};

async function post( {
  body: { name, id, isChild, slug },
  database: { pool }
}, res ){
  if( name === null || typeof name !== "object" || Array.isArray( name ) )
    return res.error( 13 );

  const id_ = toInt( id );

  if( typeof isChild !== "boolean" )
    isChild = false;

  const translated = {
    [ name.locale ]: { name: name.text }
  };

  if( name.autoTranslate ) for( const locale of name.toLocales )
    translated[ locale ] = { name: transliterate( name.text ) };

  if( !slug ){
    if( !name.toLocales || !name.toLocales.includes( "en" ) )
      slug = slugify( transliterate( name.text ) );
    else
      slug = slugify( translated.en.name );
  }

  const client = await pool.connect();

  await client.query( "begin" );

  let result;

  for( const locale in translated ){
    const { name: name_ } = translated[ locale ];
    const result_ = await create( client, locale, name_, slug, id_, isChild );

    if( typeof result_ === "string" ){
      await client.query( "rollback" );
      client.release();

      return res.json( { errors: [ result_ ] } );
    }

    if( locale === name.locale ) result = result_;
  }

  await client.query( "commit" );
  client.release();

  res.success( 0, result );
}

async function get( {
  session: { role, locale },
  query: { ln, bln, allLocales },
  database: { pool }
}, res ){
  ln = typeof ln === "string" ? true : false;
  bln = typeof bln === "string" ? true : false;

  if( allLocales !== undefined && role === "admin" )
    locale = false;

  const result = await getAll( pool, locale, ln, bln );

  res.success( 0, result );
}
