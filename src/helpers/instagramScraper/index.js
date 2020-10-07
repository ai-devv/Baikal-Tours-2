"use strict";

// #fix убрать логи

export {
  getProfilePage,
  getConsumerFile,
  getQueryIdForMedia,
  getProfileId,
  getMedia
};

async function logJsn( response ){
  try{
    console.log( await response.json() );
  }
  catch( error ) {}
}

async function getProfilePage( fetch, profileName ){
  const response = await fetch( `https://instagram.com/${profileName}` );

  if( !response.ok ){
    if( response.status === 404 ){
      return 404;
    }

    console.log( `[${new Date()}] [GET PROFILE PAGE] Bad response from instagram` );
    console.log( response );
    logJsn( response );

    return false;
  }

  const html = await response.text();

  return html;
}

async function getConsumerFile( fetch, html ){
  const idx = html.indexOf( "static/bundles/metro/Consumer.js" );

  html = html.slice( idx, html.length );
  html = html.slice( 0, html.indexOf( "\"" ) );

  const response = await fetch( `https://instagram.com/${html}` );

  if( !response.ok ){
    console.log( `[${new Date()}] [GET CONSUMER FILE] Bad response from instagram` );
    console.log( response );
    logJsn( response );

    return false;
  }

  const js = await response.text();

  return js;
}

function getQueryIdForMedia( consumer ){
  const matched = consumer.match( /},queryId:"(.*)",queryParams:function\(t\){return{id:t}},q/ );

  return matched[1];
}

function getProfileId( html ){
  const idx = html.indexOf( "profilePage_" );

  html = html.slice( idx + 12, html.length );
  html = html.slice( 0, html.indexOf( "\"" ) );

  return html;
}

// #fix переделать на количество данных >50 (циклически)
async function getMedia( fetch, queryId, profileId, countOfMedia ){
  const variables = {
    id: profileId,
    first: countOfMedia
  };
  let next = `https://instagram.com/graphql/query?query_hash=${queryId}&variables=${encodeURIComponent( JSON.stringify( variables ) )}`;

  const response = await fetch( next );

  if( !response.ok ){
    console.log( `[${new Date()}] [SCRAP MEDIA] Bad response from instagram` );
    console.log( response );
    logJsn( response );

    return false;
  }

  const { data: { user: { edge_owner_to_timeline_media: { edges } } } } = await response.json();

  return edges;
}
