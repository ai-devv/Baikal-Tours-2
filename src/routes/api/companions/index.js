"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export async function post( req, res ){
  let translated = {};

  translated[ req.body.locale ] = req.body.text;

  if( req.body.autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "text", req.body.text, req.body.locale, req.body.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.text };
  }

  res.json( await req.database.companions.create( translated ) );
}

export async function get( req, res ){
  const role = req.session.role;
  let locale = req.session.locale;

  if( role === "admin" && req.query.locale ) locale = req.query.locale;

  res.json( await req.database.companions.getAll( locale ) );
}
