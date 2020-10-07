"use strict";

export {
  createOrEdit
};

async function createOrEdit( client, compiliationId, locale, { title, name, tagline, description } ){
  let values = [ "$1", "$2" ];
  let sets = [];
  const params = [ compiliationId, locale ];
  let i = 3;

  if( typeof title === "string" && title !== "" ){
    values.push( `$${i++}` );
    sets.push( `title = excluded.title` );
    params.push( title );
  }
  else values.push( "''" );

  if( typeof name === "string" && name !== "" ){
    values.push( `$${i++}` );
    sets.push( `name = excluded.name` );
    params.push( name );
  }
  else values.push( "''" );

  if( typeof tagline === "string" && tagline !== "" ){
    values.push( `$${i++}` );
    sets.push( `tagline = excluded.tagline` );
    params.push( tagline );
  }
  else values.push( "''" );

  if( typeof description === "string" && description !== "" ){
    values.push( `$${i++}` );
    sets.push( `description = excluded.description` );
    params.push( description );
  }
  else values.push( "''" );

  if( sets.length > 0 ){
    values = values.join( "," );
    sets = sets.join( "," );

    try{
      await client.query(
        `insert into compiliations_translates( compiliation_id, locale, title, name, tagline, description )
        values( ${values} )
        on conflict ( compiliation_id, locale ) do update
        set ${sets}`,
        params
      );
    } catch( e ) {
      if( e.code === "23503" )
        return `Invalid compiliation ID (${compiliationId})`;

      throw e;
    }
  }

  return true;
}
