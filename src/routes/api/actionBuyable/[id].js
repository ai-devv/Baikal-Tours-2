"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toInt } from "/helpers/converters";

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { name, price } = req.body;

  const transaction = await req.database.pool.connect();

  await transaction.query( "begin" );

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
      await req.database.actionBuyableTranslates.edit( transaction, id, locale, translated[ locale ] );
  }

  if( typeof price === "number" && price >= 0 )
    await req.database.actionBuyable.edit( transaction, id, price );

  await transaction.query( "commit" );
  await transaction.release();

  res.success();
}

export async function del( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  res.json( await req.database.actionBuyable.delete( id ) );
}
