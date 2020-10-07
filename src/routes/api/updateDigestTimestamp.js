"use strict";

import { get as getCron } from "/cron/index";

export {
  get
};

// #fix убрать, для тестов
async function get( {
  query: { period },
  database: { pool }
}, res ){
  let id;

  switch( period ){
    case "month": id = 14; break;
    case "2months": id = 15; break;
    case "halfYear": id = 16; break;

    default:
      return res.status( 422 ).json( { error: {
        code: 422,
        message: "Unprocessable entity"
      } } );
    break;
  }

  const timestamp = Math.floor( Date.now() / 1000 );

  await pool.query(
    `update tasks
    set timestamp = $1
    where id = $2`,
    [ timestamp, id ]
  );

  getCron().updateTimestamp( timestamp );

  res.success();
}
