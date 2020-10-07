"use strict";

import { toInt } from "/helpers/converters";
import { edit, del as del_ } from "/database/compiliations/dates";

export {
  put,
  del
};

async function put( {
  params: { id },
  body: { dateStart, dateEnd, timeStart, timeEnd, days },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( typeof dateStart !== "string" || dateStart === "" )
    dateStart = null;

  if( typeof dateEnd !== "string" || dateEnd === "" )
    dateEnd = null;

  if( typeof timeStart !== "string" || timeStart === "" )
    timeStart = null;

  if( typeof timeEnd !== "string" || timeEnd === "" )
    timeEnd = null;

  if( !Array.isArray( days ) )
    days = null;

  const result = await edit( pool, id_, dateStart, dateEnd, timeStart, timeEnd, days );

  if( result !== true )
    return res.json( { errors: [ `Invalid ID (${id_})` ] } );

  res.success();
}

async function del( {
  params: { id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const result = await del_( pool, id_ );

  if( result !== true )
    return res.json( { errors: [ `Invalid ID (${id_})` ] } );

  res.success();
}
