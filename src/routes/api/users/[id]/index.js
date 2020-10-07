import { toInt } from "/helpers/converters";

export async function get( req, res ){
  if( !req.session.isLogged )
    return res.json( {
      ok: false,
      message: "Unauthorized"
    } );

  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { userId, role } = req.session;

  if( role !== "admin" && id !== userId )
    return res.error( 12 );

  res.json( await req.database.users.getById( id ) );
}

export async function put( req, res ){
  if( !req.session.isLogged )
    return res.json( {
      ok: false,
      message: "Unauthorized"
    } );

  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { userId, role } = req.session;

  if( role !== "admin" ){
    if( id !== userId )
      return res.error( 12 );

    delete req.body.role;
  }

  const errors = await req.database.users.edit( id, req.body );

  if( errors.length > 0 )
    return res.json( {
      ok: false,
      errors
    } );

  if( id === userId ){
    if( req.body.name )
      req.session.name = req.body.name;

    if( req.body.surname )
      req.session.surname = req.body.surname;

    if( req.body.phone )
      req.session.phone = req.body.phone;

    if( req.body.email )
      req.session.email = req.body.email;

    if( req.body.role )
      req.session.role = req.body.role;
  }

  res.success();
}

export async function del( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  res.json( await req.database.users.del( id ) );
}
