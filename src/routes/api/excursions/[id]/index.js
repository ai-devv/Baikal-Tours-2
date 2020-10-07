"use strict";

import fetch from "node-fetch";
import { toInt } from "/helpers/converters";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { unlink } from "/helpers/promisified";

export {
  get,
  put,
  del
};

async function get( {
  session: { locale },
  params: { id },
  database: { pool, excursions }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  return res.json( await excursions.getById( pool, locale, id_ ) );
}

async function put( {
  params: { id },
  body: { site, dateStart, dateEnd, locationIds, price, name },
  database: { pool, excursions, excursionsTranslates }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( typeof site !== "string" || site === "" )
    site = null;

  if( typeof dateStart !== "string" || dateStart === "" )
    dateStart = null;

  if( typeof dateEnd !== "string" || dateEnd === "" )
    dateEnd = null;

  if(
    !Array.isArray( locationIds ) ||
    locationIds.some( el => !Number.isInteger( el ) || el < 1 )
  ) locationIds = null;

  if( !Number.isInteger( price ) || price < 1 )
    price = null;

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const result = await excursions.edit( transaction, id_, site, dateStart, dateEnd, locationIds, price );

  if( result !== true ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( result );
  }

  if( name !== null && typeof name === "object" && !Array.isArray( name ) ){
    let translated = {};

    translated[ name.locale ] = name.text;

    if( name.autoTranslate === true ){
      const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
      const translator = new Translator( yandexEngine );

      translator.add( "name", name.text, name.locale, name.toLocales );
      await translator.translate();

      translated = { ...translated, ...translator.translated.name };
    }

    for( let locale in translated )
      await excursionsTranslates.createOrEdit( transaction, id_, locale, translated[ locale ] );
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}

async function del( {
  params: { id },
  database: { pool, excursions }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const result = await excursions.delete( pool, id_ );

  if( result !== null && typeof result === "object" )
    return res.json( result );

  if( result !== null && !result.startsWith( "http" ) )
    await unlink( `static/${result}` );

  res.success();
}
