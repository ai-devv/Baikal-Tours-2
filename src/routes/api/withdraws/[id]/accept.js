"use strict";

import { toInt } from "/helpers/converters";
import { edit } from "/database/withdraws";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";
import i18n from "/helpers/i18n/index";

export {
  get
};

async function get( {
  params: { id },
  database: { pool },
  mail
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

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

  await edit( transaction, id_, "accepted" );
  await transaction.query( "commit" );
  transaction.release();

  const templateName = "successWithdraw";
  // #fix проверка
  const filler = fillers[ templateName ];
  // #fix проверка
  const template = await getTemplate( templateName );
  // #fix проверка
  const { [ row.locale ]: texts } = await getTemplateTexts( pool, [ row.locale ], templateName );
  const subject = i18n( row.locale )( "withdraw.accepted" );

  const mail_ = filler( template, texts, {
    amount: row.amount,
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
