"use strict";

import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";

export {
  get
};

async function get( {
  session,
  query: { email },
  database: { pool, auth },
  mail,
  _
}, res ){
  const result = await auth.restorePassword( email );

  if( result !== null && typeof result === "object" && !Array.isArray( result ) && "errors" in result )
    return res.json( result );

  session.isLogged = false;
  session.name = "";
  session.surname = "";
  session.email = "";
  session.userId = 0;
  session.role = "user";

  const templateName = "newPassword";
  // #fix проверка
  const filler = fillers[ templateName ];
  // #fix проверка
  const template = await getTemplate( templateName );
  // #fix проверка
  const { [ session.locale ]: texts } = await getTemplateTexts( pool, [ session.locale ], templateName );

  const mail_ = filler( template, texts, {
    userPassword: result,
    domain: process.env.SELF_URL
  } );

  mail.send(
    email,
    _( "new_password" ),
    "",
    mail_
  );

  res.success();
}
