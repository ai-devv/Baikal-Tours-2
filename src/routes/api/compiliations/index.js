"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toIntArray } from "/helpers/converters";
import { create, getAll, filter } from "/database/compiliations/index";
import { createOrEdit } from "/database/compiliations/translates";

export {
  post,
  get
};

async function post( {
  body: { url, title, name, tagline, description, locationIds, subjectIds },
  database: { pool }
}, res ){
  if(
    typeof url !== "string" || url === "" ||
    typeof title !== "object" ||
    typeof name !== "object" ||
    typeof tagline !== "object" ||
    typeof description !== "object"
  ) return res.error( 13 );

  const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
  const translator = new Translator( yandexEngine );
  let translated = {};

  const q = ( locale, field, value ) => {
    if( !( locale in translated ) )
      translated[ locale ] = {};

    translated[ locale ][ field ] = value;
  };

  if( !Array.isArray( locationIds ) )
    locationIds = null;

  if( !Array.isArray( subjectIds ) )
    subjectIds = null;

  q( title.locale, "title", title.text );
  q( name.locale, "name", name.text );
  q( tagline.locale, "tagline", tagline.text );
  q( description.locale, "description", description.text );

  if( title.autoTranslate === true )
    translator.add( "title", title.text, title.locale, title.toLocales );

  if( name.autoTranslate === true )
    translator.add( "name", name.text, name.locale, name.toLocales );

  if( tagline.autoTranslate === true )
    translator.add( "tagline", tagline.text, tagline.locale, tagline.toLocales );

  if( description.autoTranslate === true )
    translator.add( "description", description.text, description.locale, description.toLocales );

  await translator.translate();
  translator.transform();

  for( let key in translator.transformed )
    if( translated[ key ] !== undefined )
      translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
    else
      translated[ key ] = translator.transformed[ key ];

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const id = await create( transaction, url, locationIds, subjectIds );

  if( id === null ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( { errors: [ `Url (${url}) already exists` ] } );
  }

  for( let locale in translated )
    await createOrEdit( transaction, id, locale, translated[ locale ] );

  await transaction.query( "commit" );
  transaction.release();

  res.success( 0, id );
}

async function get( {
  session: { locale },
  query: { filter: filter_, locationIds, subjectIds, dateStart, dateEnd },
  database: { pool }
}, res ){
  if( filter_ === undefined )
    return res.success( 0, await getAll( pool, locale ) );

  const locationIds_ = toIntArray( locationIds );
  const subjectIds_ = toIntArray( subjectIds );

  res.success( 0, await filter( pool, locale, locationIds_, subjectIds_, dateStart, dateEnd ) );
}
