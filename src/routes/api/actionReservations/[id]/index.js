"use strict";

import { toInt } from "/helpers/converters";
import { get as getCron } from "/cron/index";

export {
  del
};

async function del( {
  session: { isLogged, role, userId },
  params: { id },
  query: { userId: userId_ },
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const id_ = toInt( id );
  const userId__ = toInt( userId_ );

  if(
    typeof id_ !== "number" || id_ < 1 ||
    typeof userId__ !== "number" || userId__ < 1
  ) return res.error( 13 );

  if( role !== "admin" && userId !== userId__ )
    return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: [ row ] } = await transaction.query(
    `delete from action_reservations
    where
      id = $1 and
      user_id = $2 and
      paid = false and
      form_url is null
    returning task_id`,
    [ id_, userId__ ]
  );

  if( row === undefined ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Reservation with ID (${id_}) and user ID (${userId__}) not found or already paid or in pay process`
    } );
  }

  await getCron().delete( row.task_id, transaction );
  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
