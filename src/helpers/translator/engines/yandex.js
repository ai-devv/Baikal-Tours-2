"use strict";

module.exports = ( apiKey, fetch, options ) => {
  let format = "PLAIN_TEXT";

  if( options !== null && typeof options === "object" && !Array.isArray( options ) ){
    const { format: format_ } = options;

    if( format_ === "html" ){
      format = "HTML";
    }
  }

  return async ( texts, direction ) => {
    const URL = "https://translate.api.cloud.yandex.net/translate/v2/translate";
    const [ sourceLanguageCode, targetLanguageCode ] = direction.split( "-" );

    const body = JSON.stringify( { sourceLanguageCode, targetLanguageCode, format, texts } );

    const response = await fetch( URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `api-key ${apiKey}`
      },
      body
    } );

    const { translations } = await response.json();
    const texts_ = translations.map( ( { text } ) => text );

    return { text: texts_ };
  };
}
