"use strict";

import { createHash, randomBytes } from "crypto";
import fetch from "node-fetch";
import { toInt } from "/helpers/converters";
import { checkOrderNumber } from "/database/actionReservations";
import { register } from "/helpers/sber/acquiring/index";

export async function post( {
  session: { isLogged, role, userId },
  params,
  body: { userId: userId_ },
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const id = toInt( params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  if( role !== "admin" && userId !== userId_ )
    return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: [ row ] } = await transaction.query(
    `select form_url, sum( arb.count * ab.price )::int as price
    from
      action_reservations as ar,
      action_reservations_buyable as arb,
      action_buyable as ab
    where
      ar.id = $1 and
      ar.user_id = $2 and
      ar.paid = false and
      ar.id = arb.action_reservation_id and
      arb.action_buyable_id = ab.id
    group by form_url`,
    [ id, userId_ ]
  );

  if( row === undefined ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Reservation by ID (${id}) and user ID (${userId_}) not found or reservation already payed`
    } );
  }

  const { form_url, price } = row;

  if( typeof form_url === "string" && form_url !== "" ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: true,
      data: form_url
    } );
  }

  if( price === 0 ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: "Sum of reservation is 0"
    } );
  }

  let orderNumber, orderId, formUrl;

  while( true ){
    while( true ){
      orderNumber = createHash( "sha1" ).update( Date.now() + randomBytes( 10 ).toString( "hex" ) ).digest( "hex" ).slice( 0, 30 );

      if( !( await checkOrderNumber( transaction, orderNumber ) ) ) break;
    }

    const { errorCode, errorMessage, formUrl: formUrl_, orderId: orderId_ } = await register( fetch, {
      userName: process.env.SBER_ACQUIRING_USERNAME,
      password: process.env.SBER_ACQUIRING_PASSWORD,
      orderNumber,
      amount: price * 100,
      currency: 643,
      returnUrl: process.env.SBER_RETURN_URL,
      failUrl: process.env.SBER_FAIL_URL,
      description: `Оплата билетов и дополнительных услуг события номер ${id}`,
      // #fix localize
      language: "ru",
      pageView: "DESKTOP"
    } );

    if( typeof errorCode === "string" ){
      if( errorCode === "1" ) continue;

      await transaction.query( "rollback" );
      transaction.release();
      console.log( `[PAYMENT] ${errorCode} ${errorMessage}` );

      return res.json( { status: 502, message: "See server logs" } );
    }

    orderId = orderId_;
    formUrl = formUrl_;

    break;
  }

  await transaction.query(
    `update action_reservations
    set
      order_number = $1,
      order_id = $2,
      form_url = $3
    where
      id = $4`,
    [ orderNumber, orderId, formUrl, id ]
  );

  await transaction.query( "commit" );
  await transaction.release();

  res.json( {
    ok: true,
    data: formUrl
  } );
}
