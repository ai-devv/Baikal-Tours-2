"use strict";

import Foundation from "./helpers/foundation";
import crypto from "crypto";
import saltNHash from "./helpers/saltNHash";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Auth" );
  }

  createPassword(){
    const password = crypto.randomBytes( 10 ).toString( "hex" );
    const { hashAndSalt } = saltNHash( password, {
      hashAlgorithm: process.env.HASH_ALGORITHM,
      saltLength: process.env.SALT_LENGTH
    } );

    return { password, hashAndSalt };
  }

  async signup( name, surname, phone, email, locale ){
    email = email.toLowerCase();

    const { password, hashAndSalt } = this.createPassword();
    const row = ( await super.query(
      `insert into users( name, surname, phone, email, password, locale )
      values( $1, $2, $3, $4, $5, $6 )
      on conflict do nothing
      returning 1`,
      [ name, surname, phone, email, hashAndSalt, locale ]
    ) ).rows[0];

    if( row !== undefined ) return super.success( 0, password );

    return super.error( 2 );
  }

  async signin( phoneOrEmail, password ){
    phoneOrEmail = phoneOrEmail.toLowerCase();

    const row = ( await super.query(
      `select id, name, surname, phone, email, password, password_confirmed, role, locale
      from users
      where
        phone = $1 or
        email = $1`,
      [ phoneOrEmail ]
    ) ).rows[0];

    if( row === undefined ) return super.error( 3 );

    const password_ = row.password.split( ";" );
    const { hash } = saltNHash( password, {
      hashAlgorithm: process.env.HASH_ALGORITHM,
      salt: password_[1]
    } );

    if( password_[0] !== hash ) return super.error( 4 );
    if( !row.password_confirmed ) await super.query(
      `update users
      set password_confirmed = true
      where id = $1`,
      [ row.id ]
    );

    return super.success( 0, {
      name: row.name,
      surname: row.surname,
      phone: row.phone,
      email: row.email,
      userId: row.id,
      role: row.role,
      locale: row.locale
    } );
  }

  async restorePassword( email ){
    const client = await super.transaction();

    const { rows: [ row ] } = await client.query(
      `select restore_expires, restore_count
      from users
      where email = $1`,
      [ email ]
    );

    if( row === undefined ){
      await client.end( false );

      return { errors: [ `Email ${email} not found` ] };
    }

    let { restore_expires, restore_count } = row;
    const { password, hashAndSalt } = this.createPassword();
    const sets = [ `password = $1` ];
    const params = [ hashAndSalt, email ];
    let i = 3;
    const now = Math.floor( Date.now() / 1000 );

    if( restore_expires === null || restore_expires <= now ){
      sets.push( `restore_expires = $${i++}` );
      sets.push( `restore_count = $${i++}` );
      params.push( now + 30 * 24 * 60 * 60 );
      params.push( 1 );
    }
    else if( ++restore_count > 4 ){
      await client.end( false );

      return { errors: [ `Restoring password must be maximum 4 times per month` ] };
    } else {
      sets.push( `restore_count = $${i++}` );
      params.push( restore_count );
    }

    await client.query(
      `update users
      set ${sets}
      where email = $2`,
      params
    );
    await client.end();

    return password;
  }
}
