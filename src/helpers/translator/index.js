"use strict";

module.exports = class{
  constructor( engine ){
    this.engine = engine;
    this.directions = {};
    this.translated = {};
  }

  // #fix добавлять через объект со свойствами или через объект с объектами
  add( key, text, fromLocale, toLocales ){
    if( typeof toLocales === "string" )
      toLocales = [ toLocales ];

    toLocales.forEach( toLocale => {
      const directionKey = `${fromLocale}-${toLocale}`;

      if( this.directions[ directionKey ] === undefined )
        this.directions[ directionKey ] = {
          keys: [],
          sources: []
        };

      const direction = this.directions[ directionKey ];

      direction.keys.push( key );
      direction.sources.push( text );
    } );

    return this;
  }

  async translate(){
    if( Object.keys( this.directions ).length === 0 )
      return;

    const promises = [];
    let responses;
    let i = 0;

    for( let directionKey in this.directions )
      promises.push( this.engine( this.directions[ directionKey ].sources, directionKey ) );

    responses = await Promise.all( promises );
    i = 0;

    for( let direction in this.directions ){
      const keys = this.directions[ direction ].keys;
      const toLocale = direction.split( "-" )[1];
      const texts = responses[ i++ ].text;

      keys.forEach( ( key, j ) => {
        if( this.translated[ key ] === undefined ) this.translated[ key ] = {};

        const translated = this.translated[ key ];

        translated[ toLocale ] = texts[j];
      } );
    }
  }

  transform(){
    this.transformed = {};

    for( let key in this.translated )
      for( let locale in this.translated[ key ] ){
        if( this.transformed[ locale ] === undefined )
          this.transformed[ locale ] = {};

        this.transformed[ locale ][ key ] = this.translated[ key ][ locale ];
      }
  }
}
