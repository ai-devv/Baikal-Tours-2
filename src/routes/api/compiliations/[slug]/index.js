"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toInt } from "/helpers/converters";
import { getByUrl, edit, del as del_ } from "/database/compiliations/index";
import { createOrEdit } from "/database/compiliations/translates";

export {
  get,
  put,
  del
};


async function get( {
  session: { locale },
  params: { slug: url },
  database: { pool }
}, res ){
  if( typeof url !== "string" || url === "" )
    return res.error( 16 );

  const result = await getByUrl( pool, locale, url );

  if( typeof result !== "object" )
    return res.json( { errors: [ result ] } );

  res.success( 0, result );
}

async function put( {
  params: { slug: id },
  body: { url, title, name, tagline, description, locationIds, subjectIds },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const q = ( locale, field, value ) => {
    if( !( locale in translated ) )
      translated[ locale ] = {};

    translated[ locale ][ field ] = value;
  };

  const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
  const translator = new Translator( yandexEngine );
  let translated = {};
  let result;

  if( typeof url !== "string" || url === "" )
    url = null;

  if( !Array.isArray( locationIds ) )
    locationIds = null;

  if( !Array.isArray( subjectIds ) )
    subjectIds = null;

  if( typeof title === "object" ){
    const { text, locale, autoTranslate, toLocales } = title;

    q( locale, "title", text );

    if( autoTranslate === true )
      translator.add( "title", text, locale, toLocales );
  }

  if( typeof name === "object" ){
    const { text, locale, autoTranslate, toLocales } = name;

    q( locale, "name", text );

    if( autoTranslate === true )
      translator.add( "name", text, locale, toLocales );
  }

  if( typeof tagline === "object" ){
    const { text, locale, autoTranslate, toLocales } = tagline;

    q( locale, "tagline", text );

    if( autoTranslate === true )
      translator.add( "tagline", text, locale, toLocales );
  }

  if( typeof description === "object" ){
    const { text, locale, autoTranslate, toLocales } = description;

    q( locale, "description", text );

    if( autoTranslate === true )
      translator.add( "description", text, locale, toLocales );
  }

  await translator.translate();
  translator.transform();

  for( let key in translator.transformed )
    if( translated[ key ] !== undefined )
      translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
    else
      translated[ key ] = translator.transformed[ key ];

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  result = await edit( transaction, id_, url, locationIds, subjectIds );

  if( result !== true ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( { errors: [ result ] } );
  }

  for( let locale in translated ){
    result = await createOrEdit( transaction, id_, locale, translated[ locale ] );

    if( result !== true )
      return res.json( { errors: [ result ] } );
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}

async function del( {
  params: { slug: id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const result = await del_( pool, id );

  if( result !== null && typeof result === "object" )
    return res.json( result );

  if( result !== null && !result.startsWith( "http" ) )
    await unlink( `static/${result}` );

  res.success();
}
