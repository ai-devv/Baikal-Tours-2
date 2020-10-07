"use strict";

import { toInt } from "/helpers/converters";

export async function post( req, res ){
  const { actionId, tourId } = req.body;
  let { before } = req.body;

  if(
    typeof actionId !== "number" || actionId < 1 ||
    typeof tourId !== "number" || tourId < 1
  ) return res.error( 13 );

  if( typeof before !== "number" || before < 1 )
    before = null;

  res.json( await req.database.actionsTours.create( actionId, tourId, before ) );
}

export async function put( req, res ){
  const { actionId, tourId, number } = req.body;
  let { action } = req.body;

  if(
    typeof actionId !== "number" || actionId < 1 ||
    typeof tourId !== "number" || tourId < 1 ||
    typeof number !== "number" || number < 1
  ) return res.error( 13 );

  if( ![ "before", "after", "swipe" ].includes( action ) )
    action = "before";

  res.json( await req.database.actionsTours.edit( actionId, tourId, number, action ) );
}

export async function del( req, res ){
  const actionId = toInt( req.query.actionId );
  const tourId = toInt( req.query.tourId );

  if(
    typeof actionId !== "number" || actionId < 1 ||
    typeof tourId !== "number" || tourId < 1
  ) return res.error( 13 );

  res.json( await req.database.actionsTours.delete( actionId, tourId ) );
}
