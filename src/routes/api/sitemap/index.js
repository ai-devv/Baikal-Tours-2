"use strict";

import { writeFile, access, readFile } from "/helpers/promisified";

export {
  get,
  put
};

async function get( req, res ){
  const check = await access( "static/sitemap.txt" );

  if( !check ){
    return res.success();
  }

  const text = await readFile( "static/sitemap.txt" );

  res.success( 0, text );
}

async function put( { body: { text } }, res ){
  if( typeof text !== "string" || text === "" ){
    return res.error( 13 );
  }

  await writeFile( "static/sitemap.txt", text );

  res.success();
}
