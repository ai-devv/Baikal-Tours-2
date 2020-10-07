"use strict";

export async function get( req, res ){
  res.json( await req.database.dataForFilters.get( req.session.locale ) );
}
