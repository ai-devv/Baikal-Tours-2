"use strict";

// Errors: 3, 4
export async function post( req, res ){
  if(
    typeof req.body.phoneOrEmail !== "string" || req.body.phoneOrEmail === "" ||
    typeof req.body.password !== "string" || req.body.password === ""
  ) return res.json( { errors: [ "Invalid phone, email or password" ] } );

  const result = await req.database.auth.signin(
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
  req.session.locale = result.data.locale;

  res.success( 0, {
    name: result.data.name,
    surname: result.data.surname,
    email: result.data.email,
    userId: result.data.userId
  } );
}
