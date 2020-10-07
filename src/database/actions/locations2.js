"use strict";

export {
  create,
  edit,
  remove
};

// #fix add address & coords
async function create( client, actionId, location2Id ){
  try{
    await client.query(
      `insert into actions_locations2( action_id, location2_id )
      values( $1, $2 )`,
      [ actionId, location2Id ]
    );

    return true;
  } catch( e ) {
    if( e.code === "23503" )
      return `Invalid action ID (${actionId}) or location2 ID (${location2Id})`;

    if( e.code === "23505" )
      return `Item with action ID (${actionId}) and location2 ID (${location2Id}) already exists`;

    throw e;
  }
}

// #fix add address & coords
async function edit( client, actionId, oldLocation2Id, newLocation2Id ){
  try{
    console.log( actionId, oldLocation2Id, newLocation2Id );
    const { rowCount } = await client.query(
      `update actions_locations2
      set location2_id = $1
      where
        action_id = $2 and
        location2_id = $3`,
      [ newLocation2Id, actionId, oldLocation2Id ]
    );

    if( rowCount === 0 )
      return `Invalid action ID (${actionId}) or location2 ID (${oldLocation2Id})`;

    return true;
  } catch( e ) {
    if( e.code === "23503" )
      return `Invalid location ID (${newLocation2Id})`;

    if( e.code === "23505" )
      return `Item with action ID (${actionId}) and location ID (${newLocation2Id}) already exists`;

    throw e;
  }
}

async function remove( client, actionId, location2Id ){
  const { rowCount } = await client.query(
    `delete from actions_locations2
    where
      action_id = $1 and
      location2_id = $2`,
    [ actionId, location2Id ]
  );

  if( rowCount === 0 )
    return `Invalid action ID (${actionId}) or location2 ID (${location2Id})`;

  return true;
}
