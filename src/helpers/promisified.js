import {
  writeFile as fsWriteFile,
  unlink as fsUnlink,
  access as fsAccess,
  mkdir as fsMkdir,
  readFile as fsReadFile
} from "fs";

export {
  writeFile,
  unlink,
  access,
  mkdir,
  readFile
};

function writeFile( path, data ){
  return new Promise( ( res, rej ) => {
    fsWriteFile( path, data, err => {
      if( err ) rej( err );
      else res();
    } );
  } );
}

function unlink( path ){
  return new Promise( ( res, rej ) => {
    fsUnlink( path, err => {
      if( err ) rej( err );
      else res();
    } );
  } );
}

function access( path ){
  return new Promise( res => {
    fsAccess( path, err => {
      if( err ) res( false );
      else res( true );
    } );
  } );
}

function mkdir( path ){
  return new Promise( ( res, rej ) => {
    fsMkdir( path, err => {
      if( err ) rej( err );
      else res();
    } );
  } );
}

function readFile( path ){
  return new Promise( ( res, rej ) => fsReadFile( path, "utf8", ( err, data ) => {
    if( err ) return rej( err );

    res( data );
  } ) );
}
