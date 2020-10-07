"use strict";

import crypto from "crypto";
import { toInt } from "/helpers/converters";
import { writeFile, unlink } from "/helpers/promisified";

export {
  post,
  put,
  del
};

async function post( req, res ){
  const id = toInt( req.params.slug );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { file } = req;

  if( file === undefined )
    return res.error( 13 );

  const { originalname, buffer, size } = file;

  if( ( size / Math.pow( 2, 20 ) ) >= 1 )
    return res.error( 14 );

  const ext = originalname.slice( originalname.lastIndexOf( "." ) + 1, originalname.length );

  if( ![ "png", "jpg", "jpeg" ].includes( ext ) )
    return res.error( 15 );

  const time = ( new Date() ).getTime();
  const seed = crypto.randomBytes( 5 ).toString( "hex" );
  const hash = crypto.createHash( "sha512" );

  hash.update( `${id}${originalname}${size}${time}${seed}` );

  const path = `img/compiliations/${hash.digest( "hex" )}.${ext}`;

  const transaction = await req.database.pool.connect();

  await transaction.query( "begin" );

  const { id: id_ } = ( await transaction.query(
    `update compiliations
    set image_url = $1
    where id = $2
    returning id`,
    [ path, id ]
  ) ).rows[0];

  if( id_ !== id )
    await transaction.query( "rollback" );
  else{
    await writeFile( `static/${path}`, buffer );
    await transaction.query( "commit" );
  }

  await transaction.release();

  res.success();
}

async function put( {
  params: { slug },
  file,
  database: { pool }
}, res ){
  const id = toInt( slug );

  if( id === null || id < 1 )
    return res.error( 9 );

  if( file === undefined )
    return res.error( 13 );

  const { originalname, buffer, size } = file;

  if( ( size / Math.pow( 2, 20 ) ) >= 1 )
    return res.error( 14 );

  const ext = originalname.slice( originalname.lastIndexOf( "." ) + 1, originalname.length );

  if( ![ "png", "jpg", "jpeg" ].includes( ext ) )
    return res.error( 15 );

  const { rows: [ row ] } = await pool.query(
    `select image_url
    from compiliations
    where id = $1`,
    [ id ]
  );

  if( row === undefined )
    return res.json( { errors: [ `Invalid compiliation (${id})` ] } );

  if( row.image_url !== null && !row.image_url.startsWith( "http" ) )
    await writeFile( `static/${row.image_url}`, buffer );

  res.success();
}

async function del( {
  params: { slug },
  database: { pool }
}, res ){
  const id = toInt( slug );

  if( id === null || id < 1 )
    return res.error( 9 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: [ row ] } = await transaction.query(
    `select image_url
    from compiliations
    where id = $1`,
    [ id ]
  );

  if( row === undefined ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( { errors: [ `Invalid compiliation (${id})` ] } );
  }

  const { image_url } = row;

  await pool.query(
    `update compiliations
    set image_url = null
    where id = $1`,
    [ id ]
  );

  if( image_url !== null && !image_url.startsWith( "http" ) )
    await unlink( `static/${image_url}` );

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
