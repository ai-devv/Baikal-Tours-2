import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Translates" );
  }

  async createOrEdit( client, actionId, locale, {
    title, name, short_description,
    full_description, organizer_name, contact_faces,
    alt, instagram_widget_title
  } ){
    let values = [ "$1", "$2" ];
    let sets = [];
    let params = [ actionId, locale ];
    let i = 3;

    if( title ){
      values.push( `$${i++}` );
      sets.push( `title = excluded.title` );
      params.push( title );
    }
    else values.push( "null" );

    if( name ){
      values.push( `$${i++}` );
      sets.push( `name = excluded.name` );
      params.push( name );
    }
    else values.push( "''" );

    if( short_description ){
      values.push( `$${i++}` );
      sets.push( `short_description = excluded.short_description` );
      params.push( short_description );
    }
    else values.push( "''" );

    if( full_description ){
      values.push( `$${i++}` );
      sets.push( `full_description = excluded.full_description` );
      params.push( full_description );
    }
    else values.push( "''" );

    if( organizer_name ){
      values.push( `$${i++}` );
      sets.push( `organizer_name = excluded.organizer_name` );
      params.push( organizer_name );
    }
    else values.push( "''" );

    if( contact_faces ){
      values.push( `$${i++}` );
      sets.push( `contact_faces = excluded.contact_faces` );
      params.push( contact_faces );
    }
    else values.push( "null" );

    if( alt ){
      values.push( `$${i++}` );
      sets.push( `alt = excluded.alt` );
      params.push( alt );
    }
    else values.push( "''" );

    if( instagram_widget_title ){
      values.push( `$${i++}` );
      sets.push( `instagram_widget_title = excluded.instagram_widget_title` );
      params.push( instagram_widget_title );
    }
    else values.push( "null" );

    values = values.join( "," );
    sets = sets.join( "," );

    await client.query(
      `insert into actions_translates( action_id, locale, title, name, short_description, full_description, organizer_name, contact_faces, alt, instagram_widget_title )
      values( ${values} )
      on conflict ( action_id, locale ) do update
      set ${sets}`,
      params
    );
  }
}
