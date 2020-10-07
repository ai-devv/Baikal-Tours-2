"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toInt } from "/helpers/converters";
import { edit, del as del_ } from "/database/compiliations/actions";

export {
  put,
  del
};

async function put( {
  params: { slug: id, id: actionId },
  body: { description: { text, locale, autoTranslate, toLocales } },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const actionId_ = toInt( actionId );

  if( actionId_ === null || actionId_ < 1 )
    return res.error( 9 );

  let translated = {
    [locale]: text
  };

  if( autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "text", text, locale, toLocales );
    await translator.translate();
    translated = { ...translated, ...translator.translated.text };
  }

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  for( let locale_ in translated ){
    const result = await edit( transaction, id_, actionId_, locale_, translated[ locale_ ] );

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

async function del( {
  params: { slug: id, id: actionId },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const actionId_ = toInt( actionId );

  if( actionId_ === null || actionId_ < 1 )
    return res.error( 9 );

  const result = await del_( pool, id_, actionId_ );

  if( result === false )
    return res.json( { errors: [ `Invalid compiliation ID (${id_}) or action ID (${actionId_})` ] } );

  res.success();
}
