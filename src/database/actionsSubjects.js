"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Subjects" );
  }

  async create( actionId, subjectIds, client ){
    if( !Array.isArray( subjectIds ) || subjectIds.length === 0 )
      return;

    let values = [];
    const params = [ actionId ];
    let i = 2;

    if( client === undefined )
      client = this.modules.pool;

    subjectIds.forEach( subjectId => {
      values.push( `( $1, $${i++} )` );
      params.push( subjectId );
    } );

    values = values.join( "," );

    await client.query(
      `insert into actions_subjects( action_id, subject_id )
      values ${values}
      on conflict do nothing`,
      params
    );
  }

  async edit( actionId, oldSubjectId, newSubjectId, client ){
    if( client === undefined )
      client = this.modules.pool;

    await client.query(
      `update actions_subjects
      set subject_id = $1
      where
        action_id = $2 and
        subject_id = $3`,
      [ newSubjectId, actionId, oldSubjectId ]
    );
  }

  async del( actionId, subjectIds, client ){
    if( client === undefined )
      client = this.modules.pool;

    await client.query(
      `delete from actions_subjects
      where
        action_id = $1 and
        subject_id = any( $2::int[] )`,
      [ actionId, subjectIds ]
    );
  }
}
