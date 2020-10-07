"use strict";

import dicts from "/helpers/i18n/dicts/index";

export async function put( req, res ){
  const locale = dicts[ req.params.locale ];

  if( locale ){
    if( req.session.isLogged ){
      const errors = await req.database.users.edit( req.session.userId, {
        locale: req.params.locale
      } );

      if( errors.length > 0 )
        return res.json( {
          ok: false,
          errors
        } );
    }

    req.session.locale = req.params.locale;
  }
  else return res.error( 11 );

  res.success();
}
