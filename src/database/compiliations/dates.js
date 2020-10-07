"use strict";

export {
  create,
  edit,
  del
};

async function create( client, compiliationId, dateStart, dateEnd, timeStart, timeEnd, days ){
  try{
    const { rows: [ { id } ] } = await client.query(
      `insert into compiliation_dates( compiliation_id, date_start, date_end, time_start, time_end, days )
      values( $1, $2, $3, $4, $5, $6 )
      returning id`,
      [ compiliationId, dateStart, dateEnd, timeStart, timeEnd, days ]
    );

    return id;
  } catch( e ) {
    if( e.code === "23503" )
      return { errors: [ `Invalid compiliation ID (${compiliationId})` ] };

    throw e;
  }
}

async function edit( client, dateId, dateStart, dateEnd, timeStart, timeEnd, days ){
  let sets = [];
  const params = [ dateId ];
  let i = 2;

  if( dateStart !== null ){
    sets.push( `date_start = $${i++}` );
    params.push( dateStart );
  }

  if( dateEnd !== null ){
    sets.push( `date_end = $${i++}` );
    params.push( dateEnd );
  }

  if( timeStart !== null ){
    sets.push( `time_start = $${i++}` );
    params.push( timeStart );
  }

  if( timeEnd !== null ){
    sets.push( `time_end = $${i++}` );
    params.push( timeEnd );
  }

  if( days !== null ){
    sets.push( `days = $${i++}` );
    params.push( days );
  }

  if( sets.length > 0 ){
    sets = sets.join( "," );

    const { rowCount } = await client.query(
      `update compiliation_dates
      set ${sets}
      where id = $1`,
      params
    );

    return rowCount === 1;
  }

  return true;
}

async function del( client, dateId ){
  const { rowCount } = await client.query(
    `delete from compiliation_dates
    where id = $1`,
    [ dateId ]
  );

  return rowCount === 1;
}
