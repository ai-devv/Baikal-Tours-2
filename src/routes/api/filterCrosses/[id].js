"use strict";

import fetch from "node-fetch";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import Translator from "/helpers/translator/index";
import { toInt } from "/helpers/converters";
import {
  getOne,
  editOne,
  removeOne
} from "/database/filterCrosses";

export {
  get,
  put,
  del
};

async function get( {
  session: { role, locale },
  params: { id: slug },
  query: { allLocales },
  database: { pool }
}, res ){
  if( typeof slug !== "string" || slug === "" )
    return res.error( 9 );

  if( allLocales !== undefined && role === "admin" )
    locale = false;

  const result = await getOne( pool, locale, slug );

  res.success( 0, result );
}

async function put( {
  params: { id },
  body: { slug, description, intro, h1, title },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
  const translator = new Translator( yandexEngine );
  const translated = {};

  const q = ( locale, field, source ) => {
    if( !( locale in translated ) )
      translated[ locale ] = {};

    translated[ locale ][ field ] = source;
  };

  if( typeof slug !== "string" || slug === "" )
    slug = undefined;

  if( description !== null && typeof description === "object" && !Array.isArray( description ) ){
    q( description.locale, "description", description.text );

    if( description.autoTranslate )
      translator.add( "description", description.text, description.locale, description.toLocales );
  }

  if( intro !== null && typeof intro === "object" && !Array.isArray( intro ) ){
    q( intro.locale, "intro", intro.text );

    if( intro.autoTranslate )
      translator.add( "intro", intro.text, intro.locale, intro.toLocales );
  }

  if( h1 !== null && typeof h1 === "object" && !Array.isArray( h1 ) ){
    q( h1.locale, "h1", h1.text );

    if( h1.autoTranslate )
      translator.add( "h1", h1.text, h1.locale, h1.toLocales );
  }

  if( title !== null && typeof title === "object" && !Array.isArray( title ) ){
    q( title.locale, "title", title.text );

    if( title.autoTranslate )
      translator.add( "title", title.text, title.locale, title.toLocales );
  }

  await translator.translate();
  translator.transform();

  for( let key in translator.transformed )
    if( translated[ key ] !== undefined )
      translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
    else
      translated[ key ] = translator.transformed[ key ];

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await editOne( client, id, slug, translated );

  if( typeof result === "string" ){
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

  const result = await removeOne( pool, id_ );

  if( !result )
    return res.json( { errors: [ `Invalid ID (${id_})` ] } );

  res.success();
}
