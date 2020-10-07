"use strict";

import crypto from "crypto";
import { toInt } from "/helpers/converters";
import { writeFile } from "/helpers/promisified";

export async function post( req, res ){
  if( req.file === undefined )
    return res.error( 13 );

  const actionId = toInt( req.body.actionId );

  if( actionId === null || actionId < 1 )
    return res.error( 9 );

  const { originalname, buffer, size } = req.file;

  if( ( size / Math.pow( 2, 20 ) ) >= 1 )
    return res.error( 14 );

  const ext = originalname.slice( originalname.lastIndexOf( "." ) + 1, originalname.length );

  if( ![ "png", "jpg", "jpeg" ].includes( ext ) )
    return res.error( 15 );

  const time = ( new Date() ).getTime();
  const seed = crypto.randomBytes( 5 ).toString( "hex" );
  const hash = crypto.createHash( "sha512" );

  hash.update( `${actionId}${originalname}${size}${time}${seed}` );

  const path = `img/partners/${hash.digest( "hex" )}.${ext}`;
  const { transaction, id } = await req.database.actionPartners.create( actionId, req.body.name, path );

  await writeFile( `static/${path}`, buffer );
  await transaction.end();

  res.success( 0, id );
}
