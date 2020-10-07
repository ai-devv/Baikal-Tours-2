"use strict";

export {
  createMap,
  merge,
  mergeSingle,
  mergeMultiple
};

function createMap( arr, byKey ){
  const map = {};

  arr.forEach( ( field, i ) => {
    const mapKey = field[ byKey ];

    if( !( mapKey in map ) )
      map[ mapKey ] = [];

    map[ mapKey ].push( i );
  } );

  return map;
}

function merge( mergeType, arr0, arr1, byKey, newKey, options ){
  if( mergeType !== "single" && mergeType !== "multiple" )
    mergeType = "multiple";

  if(
    options === null ||
    Array.isArray( options ) ||
    typeof options !== "object"
  ) options = {};

  let { map, field: currentField } = options;
  const { remove } = options;

  if( typeof map !== "object" || Array.isArray( map ) )
    map = createMap( arr0, byKey );

  if( currentField === "." )
    currentField = newKey;

  arr1.forEach( field => {
    const indexes = map[ field[ byKey ] ];

    if( typeof currentField === "string" && currentField !== "" )
      field = field[ currentField ];
    else if( remove === true )
      delete field[ byKey ];

    indexes.forEach( index => {
      const field_ = arr0[ index ];

      if( mergeType === "single" )
        field_[ newKey ] = field;
      else{
        if( !Array.isArray( field_[ newKey ] ) )
          field_[ newKey ] = [];

        field_[ newKey ].push( field );
      }
    } );
  } );
}

function mergeSingle( arr0, arr1, byKey, newKey, options ){
  merge( "single", arr0, arr1, byKey, newKey, options );
}

function mergeMultiple( arr0, arr1, byKey, newKey, options ){
  merge( "multiple", arr0, arr1, byKey, newKey, options );
}
