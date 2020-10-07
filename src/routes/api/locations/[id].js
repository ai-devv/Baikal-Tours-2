"use strict";

import { toInt } from "/helpers/converters";

export {
  put
};

async function put( {
  params: { id },
  body: { location2Id },
  database: { locations }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if(
    location2Id !== null &&
    ( !Number.isInteger( location2Id ) || location2Id < 1 )
  ) return res.error( 13 );

  // #fix transaction
  const result = await locations.edit( id, location2Id );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}
