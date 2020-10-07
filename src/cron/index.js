"use strict";

const Cron = require( "./core" );
let cron = null;

module.exports = { init, get };

async function init( driver, updateDelay, updateLimit ){
  if( !cron ){
    cron = new Cron( driver, { updateDelay, updateLimit } );
    await cron.start();
  }
}

function get(){
  return cron;
}
