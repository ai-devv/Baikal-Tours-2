"use strict";

import { toInt } from "/helpers/converters";
import { writeFile, unlink } from "/helpers/promisified";

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const file = req.file;
  const isMain = req.body.isMain;
  let transaction;

  if( isMain === true )
    transaction = await req.database.actionImages.setMain( id );

  if( file ){
    const { originalname, buffer, size } = file;
    const ext = originalname.slice( originalname.lastIndexOf( "." ) + 1, originalname.length );

    if(
      ( size / Math.pow( 2, 20 ) ) < 1 &&
      [ "png", "jpg", "jpeg" ].includes( ext )
    ){
      const row = await req.database.actionImages.get( id, transaction );

      if( row !== null ){
        const { image_url } = row;

        if( image_url !== null && !image_url.startsWith( "http" ) )
          await writeFile( `static/${image_url}`, buffer );
      }
    }
  }

  if( transaction ) await transaction.end();

  res.success();
}

export async function del( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { transaction, imageUrl } = await req.database.actionImages.delete( id );

  if( imageUrl !== null && !imageUrl.startsWith( "http" ) )
    await unlink( `static/${imageUrl}` );

  await transaction.end();

  res.success();
}
