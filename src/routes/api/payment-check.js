"use strict";

import fetch from "node-fetch";
import { getOrderStatus } from "/helpers/sber/acquiring/index";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";
import { get as getCron } from "/cron/index";

export {
  get
};

async function get( {
  session: { locale, isLogged },
  query: { orderId },
  database: { pool },
  mail,
  _
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const {
    ErrorCode,
    ErrorMessage,
    OrderStatus,
    OrderStatusMessage,
    OrderNumber
  } = await getOrderStatus( fetch, {
    userName: process.env.SBER_ACQUIRING_USERNAME,
    password: process.env.SBER_ACQUIRING_PASSWORD,
    orderId,
    // #fix localize
    language: "ru"
  } );

  if( typeof ErrorCode === "string" ){
    if( ErrorCode === "6" )
      return res.json( {
        ok: false,
        message: `Reservation with order ID (${orderId}) not found`
      } );

    console.log( `[PAYMENT] ${ErrorCode} ${ErrorMessage}` );

    return res.json( { status: 502, message: "See server logs" } );
  }

  if( OrderStatus === 0 || OrderStatus === 2 || OrderStatus === 7 ){
    const transaction = await pool.connect();

    await transaction.query( "begin" );

    const { rows: [ {
      action_id: actionId,
      name,
      surname,
      form_url: formUrl,
      paid,
      amount
    } ] } = await transaction.query(
      `select action_id, name, surname, form_url, paid
      from action_reservations
      where order_id = $1`,
      [ orderId ]
    );

    if( OrderStatus === 2 && !paid ){
      const { rows: [ { date, phone, email, task_id } ] } = await transaction.query(
        `select date, phone, email, task_id
        from action_reservations
        where order_id = $1`,
        [ orderId ]
      );

      const { rows: buyable } = await transaction.query(
        `select arb.count, ab.price, ab.type, abt.name
        from
          action_reservations as ar,
          action_reservations_buyable as arb,
          action_buyable as ab,
          action_buyable_translates as abt
        where
          abt.locale = $1 and
          ar.order_id = $2 and
          ar.id = arb.action_reservation_id and
          arb.action_buyable_id = ab.id and
          ab.id = abt.action_buyable_id`,
        [ locale, orderId ]
      );

      const { rows: [ { action_name } ] } = await transaction.query(
        `select name as action_name
        from actions_translates
        where
          locale = $1 and
          action_id = $2`,
        [ locale, actionId ]
      );

      const locations = ( await transaction.query(
        `select
        	l2.name ||
        	case
      			when al2.address is null then ''
      			else ', ' || al2.address
      		end as location
        from
        	actions_locations2 as al2,
        	locations2 as l2
        where
        	l2.locale = $1 and
        	al2.action_id = $2 and
        	al2.location2_id = l2.id`,
        [ locale, actionId ]
      ) ).rows.map( ( { location } ) => location );

      const amount = buyable.reduce( ( res, { count, price } ) => res + count * price, 0 );

      await transaction.query(
        `update action_reservations
        set
          paid = true,
          form_url = null,
          task_id = null
        where order_id = $1`,
        [ orderId ]
      );

      await transaction.query(
        `update actions
        set balance = balance + $1
        where id = $2`,
        [ amount, actionId ]
      );

      if( task_id ){
        await getCron().delete( task_id, transaction );
      }

      const templateName = "payment";
      // #fix проверка
      const filler = fillers[ templateName ];
      // #fix проверка
      const template = await getTemplate( templateName );
      // #fix проверка
      const { [ locale ]: texts } = await getTemplateTexts( transaction, [ locale ], templateName );

      const mail_ = filler( template, texts, {
        date,
        name: `${name} ${surname}`,
        userPhone: phone,
        userEmail: email,
        orderId,
        buyable,
        eventName: action_name,
        eventLocations: locations,
        domain: process.env.SELF_URL,
        _
      } );

      mail.send(
        email,
        _( "success_payment" ),
        "",
        mail_
      );
    }
    else if( OrderStatus === 7 ) await transaction.query(
      `update action_reservations
      set form_url = null
      where order_id = $1`,
      [ orderId ]
    );

    await transaction.query( "commit" );
    transaction.release();

    return res.json( {
      ok: true,
      data: {
        orderStatus: OrderStatus,
        orderStatusMessage: OrderStatusMessage,
        name,
        surname,
        formUrl
      }
    } );
  }

  console.log( `[PAYMENT CHECK] ${OrderStatus} ${OrderStatusMessage}` );

  return res.json( { status: 502, message: "See server logs" } );
}
