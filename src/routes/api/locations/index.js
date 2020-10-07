"use strict";

export {
  get
};

async function get( {
  session: { locale },
  query: { location2name },
  database: { locations }
}, res ){
  location2name = typeof location2name === "string" ? true : false;

  res.json( await locations.getAll( locale, location2name ) );
}
