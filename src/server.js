"use strict";

// Imports
import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";
import helmet from "helmet";
import bodyParser from "body-parser";
import session from "express-session";
import pgStoreConnect from "connect-pg-simple";

// Config, database
import "./configs/env";
import database from "./database";

// Cron
import { init as initCron } from "./cron";
import cronDriver from "./cron/drivers/pg";

// Helpers
import mail from "./helpers/mail";
import i18n from "./helpers/i18n";
import routeControl from "./helpers/routeControl";

// Consts
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const pgStore = pgStoreConnect( session );
const server = express();

// #fix добавить логгер
// Settings
server.use(
  helmet(),
  bodyParser.json(),
  bodyParser.urlencoded( {
    extended: true
  } ),
  session( {
    cookie: {
      httpOnly: true,
      maxAge: !dev ? parseInt( process.env.SESSION_COOKIE_MAXAGE ) : null,
      secure: !dev && process.env.SESSION_COOKIE_SECURE === "true"
    },
    name: !dev ? process.env.SESSION_NAME : null,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: !dev ? process.env.SESSION_SECRET : "secret",
    store: new pgStore( {
      pool: database.pool,
      tableName: process.env.SESSION_TABLE_NAME
    } )
  } ),
  compression( {
    threshold: 0
  } )
);

// Some upgrade
server.use( ( req, res, next ) => {
  req.database = database;
  res.success = ( code, data ) => res.json( database.success( code, data ) );
  res.error = code => res.json( database.error( code ) );
  req.mail = mail;

  if( typeof req.session.isLogged !== "boolean" ) req.session.isLogged = false;
  if( !req.session.name ) req.session.name = "";
  if( !req.session.surname ) req.session.surname = "";
  if( !req.session.email ) req.session.email = "";
  if( !req.session.phone ) req.session.phone = "";
  if( !req.session.userId ) req.session.userId = 0;
  if( !req.session.role ) req.session.role = "user";
  if( !req.session.locale ) req.session.locale = "ru";

  req._ = i18n( req.session.locale );

  next();
} );

// Role control
routeControl( server );

// Run
server
  .use(
    sirv( "static", {
      dev
    } ),
    sapper.middleware( {
      session: ( req, res ) => ( {
        "user-agent": req.headers[ "user-agent" ],
        isLogged: req.session.isLogged,
        name: req.session.name,
        surname: req.session.surname,
        email: req.session.email,
        userId: req.session.userId,
        role: req.session.role,
        locale: req.session.locale,
        phone: req.session.phone
      } )
    } )
  )
  .listen( PORT, err => {
  	if( err ) console.log( "error", err );
  } );

// Cron
initCron( cronDriver( database.pool ), process.env.CRON_UPDATE_DELAY, process.env.CRON_UPDATE_LIMIT );
