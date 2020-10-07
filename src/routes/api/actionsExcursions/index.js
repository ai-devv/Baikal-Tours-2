"use strict";

import { toInt } from "/helpers/converters";

export async function post( req, res ){
  const { actionId, excursionId } = req.body;
  let { before } = req.body;

  if(
    typeof actionId !== "number" || actionId < 1 ||
    typeof excursionId !== "number" || excursionId < 1
  ) return res.error( 13 );

  if( typeof before !== "number" || before < 1 )
    before = null;

  res.json( await req.database.actionsExcursions.create( actionId, excursionId, before ) );
}

export async function put( req, res ){
  const { actionId, excursionId, number } = req.body;
  let { action } = req.body;

  if(
    typeof actionId !== "number" || actionId < 1 ||
    typeof excursionId !== "number" || excursionId < 1 ||
    typeof number !== "number" || number < 1
  ) return res.error( 13 );

  if( ![ "before", "after", "swipe" ].includes( action ) )
    action = "before";

  res.json( await req.database.actionsExcursions.edit( actionId, excursionId, number, action ) );
}

export async function del( req, res ){
  const actionId = toInt( req.query.actionId );
  const excursionId = toInt( req.query.excursionId );

  if(
    typeof actionId !== "number" || actionId < 1 ||
    typeof excursionId !== "number" || excursionId < 1
  ) return res.error( 13 );

  res.json( await req.database.actionsExcursions.delete( actionId, excursionId ) );
}
