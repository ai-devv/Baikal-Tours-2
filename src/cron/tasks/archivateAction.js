"use strict";

import { Pool } from "pg";
import databaseConfigs from "/configs/database";

export default index;

async function index( { actionId }, cron ){
  let client;

  try{
    console.debug( `[TASK ARCHIVATE ACTION] Start archivate (${actionId})` );

    const dev = process.env.NODE_ENV === "development";
    const pool = new Pool( !dev ? databaseConfigs.production : databaseConfigs.development );

    client = await pool.connect();
    await client.query( "begin" );

    const { rows: [ { task2_id } ] } = await client.query(
      `select task2_id
      from actions
      where id = $1`,
      [ actionId ]
    );

    await client.query(
      `update actions
      set status = 'archive'
      where id = $1`,
      [ actionId ]
    );

    if( task2_id ) await cron.delete( task2_id, client );

    await client.query( "commit" );
    client.release();
  } catch( error ) {
    if( client ){
      await client.query( "rollback" );
      client.release();
    }

    console.error( error );

    return false;
  }
}
