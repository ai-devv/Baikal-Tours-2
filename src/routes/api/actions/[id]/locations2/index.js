"use strict";

import { toInt } from "/helpers/converters";
import { create } from "/database/actions/locations2";

export {
  post
};

async function post( {
  params: { id },
  // #fix add address & coords
  body: { location2Id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  // #fix checks for other parameters
  if( !Number.isInteger( location2Id ) || location2Id < 1 )
    return res.error( 13 );

  // #fix add address & coords
  const result = await create( pool, id_, location2Id );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}
