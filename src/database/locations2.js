"use strict";

export {
  create,
  getAll,
  edit,
  del
};

async function create( client, locale, name, slug, id, isChild ){
  let n0, n1, n2;
  let insertParams;

  if( id === null ){
    const { rows: [ { q } ] } = await client.query(
      `select coalesce( max( n0 ), 0 ) + 1 as q
      from locations2
      where locale = $1`,
      [ locale ]
    );

    insertParams = [ q, 0, 0, locale, name, slug ];
  } else {
    const { rows: [ row ] } = await client.query(
      `select n0 as n0_, n1 as n1_, n2 as n2_
      from locations2
      where
        id = $1 and
        locale = $2`,
      [ id, locale ]
    );

    if( row === undefined )
      return `Invalid pair of ID (${id}) and locale (${locale})`;

    const { n0_, n1_, n2_ } = row;
    let where = "";
    let searchParams = [];
    let index;

    if( n2_ !== 0 || n1_ !== 0 && isChild ){
      where = "where locale = $1 and n0 = $2 and n1 = $3";
      searchParams = [ locale, n0_, n1_ ];
      insertParams = [ n0_, n1_ ];
      index = 2;
    }
    else if( n1_ !== 0 || n0_ !== 0 && isChild ){
      where = "where locale = $1 and n0 = $2";
      searchParams = [ locale, n0_ ];
      insertParams = [ n0_, 0, 0 ];
      index = 1;
    } else {
      insertParams = [ 0, 0, 0 ];
      index = 0;
    }

    const { rows: [ { q } ] } = await client.query(
      `select max( n${index} ) + 1 as q
      from locations2
      ${where}`,
      searchParams
    );

    insertParams[ index ] = q;
    insertParams = [ ...insertParams, locale, name, slug ];
  }

  const { rows: [ row ] } = await client.query(
    `insert into locations2( n0, n1, n2, locale, name, slug )
    values( $1, $2, $3, $4, $5, $6 )
    returning id, n0, n1, n2`,
    insertParams
  );

  return row;
}

async function getAll( client, locale, ln, bln ){
  let fields = "";
  let from = "";
  let where = "";
  let params;

  if( locale ){
    where = "where l2.locale = $1";
    params = [ locale ];
  }

  if( ln ){
    fields += ", l.id as location_id, l.name as location_name";
    from += " left join locations as l on l2.id = l.location2_id and l2.locale = l.locale";
  }

  if( bln ){
    fields += ", bl.id as booking_location_id, bl.name as booking_location_name";
    from += " left join booking_locations as bl on l2.id = bl.location2_id";
  }

  const { rows } = await client.query(
    `select l2.*${fields}
    from locations2 as l2${from}
    ${where}
    order by l2.n0, l2.n1, l2.n2`,
    params
  );

  return rows;
}

async function edit( client, id, { name, slug } ){
  let set;
  let conditions = "";
  let params = [];

  if( name !== null && typeof name === "object" && !Array.isArray( name ) ){
    set = "name = $1";
    conditions = "id = $2 and locale = $3";
    params = [ name.text, id, name.locale ];
  }
  else if( slug ){
    set = "slug = $1";
    conditions = "id = $2";
    params = [ slug, id ];
  }

  const { rowCount } = await client.query(
    `update locations2
    set ${set}
    where ${conditions}`,
    params
  );

  if( rowCount === 0 ){
    if( locale ) return `Invalid pair ID (${id}) and locale (${locale})`;
    else return `Invalid ID (${id})`;
  }

  return true;
}

async function del( client, id ){
  const { rows: [ row ] } = await client.query(
    `select n0, n1, n2
    from locations2
    where id = $1`,
    [ id ]
  );

  if( row === undefined )
    return `Invalid ID (${id})`;

  const { n0, n1, n2 } = row;

  let whereDelete;
  let whereUpdate;
  let index;
  let params;

  if( n2 !== 0 ){
    whereDelete = "n0 = $1 and n1 = $2 and n2 = $3";
    whereUpdate = "n0 = $1 and n1 = $2 and n2 > $3";
    index = 2;
    params = [ n0, n1, n2 ];
  }
  else if( n1 !== 0 ){
    whereDelete = "n0 = $1 and n1 = $2";
    whereUpdate = "n0 = $1 and n1 > $2";
    index = 1;
    params = [ n0, n1 ];
  } else {
    whereDelete = "n0 = $1";
    whereUpdate = "n0 > $1";
    index = 0;
    params = [ n0 ];
  }

  await client.query(
    `delete from locations2
    where ${whereDelete}`,
    params
  );

  await client.query(
    `update locations2
    set n${index} = n${index} - 1
    where ${whereUpdate}`,
    params
  );

  return true;
}
