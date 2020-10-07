"use strict";

import crypto from "crypto";
import { toInt } from "/helpers/converters";
import { writeFile } from "/helpers/promisified";

export async function post( req, res ){
  const actionId = toInt( req.body.actionId );

  if( actionId === null || actionId < 1 )
    return res.error( 9 );

  const images = req.files;

  if( !Array.isArray( images ) || images.length === 0 )
    return res.success();

  const buffers = [];
  const paths = [];

  for( let { originalname, buffer, size } of images ){
    if( ( size / Math.pow( 2, 20 ) ) >= 1 ) continue;

    const ext = originalname.slice( originalname.lastIndexOf( "." ) + 1, originalname.length );

    if( ![ "png", "jpg", "jpeg" ].includes( ext ) ) continue;

    const time = ( new Date() ).getTime();
    const seed = crypto.randomBytes( 5 ).toString( "hex" );
    const hash = crypto.createHash( "sha512" );

    buffers.push( buffer );
    hash.update( `${actionId}${originalname}${size}${time}${seed}` );
    paths.push( `img/actions/${hash.digest( "hex" )}.${ext}` );
  }

  if( paths.length === 0 )
    return res.success();

  const { transaction, ids } = await req.database.actionImages.create( actionId, paths );

  paths.forEach( async ( path, i ) => {
    await writeFile( `static/${path}`, buffers[i] );
  } );

  await transaction.end();

  res.success( 0, ids );
}
