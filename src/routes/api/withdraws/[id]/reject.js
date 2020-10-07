"use strict";

import { toInt } from "/helpers/converters";
import { edit } from "/database/withdraws";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";
import i18n from "/helpers/i18n/index";

export {
  post
};

async function post( {
  params: { id },
  body: { failMessage },
  database: { pool },
  mail
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( typeof failMessage !== "string" || failMessage === "" )
    return res.error( 13 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: [ row ] } = await transaction.query(
    `select w.status, sum( wa.amount )::int as amount, u.email, u.locale
    from
    	withdraws as w,
    	withdraw_actions as wa,
      users as u
    where
    	w.id = $1 and
    	w.id = wa.withdraw_id and
      w.user_id = u.id
    group by w.status, u.email, u.locale`,
    [ id_ ]
  );

  if( row === undefined ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Invalid withdraw ID (${id_})`
    } );
  }

  if( row.status !== "process" ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Withdraw status must be "process" (found "${row.status}")`
    } );
  }

  const { rows: withdrawActions } = await transaction.query(
    `select action_id, amount
    from withdraw_actions
    where withdraw_id = $1`,
    [ id_ ]
  );

  for( let { action_id, amount } of withdrawActions ) await transaction.query(
    `update actions
    set balance = balance + $1
    where id = $2`,
    [ amount, action_id ]
  );

  await edit( transaction, id_, "rejected", failMessage );
  await transaction.query( "commit" );
  transaction.release();

  const templateName = "rejectedWithdraw";
  // #fix проверка
  const filler = fillers[ templateName ];
  // #fix проверка
  const template = await getTemplate( templateName );
  // #fix проверка
  const { [ row.locale ]: texts } = await getTemplateTexts( pool, [ row.locale ], templateName );
  const subject = i18n( row.locale )( "withdraw.rejected" );

  const mail_ = filler( template, texts, {
    amount: row.amount,
    rejectMessage: failMessage,
    domain: process.env.SELF_URL
  } );

  mail.send(
    row.email,
    subject,
    "",
    mail_
  );

  res.success();
}
