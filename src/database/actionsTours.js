"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Tours" );
  }

  async create( actionId, tourId, before ){
    const transaction = await super.transaction();
    const params = [ actionId, tourId ];

    if( typeof before === "number" && before > 0 ){
      const before_ = ( await transaction.query(
        `select 1
        from actions_tours
        where
          action_id = $1 and
          number = $2`,
        [ actionId, before ]
      ) ).rows[0];

      if( before_ === undefined )
        return super.error();

      params.push( before );

      await transaction.query(
        `update actions_tours
        set number = number + 1
        where
          action_id = $1 and
          number >= $2`,
        [ actionId, before ]
      );
    }

    let sql =
      `insert into actions_tours( action_id, tour_id, number )
      values ( $1, $2, {number} )`;

    if( typeof before === "number" && before > 0 )
      sql = sql.replace( "{number}", "$3" );
    else
      sql = sql.replace( "{number}",
        `( select
          case
            when max( number ) is null then 1
            else max( number + 1 )
          end
        from actions_tours
        where action_id = $1 )`
      );

    await transaction.query( sql, params );
    await transaction.end();

    return super.success();
  }

  async edit( actionId, tourId, number, action ){
    const transaction = await super.transaction();

    const tuple = ( await transaction.query(
      `select number
      from actions_tours
      where
        action_id = $1 and
        tour_id = $2`,
      [ actionId, tourId ]
    ) ).rows[0];

    if( tuple === undefined ){
      await transaction.end();

      return super.error();
    }

    const check = ( await transaction.query(
      `select 1
      from actions_tours
      where
        action_id = $1 and
        number = $2 and
        number != $3`,
      [ actionId, number, tuple.number ]
    ) );

    if( check.rowCount === 0 ){
      await transaction.end();

      return super.error();
    }

    if( action === "swipe" ){
      await transaction.query(
        `update actions_tours
        set number = $1
        where
          action_id = $2 and
          number = $3`,
        [ tuple.number, actionId, number ]
      );

      await transaction.query(
        `update actions_tours
        set number = $1
        where
          action_id = $2 and
          tour_id = $3`,
        [ number, actionId, tourId ]
      );
    } else {
      let sign;
      let newNumber;
      const params = [ actionId ];

      if( tuple.number > number ){
        sign = "+";

        if( action === "before" )
          newNumber = number;
        else
          newNumber = number + 1;

        params.push( newNumber );
        params.push( tuple.number );
      }  else {
        sign = "-";
        params.push( tuple.number + 1 );

        if( action === "before" )
          newNumber = number - 1;
        else
          newNumber = number;

        params.push( newNumber );
      }

      await transaction.query(
        `update actions_tours
        set number = number ${sign} 1
        where
          action_id = $1 and
          number between $2 and $3`,
        params
      );

      await transaction.query(
        `update actions_tours
        set number = $1
        where
          action_id = $2 and
          tour_id = $3`,
        [ newNumber, actionId, tourId ]
      );
    }

    await transaction.end();

    return super.success();
  }

  async delete( actionId, tourId ){
    const transaction = super.transaction();

    const row = ( await transaction.query(
      `delete from actions_tours
      where
        action_id = $1 and
        tour_id = $2
      returning number`,
      [ actionId, tourId ]
    ) ).rows[0];

    if( row === undefined ){
      await transaction.end();

      return super.success();
    }

    await transaction.query(
      `update actions_tours
      set number = number - 1
      where
        action_id = $1 and
        number > $2`,
      [ actionId, row.number ]
    );

    await transaction.end();

    return super.success();
  }
}
