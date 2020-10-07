"use strict";

import { toInt } from "/helpers/converters";
import { create } from "/database/compiliations/dates";

export {
  post
};

async function post( {
  params: { slug: id },
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

  if( typeof days !== "string" || days === "" )
    days = null;

  const result = await create( pool, id_, dateStart, dateEnd, timeStart, timeEnd, days );

  if( result !== null && typeof result === "object" && "errors" in result )
    return res.json( result );

  res.success( 0, result );
}
