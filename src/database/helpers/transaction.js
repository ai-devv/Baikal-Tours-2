"use strict";

class Transaction{
  constructor( client ){
    this.client = client;
    this.state = 0;
    this.count = 1;
  }

  async open(){
    if( this.state > 0 ) return;

    this.client = await this.client.connect();
    await this.client.query( "begin" );
    this.state = 1;
  }

  async end( mode ){
    if( this.state === 0 || this.state === 2 ) return;

    if( mode === false ) await this.client.query( "rollback" );
    else await this.client.query( "commit" );

    await this.client.release();
    this.state = 2;
  }

  async query( sql, data ){
    try{
      if( this.state === 2 ) throw "Client released";

      let result;

      await this.open();
      result = await this.client.query( sql, data );
      this.count++;

      return result;
    }
    catch( error ){
      if( this.state < 2 ){
        console.log( `Query number ${this.count}` );
        console.log( `  ${error}` );

        await this.end( false );
      }

      throw "Problems with database";
    }
  }
}

module.exports = Transaction;
