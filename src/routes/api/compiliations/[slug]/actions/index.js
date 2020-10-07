"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toInt } from "/helpers/converters";
import { create } from "/database/compiliations/actions";

export {
  post
};

async function post( {
  params: { slug: id },
  body: { actionId, description: { text, locale, autoTranslate, toLocales } },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if(
    !Number.isInteger( actionId ) || actionId < 1 ||
    typeof text !== "string" || text === "" ||
    typeof locale !== "string" || locale === ""
  ) return res.error( 13 );

  let translated = {
    [locale]: text
  };

  if( autoTranslate === true && Array.isArray( toLocales ) ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "text", text, locale, toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.text };
  }

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  for( let locale_ in translated ){
    const result = await create( transaction, id_, actionId, locale_, translated[ locale_ ] );

    if( result !== true ){
      await transaction.query( "rollback" );
      transaction.release();

      return res.json( { errors: [ result ] } );
    }
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
