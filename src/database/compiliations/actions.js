"use strict";

export {
  create,
  edit,
  del
};

async function create( client, compiliationId, actionId, locale, description ){
  try{
    await client.query(
      `insert into compiliations_actions( compiliation_id, action_id, locale, description )
      values( $1, $2, $3, $4 )
      on conflict ( compiliation_id, action_id, locale ) do update
      set description = excluded.description`,
      [ compiliationId, actionId, locale, description ]
    );

    return true;
  } catch( e ) {
    if( e.code === "23503" )
      return `Invalid keys (compiliationId (${compiliationId}) or actionId (${actionId}))`;

    throw e;
  }
}

async function edit( client, compiliationId, actionId, locale, description ){
  const { rowCount } = await client.query(
    `update compiliations_actions
    set description = $1
    where
      compiliation_id = $2 and
      action_id = $3 and
      locale = $4`,
    [ description, compiliationId, actionId, locale ]
  );

  if( rowCount !== 1 )
    return `Invalid compiliation ID (${compiliationId}) or action ID (${actionId})`;

  return true;
}

async function del( client, compiliationId, actionId ){
  const { rowCount } = await client.query(
    `delete from compiliations_actions
    where
      compiliation_id = $1 and
      action_id = $2`,
    [ compiliationId, actionId ]
  );

  return rowCount > 0;
}
