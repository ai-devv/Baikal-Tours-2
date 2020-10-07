"use strict";

import { Pool } from "pg";
import nodemailer from "nodemailer";
import databaseConfigs from "/configs/database";
import { createMap, mergeMultiple } from "/helpers/merger";
import i18n from "/helpers/i18n/index";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";

export default index;

async function index( { digestPeriod } ){
  let pool;
  let users;
  let locales;
  let subjects;
  let map;

  try{
    console.log( `[TASK DIGEST] START (${digestPeriod})` );

    const dev = process.env.NODE_ENV === "development";

    pool = new Pool( !dev ? databaseConfigs.production : databaseConfigs.development );

    ( { rows: users } = await pool.query(
      `select locale, email, digest_subjects
      from users
      where
        digest_period = $1 and
        not digest_subjects is null`,
      [ digestPeriod ]
    ) );

    if( users.length === 0 ){
      console.log( "[TASK DIGEST] Users for digest not found" );

      return true;
    }

    let subjectIds = [];

    locales = users.reduce( ( res, { locale, digest_subjects } ) => {
      for( const subjectId of digest_subjects ){
        if( !subjectIds.includes( subjectId ) ){
          subjectIds.push( subjectId );
        }
      }

      if( !res.includes( locale ) ){
        res.push( locale );
      }

      return res;
    }, [] );

    ( { rows: subjects } = await pool.query(
      `select
        s.id as subject_id, s.name as subject_name, s.locale,
        a.id as action_id, a.slug, ai.image_url,
        at.name,
        '{}'::int[] as dates,
        '{}'::int[] as locations,
        at.short_description as description
      from
        subjects as s,
        actions_subjects as asu,
        actions as a,
        action_images as ai,
        actions_translates as at
      where
        s.locale = any( $1 ) and
        at.locale = s.locale and
        s.id = any( $2 ) and
        a.status = 'active' and
        ai.is_main = true and
        s.id = asu.subject_id and
        asu.action_id = a.id and
        a.id = ai.action_id and
        a.id = at.action_id`,
      [ locales, subjectIds ]
    ) );

    if( subjects.length === 0 ){
      console.log( "[TASK DIGEST] Actions not found" );

      return true;
    }

    map = createMap( subjects, "action_id" );

    const actionIds = Object.keys( map );

    const { rows: dates } = await pool.query(
      `select *
      from action_dates
      where action_id = any( $1 )`,
      [ actionIds ]
    );

    mergeMultiple( subjects, dates, "action_id", "dates", { remove: true, map } );

    const { rows: locations } = await pool.query(
      `select
        al2.action_id, l2.locale,
        l2.name ||
        case
          when al2.address is null then ''
          else ', ' || al2.address
        end as name
      from
        locations2 as l2,
        actions_locations2 as al2
      where
        l2.locale = any( $1 ) and
        al2.action_id = any( $2 ) and
        l2.id = al2.location2_id`,
      [ locales, actionIds ]
    );

    for( const { action_id, locale, name } of locations ){
      const actionIds_ = map[ action_id ];

      for( const actionId of actionIds_ ){
        const action = subjects[ actionId ];

        if( action.locale !== locale ) continue;

        if( action.locations === null ){
          action.locations = [ name ];
        } else {
          action.locations.push( name );
        }
      }
    }
  } catch( error ){
    console.log( error );

    return false;
  }

  subjects = subjects.reduce( ( res, { subject_id, subject_name, locale, image_url, ...action } ) => {
    if( !( locale in res ) ){
      res[ locale ] = {};
    }

    if( !( subject_id in res[ locale ] ) ){
      res[ locale ][ subject_id ] = {
        name: subject_name,
        actions: []
      };
    }

    res[ locale ][ subject_id ].actions.push( {
      imageUrl: image_url,
      ...action
    } );

    return res;
  }, {} );

  const i18ns = locales.reduce( ( res, locale ) => ( res[ locale ] = i18n( locale ), res ), {} );
  const templateName = "digest";
  // #fix проверка
  const filler = fillers[ templateName ];
  // #fix проверка
  const template = await getTemplate( templateName );
  // #fix проверка
  const texts = await getTemplateTexts( pool, locales, templateName );

  const mail = nodemailer.createTransport( {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS
    }
  } );

  for( const { locale, email, digest_subjects } of users ){
    let actionIds_ = [];
    const subjects_ = [];

    for( const subjectId of digest_subjects ){
      const actions = [];
      const actions_ = subjects[ locale ][ subjectId ].actions;

      // #fix вынести 4
      for( let i = 0; i < actions_.length && actions.length < 4; i++ ){
        if( !actionIds_.includes( actions_[i].action_id ) ){
          actions.push( actions_[i] );
        }
      }

      if( actions.length === 0 ) continue;

      actionIds_ = [ ...actionIds_, ...actions.map( ( { action_id } ) => action_id ) ];

      subjects_.push( {
        name: subjects[ locale ][ subjectId ].name,
        actions
      } );
    }

    const mail_ = filler( template, texts[ locale ], {
      domain: process.env.SELF_URL,
      subjects: subjects_,
      _: i18ns[ locale ]
    } );

    mail.sendMail( {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: i18ns[ locale ]( "event_digest" ),
      html: mail_
    } );
  }
}
