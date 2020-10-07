"use strict";

import fetch from "node-fetch";
import { slugify } from "transliteration";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export async function post( {
  body: { name, slug },
  database: { subjects }
}, res ){
  if( name === null || typeof name !== "object" || Array.isArray( name ) )
    return res.error( 13 );

  let translated = {
    [ name.locale ]: name.text
  };

  if( typeof slug !== "string" || slug === "" ){
    if( !name.toLocales )
      name.toLocales = [ "en" ];
    else if( !name.toLocales.includes( "en" ) )
      name.toLocales.push( "en" );

    if( !name.autoTranslate )
      name.autoTranslate = true;
  }

  if( name.autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "name", name.text, name.locale, name.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.name };
  }

  if( typeof slug !== "string" || slug === "" )
    slug = slugify( translated.en );

  res.json( await subjects.create( translated, slug ) );
}

export async function get( req, res ){
  const role = req.session.role;
  let locale = req.session.locale;

  if( role === "admin" && req.query.locale ) locale = req.query.locale;

  res.json( await req.database.subjects.getAll( locale ) );
}
