"use strict";

import { toInt } from "/helpers/converters";
import { getByUserId } from "/database/withdraws";

export { get };

async function get( {
  session: { isLogged, role, userId },
  params: { id },
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const id_ = toInt( id );

  if( typeof id_ !== "number" || id_ < 1 )
    return res.error( 13 );

  if( role !== "admin" && id_ !== userId )
    return res.error( 12 );

  const withdraws = await getByUserId( pool, id_ );

  res.success( 0, withdraws );
}
