"use strict";

import { toInt } from "/helpers/converters";
import { edit, remove } from "/database/actions/locations2";

export {
  put,
  del
};

async function put( {
  params: { id, location2Id },
  body: { location2Id: newLocation2Id },
  database: { pool }
}, res ){
  const id_ = toInt( id );
  const location2Id_ = toInt( location2Id );

  if(
    id_ === null || id_ < 1 ||
    location2Id_ === null || location2Id_ < 1
  ) return res.error( 9 );

  if( !Number.isInteger( newLocation2Id ) || newLocation2Id < 1 )
    newLocation2Id = undefined;

  const result = await edit( pool, id_, location2Id_, newLocation2Id );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}

async function del( {
  params: { id, location2Id },
  database: { pool }
}, res ){
  const id_ = toInt( id );
  const location2Id_ = toInt( location2Id );

  if(
    id_ === null || id_ < 1 ||
    location2Id_ === null || location2Id_ < 1
  ) return res.error( 9 );

  const result = await remove( pool, id_, location2Id_ );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}
