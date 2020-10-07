"use strict";

export async function get( req, res ){
  res.json( await req.database.users.get( req.query.search ) );
}
