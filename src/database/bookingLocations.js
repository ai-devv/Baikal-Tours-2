"use strict";

export {
  getAll,
  edit
};

async function getAll( client, location2name ){
  let fields = "";
  let from = "";

  if( location2name ){
    fields = ", l2.name as location2_name";
    from = "left join locations2 as l2 on l2.id = bl.location2_id";
  }

  const { rows } = await client.query(
    `select bl.id, bl.name${fields}
    from booking_locations as bl ${from}
    order by bl.id`
  );

  return rows;
}

async function edit( client, id, location2Id ){
  try{
    if( location2Id !== null ) await client.query(
      `update booking_locations
      set location2_id = null
      where location2_id = $1`,
      [ location2Id ]
    );

    const { rowCount } = await client.query(
      `update booking_locations
      set location2_id = $1
      where id = $2`,
      [ location2Id, id ]
    );

    if( rowCount === 0 )
      return `Invalid ID (${id})`;

    return true;
  } catch( e ) {
    if( e.code === "23503" )
      return `Invalid location2 ID (${location2Id})`;

    throw e;
  }
}
