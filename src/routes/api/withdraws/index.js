"use strict";

import { toInt } from "/helpers/converters";
import { create, getMany } from "/database/withdraws";

export {
  post,
  get
};

async function post( {
  session: { isLogged, role, userId },
  body: {
    userId: userId_,
    recipient,
    bank,
    accountNumber,
    bik,
    inn,
    kpp,
    amount
  },
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  if( role !== "admin" && userId !== userId_ )
    return res.error( 12 );

  if(
    typeof userId_ !== "number" || userId_ < 1 ||
    typeof recipient !== "string" || recipient === "" ||
    typeof bank !== "string" || bank === "" ||
    typeof accountNumber !== "string" || accountNumber === "" ||
    typeof bik !== "string" || bik === "" ||
    typeof inn !== "string" || inn === "" ||
    typeof kpp !== "string" || kpp === "" ||
    typeof amount !== "number" || amount < 1
  ) return res.error( 13 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: actions } = await transaction.query(
    `select id, balance
    from actions
    where not array_position( organizer_ids, $1 ) is null
    order by balance desc`,
    [ userId_ ]
  );

  if( actions.length === 0 ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Actions by user ID (${userId_}) not found`
    } );
  }

  const totalBalance = actions.reduce( ( res, cur ) => res + cur.balance, 0 );

  if( totalBalance < amount ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Amount (${amount}) greater than total balance (${totalBalance})`
    } );
  }

  const usedActions = [];

  for( let { id, balance } of actions ){
    if( amount <= balance ){
      usedActions.push( [ id, amount ] );

      break;
    }

    usedActions.push( [ id, balance ] );
    amount -= balance;
  }

  for( let [ actionId, balance ] of usedActions ) await transaction.query(
    `update actions
    set balance = balance - $1
    where id = $2`,
    [ balance, actionId ]
  );

  const id = await create(
    transaction,
    userId_,
    recipient,
    bank,
    accountNumber,
    bik,
    inn,
    kpp,
    usedActions
  );

  await transaction.query( "commit" );
  transaction.release();

  res.success( 0, {
    id,
    usedActions
  } );
}

async function get( { database: { pool } }, res ){
  res.success( 0, await getMany( pool ) );
}
