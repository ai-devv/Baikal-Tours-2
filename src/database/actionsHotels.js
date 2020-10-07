"use strict";

export {
  create,
  edit,
  del
};

async function create( client, actionId, hotelId, before ){
  const params = [ actionId, hotelId ];

  if( Number.isInteger( before ) && before > 0 ){
    const before_ = ( await client.query(
      `select 1
      from actions_hotels
      where
        action_id = $1 and
        number = $2`,
      [ actionId, before ]
    ) ).rows[0];

    if( before_ === undefined )
      return { errors: [ `Element with number ${before} not exists (field "before")` ] };

    params.push( before );

    await client.query(
      `update actions_hotels
      set number = number + 1
      where
        action_id = $1 and
        number >= $2`,
      [ actionId, before ]
    );
  }

  let sql =
    `insert into actions_hotels( action_id, hotel_id, number )
    values ( $1, $2, {number} )`;

  if( Number.isInteger( before ) && before > 0 )
    sql = sql.replace( "{number}", "$3" );
  else
    sql = sql.replace( "{number}",
      `( select
        case
          when max( number ) is null then 1
          else max( number + 1 )
        end
      from actions_hotels
      where action_id = $1 )`
    );

  try{
    await client.query( sql, params );
  } catch( e ) {
    if( e.code === "23505" )
      return { errors: [ `For this actions (${actionId}) this hotel (${hotelId}) already exists` ] };

    throw e;
  }

  return true;
}

async function edit( client, actionId, hotelId, number, action ){
  const { rows: [ tuple ] } = await client.query(
    `select number
    from actions_hotels
    where
      action_id = $1 and
      hotel_id = $2`,
    [ actionId, hotelId ]
  );

  if( tuple === undefined )
    return { errors: [ `No data for action (${actionId}) and hotel (${hotelId})` ] };

  if( number === tuple.number )
    return { errors: [ `Number of action (${actionId}) is equals to sended number (${number})` ] };

  const { rowCount } = ( await client.query(
    `select 1
    from actions_hotels
    where
      action_id = $1 and
      number = $2`,
    [ actionId, number ]
  ) );

  if( rowCount === 0 )
    return { errors: [ `No element with actionId ${actionId} and number ${number}` ] };

  // #fix add more actions
  if( action === "swipe" ){
    await client.query(
      `update actions_hotels
      set number = $1
      where
        action_id = $2 and
        number = $3`,
      [ tuple.number, actionId, number ]
    );

    await client.query(
      `update actions_hotels
      set number = $1
      where
        action_id = $2 and
        hotel_id = $3`,
      [ number, actionId, hotelId ]
    );
  }

  return true;
}

async function del( client, actionId, hotelId ){
  const { rows: [ row ] } = await client.query(
    `delete from actions_hotels
    where
      action_id = $1 and
      hotel_id = $2
    returning number`,
    [ actionId, hotelId ]
  );

  if( row === undefined )
    return { errors: [ `No data for action (${actionId}) and hotel (${hotelId})` ] };

  await client.query(
    `update actions_hotels
    set number = number - 1
    where
      action_id = $1 and
      number > $2`,
    [ actionId, row.number ]
  );

  return true;
}
