"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export async function post( req, res ){
  let translated = {};

  translated[ req.body.locale ] = req.body.name;

  if( req.body.autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "name", req.body.name, req.body.locale, req.body.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.name };
  }

  res.json( await req.database.transfers.create( translated ) );
}

export async function get( req, res ){
  const role = req.session.role;
  let locale = req.session.locale;

  if( role === "admin" && req.query.locale ) locale = req.query.locale;

  res.json( await req.database.transfers.getAll( locale ) );
}
