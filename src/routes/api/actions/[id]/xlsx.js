"use strict";

import xlsx from "xlsx";
import { toInt } from "/helpers/converters";
import { createMap, mergeMultiple } from "/helpers/merger";
import { writeFile, access, mkdir } from "/helpers/promisified";

export async function get( {
  session: { isLogged, role, userId, locale },
  params,
  query,
  database: { pool },
  _
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const id = toInt( params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const userId_ = toInt( query.userId );

  if( role !== "admin" && userId !== userId_ )
    return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: [ { is_organizer: isOrganizer } ] } = await transaction.query(
    `select
      ( not array_position( organizer_ids, $1 ) is null ) as is_organizer
    from actions
    where id = $2`,
    [ userId_, id ]
  );

  if( !isOrganizer )
    return res.error( 12 );

  const { rows: reservations } = await transaction.query(
    `select
    	id, name, surname,
    	phone, email, date,
    	paid
    from action_reservations
    where action_id = $1`,
    [ id ]
  );

  const map = createMap( reservations, "id" );
  const reservationIds = Object.keys( map );

  const { rows: buyable } = await transaction.query(
    `select
      arb.action_reservation_id,
      arb.count, ab.price, ab.type,
      abt.name
    from
      action_reservations_buyable as arb,
      action_buyable as ab,
      action_buyable_translates as abt
    where
      abt.locale = $1 and
      arb.action_reservation_id = any( $2 ) and
      arb.action_buyable_id = ab.id and
      ab.id = abt.action_buyable_id`,
    [ locale, reservationIds ]
  );

  mergeMultiple( reservations, buyable, "action_reservation_id", "buyable", { map, remove: true } );

  await transaction.query( "commit" );
  transaction.release();

  const wb = xlsx.utils.book_new();
  // #fix localize
  const wsData = [ [
    "№",
    "Дата",
    "Имя Фамилия",
    "Телефон",
    "email",
    "Билеты Зарезервировано",
    "Билеты Оплачено",
    "Дополнительно Зарезервировано",
    "Дополнительно Оплачено",
    "Сумма"
  ] ];

  reservations.forEach( ( { name, surname, phone, email, date, paid, buyable }, i ) => {
    let sum = 0;
    const wsRow = [ i + 1, date, `${name} ${surname}`, phone, email ];
    const tickets = { paid: [], nonPaid: [] };
    const additionals = { paid: [], nonPaid: [] };

    if( Array.isArray( buyable ) ) buyable.forEach( ( { count, price, type, name } ) => {
      const st = `${name} - ${count}шт`;

      if( type === "ticket" ){
        if( paid === true ){
          sum += price * count;
          tickets.paid.push( st );
        }
        else tickets.nonPaid.push( st );
      } else {
        if( paid === true ){
          sum += price * count;
          additionals.paid.push( st );
        }
        else additionals.nonPaid.push( st );
      }
    } );

    if( tickets.nonPaid.length > 0 ) wsRow.push( tickets.nonPaid.join( "\n" ) );
    else wsRow.push( "-" );

    if( tickets.paid.length > 0 ) wsRow.push( tickets.paid.join( "\n" ) );
    else wsRow.push( "-" );

    if( additionals.nonPaid.length > 0 ) wsRow.push( additionals.nonPaid.join( "\n" ) );
    else wsRow.push( "-" );

    if( additionals.paid.length > 0 ) wsRow.push( additionals.paid.join( "\n" ) );
    else wsRow.push( "-" );

    wsRow.push( sum );
    wsData.push( wsRow );
  } );

  const ws = xlsx.utils.aoa_to_sheet( wsData );

  wb.SheetNames = [ "Лист 1" ];
  wb.Sheets[ "Лист 1" ] = ws;

  const output = xlsx.write( wb, {
    bookType: "xlsx",
    type: "buffer"
  } );

  let [ date, time ] = ( new Date() ).toISOString().split( "T" );

  time = time.split( ":" )[0];
  date = `${date}T${time} 00 00.000Z`;

  if( !( await access( "reports" ) ) )
    await mkdir( "reports" );

  const name = `action${id}_${date}.xlsx`;

  await writeFile( `reports/${name}`, output );

  res.download( `reports/${name}`, name );
}
