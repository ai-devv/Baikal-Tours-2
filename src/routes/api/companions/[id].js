"use strict";

import fetch from "node-fetch";
import { toInt } from "/helpers/converters";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  let translated = {};

  translated[ req.body.locale ] = req.body.name;

  if( req.body.autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "name", req.body.name, req.body.locale, req.body.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.name };
  }

  res.json( await req.database.companions.edit( id, translated ) );
}

export async function del( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  res.json( await req.database.companions.del( id ) );
}
