"use strict";

export {
  create,
  getMany,
  getByUserId,
  edit
};

async function create(
  c,
  userId_,
  recipient,
  bank,
  accountNumber,
  bik,
  inn,
  kpp,
  usedActions
){
  const { rows: [ { id } ] } = await c.query(
    `insert into withdraws( user_id, recipient, bank, account_number, bik, inn, kpp, created_at )
    values( $1, $2, $3, $4, $5, $6, $7, $8 )
    returning id`,
    [ userId_, recipient, bank, accountNumber, bik, inn, kpp, Date.now() ]
  );

  const values = [];
  const params = [ id ];
  let i = 2;

  for( let [ actionId, balance ] of usedActions ){
    values.push( `($1,$${i++},$${i++})` );
    params.push( actionId );
    params.push( balance );
  }

  await c.query(
    `insert into withdraw_actions( withdraw_id, action_id, amount )
    values ${values}`,
    params
  );

  return id;
}

async function getMany( c ){
  const { rows: withdraws } = await c.query(
    `select
    	w.id, w.user_id, w.recipient, w.bank,
      w.account_number, w.bik, w.inn, w.kpp,
      w.status, w.fail_message, sum( wa.amount )::int
    from
    	withdraws as w,
      withdraw_actions as wa
    where w.id = wa.withdraw_id
    group by w.id
    order by w.created_at desc`
  );

  return withdraws;
}

async function getByUserId( c, userId ){
  const { rows: withdraws } = await c.query(
    `select w.id, sum( wa.amount )::int, w.status, w.fail_message
    from
    	withdraws as w,
      withdraw_actions as wa
    where
    	user_id = $1 and
      w.id = wa.withdraw_id
    group by w.id, w.status, w.fail_message, w.created_at
    order by w.created_at desc`,
    [ userId ]
  );

  return withdraws;
}

async function edit( c, id, status, failMessage ){
  const sets = [ `status = $2` ];
  const params = [ id, status ];

  if( failMessage !== undefined ){
    sets.push( `fail_message = $3` );
    params.push( failMessage );
  }

  const { rowCount } = await c.query(
    `update withdraws
    set ${sets}
    where id = $1`,
    params
  );

  return rowCount === 1;
}
