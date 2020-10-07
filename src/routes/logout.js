"use strict";

export async function get( req, res ){
  req.session.isLogged = false;
  req.session.name = "";
  req.session.surname = "";
  req.session.phone = "";
  req.session.email = "";
  req.session.userId = 0;
  req.session.role = "user";

  res.redirect( "/" );
}
