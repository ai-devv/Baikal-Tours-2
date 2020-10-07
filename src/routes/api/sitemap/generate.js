"use strict";

import { writeFile } from "/helpers/promisified";

export {
  get
};

async function get( { database: { pool } }, res ){
  const { SELF_URL } = process.env;

  const actions = ( await pool.query(
    `select slug
    from actions
    where status = 'active'`
  ) ).rows.map( ( { slug } ) => `${SELF_URL}/event/${slug}` );

  const compiliations = ( await pool.query(
    `select url
    from compiliations`
  ) ).rows.map( ( { url } ) => `${SELF_URL}/selected/${url}` );

  const filterCrosses = ( await pool.query(
    `select slug
    from filter_crosses`
  ) ).rows.map( ( { slug } ) => `${SELF_URL}/events/${slug}` );

  const text = [
    `${SELF_URL}`,
    `${SELF_URL}/events`,
    ...actions,
    ...compiliations,
    ...filterCrosses
  ].join( "\n" );

  await writeFile( "static/sitemap.txt", text );

  res.success( 0, text );
}
