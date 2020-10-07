"use strict";

import Transaction from "./transaction";

class Foundation{
  constructor( modules, className ){
    this.modules = modules;
    this.className = className;
  }

  async query( sql, data ){
    const result = await this.modules.pool.query( sql, data );

    return result;
  }

  transaction(){
    return new Transaction( this.modules.pool );
  }

  success( code, data ){
    return this.modules.success( code, data );
  }

  error( code ){
    return this.modules.error( code );
  }
}

export default Foundation;
