"use strict";

import { getAll } from "/database/bookingLocations";

export {
  get
};

async function get( {
  query: { location2name },
  database: { pool }
}, res ){
  location2name = typeof location2name === "string" ? true : false;

  // #fix localise
  res.success( 0, await getAll( pool, location2name ) );
}
