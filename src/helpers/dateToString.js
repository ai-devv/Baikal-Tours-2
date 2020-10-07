"use strict";

export default index;

function parseDate( dateString, _ ){
  const date = new Date( dateString );

  const day = date.getDate();
  let month = date.getMonth();
  const year = date.getFullYear();

  switch( month ){
    case 0: month = _( "january.PC" ); break;
    case 1: month = _( "february.PC" ); break;
    case 2: month = _( "march.PC" ); break;
    case 3: month = _( "april.PC" ); break;
    case 4: month = _( "may.PC" ); break;
    case 5: month = _( "june.PC" ); break;
    case 6: month = _( "july.PC" ); break;
    case 7: month = _( "august.PC" ); break;
    case 8: month = _( "september.PC" ); break;
    case 9: month = _( "october.PC" ); break;
    case 10: month = _( "november.PC" ); break;
    case 11: month = _( "december.PC" );
  }

  return [ day, month, year ];
}

function parseTime( time ){
  return time.split( ":" ).slice( 0, 2 ).map( el => el.length === 1 ? `0${el}` : el ).join( ":" );
}

function parseDays( days, _ ){
  const sum = days.reduce( ( res, day ) => res + day );

  if( sum === 21 ) return _( "every_day" );

  let st = "";

  for( let [ i, day ] of Object.entries( days ) ){
    switch( day ){
      case 0: st += _( "monday.short" ); break;
      case 1: st += _( "tuesday.short" ); break;
      case 2: st += _( "wednesday.short" ); break;
      case 3: st += _( "thursday.short" ); break;
      case 4: st += _( "friday.short" ); break;
      case 5: st += _( "saturday.short" ); break;
      case 6: st += _( "sunday.short" );
    }

    if( i < days.length - 2 ) st += ", ";
    else if( i < days.length - 1 ) st += ` ${_( "and" )} `;
  }

  return st;
}

function datesEquals( date0, date1 ){
  if(
    date0[0] === date1[0] &&
    date0[1] === date1[1] &&
    date0[2] === date1[2]
  ) return true;

  return false;
}

function dateToString( date, _ ){
  let st = undefined;

  if( Array.isArray( date ) ){
    st = date[0];

    if( date[1] ) st += ` ${date[1]}`;
    if( date[2] ) st += ` ${date[2]}${_( "date_to_string.year" )}`;
  }

  return st;
}

function space( result, st ){
  if( st === undefined ) st = "";

  if( result.length > 0 )
    return ` ${st}`;

  return st.length > 0 ? `${st[0].toUpperCase()}${st.slice( 1, st.length )}` : "";
}

function index( { time_start, date_start, date_end, days }, _ ){
  if( _ === undefined ) return null;

  let result = "";
  let dateStarts = _( "date_to_string.start" );
  const timeStarts = _( "date_to_string.in" );

  if( date_start ) date_start = parseDate( date_start, _ );
  if( time_start ) time_start = parseTime( time_start );
  if( date_end ) date_end = parseDate( date_end, _ );
  if( days ) days = parseDays( days, _ );

  if( date_start && date_end ){
    if( datesEquals( date_start, date_end ) ){
      date_end = undefined;
      dateStarts = "";
    }
    else if( date_start[2] === date_end[2] ){
      date_start.pop();

      if( date_start[1] === date_end[1] ) date_start.pop();
    }
  }

  date_start = dateToString( date_start, _ );
  date_end = dateToString( date_end, _ );

  if( date_start ) result = `${space( result, dateStarts )} ${date_start}`;
  if( date_end ) result += `${space( result, _( "date_to_string.by" ) )} ${date_end}`;
  if( time_start ) result += `${space( result, timeStarts )} ${time_start}`;
  if( days ) result += `${space( result, _( "date_to_string.by" ) )} ${days}`;

  return result;
}
