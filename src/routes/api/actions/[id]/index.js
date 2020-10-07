"use strict";

import { toInt } from "/helpers/converters";
import { get as getCron } from "/cron/index";

// Errors: 9, 10
export async function get( req, res ){
  const slug = req.params.id;

  if( typeof slug !== "string" || slug === "" )
    return res.error( 9 );

  const role = req.session.role;
  let locale = req.session.locale;
  let allStatuses = false;

  if( role === "admin" ){
    if( req.query.locale ) locale = req.query.locale;

    allStatuses = true;
  }

  res.json( await req.database.actions.getOneBySlug( allStatuses, slug, locale ) );
}

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const transaction = await req.database.actions.edit( id, req.body );
  const cron = getCron();

  if( req.body.dates ){
    let { rows: actionDates } = await transaction.query(
      `select *
      from action_dates
      where action_id = $1`,
      [ id ]
    );

    const { rows: [ task ] } = await transaction.query(
      `select t.id, t.timestamp
      from
        actions as a,
        tasks as t
      where
        a.id = $1 and
        a.task_id = t.id`,
      [ id ]
    );

    if( actionDates.length === 0 || actionDates.some( ( { date_end } ) => date_end === null ) ){
      if( task !== undefined ){
        await cron.delete( task.id, transaction );
      }

      await transaction.end();

      return res.success();
    }

    const maxTimestamp = actionDates.reduce( ( res, { date_end, time_end, days } ) => {
      let dt = new Date( date_end );

      if( time_end ){
        const [ hours, minutes, seconds ] = time_end.split( ":" );

        dt.setHours( hours );
        dt.setMinutes( minutes );
        dt.setSeconds( seconds );
      }

      if( days ){
        let day = dt.getDay();

        day = day === 0 ? 6 : day--;

        const distance = Math.min( ...days.map( day_ => day - day_ ).filter( day_ => day_ >= 0 ) );

        dt = dt.getTime() - distance * 24 * 60 * 60 * 1000;
      }
      else dt = dt.getTime();

      dt = Math.floor( dt / 1000 );

      if( res < dt )
        return dt;

      return res;
    }, -1 );

    if( task !== undefined ){
      task.timestamp = parseInt( task.timestamp );

      if( task.timestamp !== maxTimestamp ){
        await transaction.query(
          `update tasks
          set timestamp = $1
          where id = $2`,
          [ maxTimestamp, task.id ]
        );

        cron.updateTimestamp( maxTimestamp );
      }
    } else {
      const taskId = await cron.add( "archivateAction", {
        timestamp: maxTimestamp,
        settings: {
          success: { limit: {
            value: 1,
            action: "delete"
          } },
          // #fix вынести
          error: { timeModifierSettings: [ "basic", 60 ] },
          onExpires: "run"
        },
        params: { actionId: id }
      }, transaction );

      await transaction.query(
        `update actions
        set task_id = $1
        where id = $2`,
        [ taskId, id ]
      );
    }
  }

  const { rows: [ { status, organizer_ids, task2_id } ] } = await transaction.query(
    `select status, organizer_ids, task2_id
    from actions
    where id = $1`,
    [ id ]
  );

  if( task2_id === null && status === "active" && organizer_ids !== null ){
    // #fix вынести
    const weekPeriod = 7 * 24 * 60 * 60;

    const taskId = await cron.add( "notificationAboutReservations", {
      timestamp: Math.floor( Date.now() / 1000 ) + weekPeriod,
      settings: {
        success: { timeModifierSettings: [ "basic", weekPeriod ] },
        // #fix вынести
        error: { timeModifierSettings: [ "basic", 60 * 60 ] },
        onExpires: "run"
      },
      params: { actionId: id }
    }, transaction );

    await transaction.query(
      `update actions
      set task2_id = $1
      where id = $2`,
      [ taskId, id ]
    );
  }
  else if( ( status !== "active" || organizer_ids === null ) && task2_id !== null ){
    await cron.delete( task2_id, transaction );
  }

  await transaction.end();

  res.success();
}
