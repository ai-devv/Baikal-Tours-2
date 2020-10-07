"use strict";

export default ( { date_start, date_end, time_start, time_end, days }, userDate ) => {
  const addTimeToDate = ( date, time ) => {
    time = time.split( ":" );

    date.setHours( date.getHours() + parseInt( time[0] ) );
    date.setMinutes( date.getMinutes() + parseInt( time[1] ) );
    date.setSeconds( date.getSeconds() + parseInt( time[2] ) );

    return date;
  };

  if( userDate < ( new Date() ) )
    return false;

  if( date_start !== null ){
    date_start = new Date( date_start );

    if( time_start !== null )
      date_start = addTimeToDate( date_start, time_start );

    if( userDate < date_start )
      return false;
  }

  if( date_end !== null ){
    date_end = new Date( date_end );

    if( time_end !== null )
      date_end = addTimeToDate( date_end, time_end );

    if( userDate > date_end )
      return false;
  }

  if( days !== null ){
    let day = userDate.getDay();

    if( day === 0 ) day = 6;
    else day--;

    if( !days.includes( day ) )
      return false;
  }

  return true;
}
