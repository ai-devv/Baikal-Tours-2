"use strict";

// #fix убрать логи

import {
  getProfilePage,
  getConsumerFile,
  getQueryIdForMedia,
  getProfileId,
  getMedia
} from "./index";

export default index;

async function index( fetch, profileName, countOfMedia ){
  try{
    const profilePage = await getProfilePage( fetch, profileName );

    if( profilePage === 404 ){
      console.log( `[${new Date()}] [INSTAGRAM SCRAPER] Profile name ${profileName} not found` );
    }
    else if( profilePage === false ) return false;

    const consumerFile = await getConsumerFile( fetch, profilePage );

    if( consumerFile === false ) return false;

    const queryIdForMedia = getQueryIdForMedia( consumerFile );
    const profileId = getProfileId( profilePage );
    let media = await getMedia( fetch, queryIdForMedia, profileId, countOfMedia );

    if( media === false ) return false;

    media = media.map( ( { node: { display_url, shortcode } } ) => ( { display_url, shortcode } ) );

    return media;
  } catch( error ) {
    console.log( `[${new Date()}] [INSTAGRAM SCRAP PROFILE MEDIA] Failed to fetch` );
    console.log( error );

    return false;
  }
}
