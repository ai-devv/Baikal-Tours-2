"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toIntArray } from "/helpers/converters";

export async function post( req, res ){
  const { name, site, dateStart, dateEnd, locationIds } = req.body;
  let { price } = req.body;
  let translated = {};

  if(
    typeof name !== "object" || Array.isArray( name ) ||
    typeof site !== "string" || site === "" ||
    typeof dateStart !== "string" || dateStart === "" ||
    typeof dateEnd !== "string" || dateEnd === "" ||
    !Array.isArray( locationIds )
  ) return res.error( 13 );

  translated[ name.locale ] = name.text;

  if( name.autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "name", name.text, name.locale, name.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.name };
  }

  if( typeof price !== "number" || price < 1 )
    price = null;

  const { transaction, id } = await req.database.tours.create( site, dateStart, dateEnd, locationIds, price );

  for( let locale in translated )
    await req.database.toursTranslates.create( transaction, id, locale, translated[ locale ] );

  await transaction.end();

  res.success( 0, id );
}

export async function get( req, res ){
  const locale = req.session.locale;
  const { filter } = req.query;

  if( filter === undefined )
    return res.json( await req.database.tours.getAll( locale ) );

  const { dateStart, dateEnd } = req.query;
  const locationIds = toIntArray( req.query.locationIds );

  res.json( await req.database.tours.filter( locale, dateStart, dateEnd, locationIds ) );
}
