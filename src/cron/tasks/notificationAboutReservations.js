"use strict";

import { Pool } from "pg";
import nodemailer from "nodemailer";
import databaseConfigs from "/configs/database";
import { createMap, mergeMultiple } from "/helpers/merger";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";
import i18n from "/helpers/i18n/index";

export default index;

async function index( { actionId } ){
  let client;

  try{
    console.log( "[TASK NOTIFICATION ABOUT RESERVATIONS] START" );

    const dev = process.env.NODE_ENV === "development";
    const pool = new Pool( !dev ? databaseConfigs.production : databaseConfigs.development );

    client = await pool.connect();
    await client.query( "begin" );

    const { rows: [ { organizer_ids, last_reservations_count } ] } = await client.query(
      `select organizer_ids, last_reservations_count
      from actions
      where id = $1`,
      [ actionId ]
    );

    const { rows: [ { last_reservations_count: reservation_count } ] } = await client.query(
      `update actions
      set last_reservations_count = (
        select count( 1 ) as reservation_count
        from action_reservations
        where action_id = $1
      )
      where id = $1
      returning last_reservations_count`,
      [ actionId ]
    );

    if( last_reservations_count === reservation_count || reservation_count === 0 ){
      await client.query( "commit" );
      client.release();

      return true;
    }

    const { rows: users } = await client.query(
      `select email, locale
      from users
      where id = any( $1 )`,
      [ organizer_ids ]
    );

    const locales = users.reduce( ( res, { locale } ) => {
      if( !res.includes( locale ) ){
        res.push( locale );
      }

      return res;
    }, [] );

    const actionNames = ( await client.query(
      `select locale, name
      from actions_translates
      where
        action_id = $1 and
        locale = any( $2 )`,
      [ actionId, locales ]
    ) ).rows.reduce( ( res, { locale, name } ) => ( res[ locale ] = name, res ), {} );

    const { rows: buyable } = await client.query(
      `select id, price, type, null as count
      from action_buyable
      where action_id = $1`,
      [ actionId ]
    );
    let buyableNames;

    if( buyable.length > 0 ){
      const map = createMap( buyable, "id" );
      const buyableIds = Object.keys( map );

      buyableNames = ( await client.query(
        `select action_buyable_id, locale, name
        from action_buyable_translates
        where
          locale = any( $1 ) and
          action_buyable_id = any( $2 )`,
        [ locales, buyableIds ]
      ) ).rows.reduce( ( res, { action_buyable_id, locale, name } ) => {
        if( !( locale in res ) ){
          res[ locale ] = {};
        }

        res[ locale ][ action_buyable_id ] = name;

        return res;
      }, {} );

      const { rows: buyableCount } = await client.query(
        `select
        	ar.paid, arb.action_buyable_id,
          sum( arb.count )::int as count
        from
        	action_reservations as ar,
          action_reservations_buyable as arb
        where
        	arb.action_buyable_id = any( $1 ) and
          ar.id = arb.action_reservation_id
        group by ar.paid, arb.action_buyable_id
        order by arb.action_buyable_id`,
        [ buyableIds ]
      );

      mergeMultiple( buyable, buyableCount, "action_buyable_id", "count", { remove: true, map } );
    }

    const templateName = "reservationNotification";
    // #fix проверка
    const filler = fillers[ templateName ];
    // #fix проверка
    const template = await getTemplate( templateName );
    // #fix проверка
    const texts = await getTemplateTexts( client, locales, templateName );
    let i18ns = {};

    await client.query( "commit" );
    client.release();

    const mails = locales.reduce( ( res, locale ) => {
      i18ns[ locale ] = i18n( locale );

      const data = {
        eventName: actionNames[ locale ],
        registeredCount: reservation_count,
        domain: process.env.SELF_URL,
        buyable: buyable.map( el => ( el.name = buyableNames[ locale ][ el.id ], el ) ),
        _: i18ns[ locale ]
      };

      res[ locale ] = filler( template, texts[ locale ], data );

      return res;
    }, {} );

    const mail = nodemailer.createTransport( {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS
      }
    } );

    for( const { email, locale } of users ){
      mail.sendMail( {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: i18ns[ locale ]( "notification_about_reservations" ),
        html: mails[ locale ]
      } );
    }
  } catch( error ) {
    if( client ){
      await client.query( "rollback" );
      client.release();
    }

    console.log( error );

    return false;
  }
}
