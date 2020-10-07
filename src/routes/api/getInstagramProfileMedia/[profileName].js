"use strict";

import fetch from "node-fetch";

import scrapProfileMedia from "/helpers/instagramScraper/profileMedia";

export { get };

// #fix EXPERIMENTAL УБРАТЬ/ЗАМЕНИТЬ/УДАЛИТЬ
async function get( { params: { profileName } }, res ){
  const media = await scrapProfileMedia( fetch, profileName, 8 );

  if( media === false ){
    return res.error();
  }

  res.success( 0, media );
}
