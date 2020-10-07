"use strict";

import fetch from "node-fetch";
import { toInt } from "/helpers/converters";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export async function put( {
  params: { id },
  body: { name, slug },
  database: { subjects }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( name !== null && typeof name === "object" && !Array.isArray( name ) ){
    let translated = {
      [ name.locale ]: name.text
    };

    if( name.autoTranslate === true ){
      const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
      const translator = new Translator( yandexEngine );

      translator.add( "name", name.text, name.locale, name.toLocales );
      await translator.translate();

      translated = { ...translated, ...translator.translated.name };
    }

    const result = await subjects.edit( id_, { translated } );

    if( typeof result === "string" )
      return res.json( { errors: [ result ] } );
  }

  if( typeof slug === "string" && slug !== "" ){
    const result = await subjects.edit( id_, { slug } );

    if( typeof result === "string" )
      return res.json( { errors: [ result ] } );
  }

  res.success();
}

export async function del( {
  params: { id },
  database: { subjects }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  res.json( await subjects.del( id_ ) );
}
