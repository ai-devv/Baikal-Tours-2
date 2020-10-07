"use strict";

import { Pool } from "pg";
import nodemailer from "nodemailer";
import databaseConfigs from "/configs/database";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";
import i18n from "/helpers/i18n/index";

export default index;

async function index( { actionReservationId } ){
  try{
    console.debug( `[TASK NOTIFICATION ABOUT UNPAID RESERVATION] Start (${actionReservationId})` );

    const dev = process.env.NODE_ENV === "development";
    const pool = new Pool( !dev ? databaseConfigs.production : databaseConfigs.development );

    const { rows: [ reservation ] } = await pool.query(
      `select
        ar.action_id, ar.date, ar.name, ar.surname, ar.phone, ar.email,
        u.locale, at.name as action_name
      from
        action_reservations as ar,
        users as u,
        actions_translates as at
      where
        at.locale = u.locale and
        ar.id = $1 and
        ar.user_id = u.id and
        ar.action_id = at.action_id`,
      [ actionReservationId ]
    );

    if( reservation === undefined ){
      return true;
    }

    const { user_id, action_id, date, name, surname, phone, email, locale, action_name } = reservation;

    const { rows: buyable } = await pool.query(
      `select arb.count, ab.price, ab.type, abt.name
      from
        action_reservations as ar,
        action_reservations_buyable as arb,
        action_buyable as ab,
        action_buyable_translates as abt
      where
        abt.locale = $1 and
        ar.id = $2 and
        ar.id = arb.action_reservation_id and
        arb.action_buyable_id = ab.id and
        ab.id = abt.action_buyable_id`,
      [ locale, actionReservationId ]
    );

    const locations = ( await pool.query(
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
      [ locale, action_id ]
    ) ).rows.map( ( { location } ) => location );

    const templateName = "secondEvent";
    // #fix проверка
    const filler = fillers[ templateName ];
    // #fix проверка
    const template = await getTemplate( templateName );
    // #fix проверка
    const { [ locale ]: texts } = await getTemplateTexts( pool, [ locale ], templateName );
    const _ = i18n( locale );

    const mail_ = filler( template, texts, {
      date,
      name: `${name} ${surname}`,
      userPhone: phone,
      userEmail: email,
      buyable,
      eventName: action_name,
      eventLocations: locations,
      domain: process.env.SELF_URL,
      reminderLink: `${process.env.SELF_URL}/profile?section=actions`,
      _
    } );

    const mail = nodemailer.createTransport( {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS
      }
    } );

    mail.sendMail( {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: _( "notification_about_unpaid_reservation" ),
      html: mail_
    } );
  } catch( error ) {
    console.error( error );

    return false;
  }
}
