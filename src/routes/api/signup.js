"use strict";

import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";

// Errors: 2, 3, 4, 5
export async function post( req, res ){
  let result;

  if( req.query.action === "start" ){
    let { name, surname } = req.body;

    if(
      typeof req.body.phone !== "string" || req.body.phone === "" ||
      typeof req.body.email !== "string" || req.body.email === ""
    ) return res.json( { errors: [ "Invalid phone or email" ] } );

    if( typeof name !== "string" )
      name = "";

    if( typeof surname !== "string" )
      surname = "";

    result = await req.database.auth.signup(
      name,
      surname,
      req.body.phone,
      req.body.email,
      req.session.locale
    );

    if( !result.ok ) return res.json( result );

    const templateName = "registration";
    // #fix проверка
    const filler = fillers[ templateName ];
    // #fix проверка
    const template = await getTemplate( templateName );
    // #fix проверка
    const { [ req.session.locale ]: texts } = await getTemplateTexts( req.database.pool, [ req.session.locale ], templateName );

    const mail = filler( template, texts, {
      userEmail: req.body.email,
      userPassword: result.data,
      domain: process.env.SELF_URL
    } );

    req.mail.send(
      req.body.email,
      req._( "registration" ),
      "",
      mail
    );

    return res.success();
  }
  else if( req.query.action === "confirm" ){
    if(
      typeof req.body.phoneOrEmail !== "string" || req.body.phoneOrEmail === "" ||
      typeof req.body.password !== "string" || req.body.password === ""
    ) return res.json( { errors: [ "Invalid phone, email or password" ] } );

    result = await req.database.auth.signin(
      req.body.phoneOrEmail,
      req.body.password
    );

    if( !result.ok ) return res.json( result );

    req.session.isLogged = true;
    req.session.name = result.data.name;
    req.session.surname = result.data.surname;
    req.session.phone = result.data.phone;
    req.session.email = result.data.email;
    req.session.userId = result.data.userId;
    req.session.role = result.data.role;

    return res.success( 0, {
      name: result.data.name,
      surname: result.data.surname,
      email: result.data.email,
      userId: result.data.userId
    } );
  }

  res.error( 5 );
}
