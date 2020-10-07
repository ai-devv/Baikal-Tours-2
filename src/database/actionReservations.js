"use strict";

export {
  create,
  getByUserId,
  checkOrderNumber
};

async function create( client, userId, actionId, name, surname, phone, email, date, buyable ){
  const { rows: [ { id } ] } = await client.query(
    `insert into action_reservations( user_id, action_id, name, surname, phone, email, date )
    values( $1, $2, $3, $4, $5, $6, $7 )
    returning id`,
    [ userId, actionId, name, surname, phone, email, date ]
  );

  if( buyable !== null ){
    const params = [ id ];
    let i = 2;

    buyable = buyable.filter( el => Number.isInteger( el.count ) && el.count > 0 );
    buyable = buyable.map( ( { actionBuyableId, count } ) => {
      params.push( actionBuyableId );
      params.push( count );

      return `($1,$${i++},$${i++})`;
    } ).join( "," );

    if( params.length > 1 ) await client.query(
      `insert into action_reservations_buyable( action_reservation_id, action_buyable_id, count )
      values ${buyable}`,
      params
    );
  }

  return id;
}

async function getByUserId( client, locale, userId ){
  const { rows } = await client.query(
    `select
      ar.id as action_reservation_id, ar.paid, ar.date,
      a.slug, at.action_id, at.name, at.alt
    from
      action_reservations as ar,
      actions as a,
      actions_translates as at
    where
      at.locale = $1 and
      ar.user_id = $2 and
      ar.action_id = a.id and
      ar.action_id = at.action_id
    order by ar.date`,
    [ locale, userId ]
  );

  return rows;
}

async function checkOrderNumber( c, orderNumber ){
  const { rowCount } = await c.query(
    `select 1
    from action_reservations
    where order_number = $1`,
    [ orderNumber ]
  );

  return rowCount === 1;
}
