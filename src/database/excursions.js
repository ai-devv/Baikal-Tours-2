"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Excursions" );
  }

  async create( site, dateStart, dateEnd, locationIds, price ){
    const transaction = await super.transaction();

    const id = ( await transaction.query(
      `insert into excursions( site, date_start, date_end, location_ids, price )
      values( $1, $2, $3, $4, $5 )
      returning id`,
      [ site, dateStart, dateEnd, locationIds, price ]
    ) ).rows[0].id;

    return { transaction, id };
  }

  async getAll( locale ){
    const rows = ( await super.query(
      `select e.id, e.site, e.image_url, e.price, et.name
      from
        excursions as e,
        excursions_translates as et
      where
        et.locale = $1 and
        e.id = et.excursion_id
      order by date_start`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async getById( client, locale, id ){
    const { rows } = await client.query(
      `select
      	e.image_url, e.site,
        e.date_start, e.date_end,
        e.location_ids,
        e.price,
        et.name
      from
      	excursions as e,
        excursions_translates as et
      where
        et.locale = $1 and
      	e.id = $2 and
        e.id = et.excursion_id`,
      [ locale, id ]
    );

    return rows;
  }

  async filter( locale, dateStart, dateEnd, locationIds ){
    let filters = [];
    const params = [ locale ];
    let i = 2;

    if( typeof dateStart === "string" && dateStart !== "" ){
      filters.push( `e.date_start >= $${i++}` );
      params.push( dateStart );
    }

    if( typeof dateEnd === "string" && dateEnd !== "" ){
      filters.push( `e.date_end <= $${i++}` );
      params.push( dateEnd );
    }

    if( Array.isArray( locationIds ) ){
      filters.push( `$${i++}::int[] && e.location_ids` );
      params.push( locationIds );
    }

    if( filters.length > 0 )
      filters = `${filters.join( " and " )} and`;
    else
      filters = "";

    const rows = ( await super.query(
      `select e.id, e.site, e.image_url, e.price, et.name
      from
        excursions as e,
        excursions_translates as et
      where
        et.locale = $1 and
        ${filters}
        e.id = et.excursion_id
      order by date_start`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async edit( client, id, site, dateStart, dateEnd, locationIds, price ){
    let sets = [];
    const params = [ id ];
    let i = 2;

    if( site !== null ){
      sets.push( `site = $${i++}` );
      params.push( site );
    }

    if( dateStart !== null ){
      sets.push( `date_start = $${i++}` );
      params.push( dateStart );
    }

    if( dateEnd !== null ){
      sets.push( `date_end = $${i++}` );
      params.push( dateEnd );
    }

    if( locationIds !== null ){
      sets.push( `location_ids = $${i++}` );
      params.push( locationIds );
    }

    if( price !== null ){
      sets.push( `price = $${i++}` );
      params.push( price );
    }

    if( sets.length > 0 ){
      sets = sets.join( "," );

      const { rowCount } = await client.query(
        `update excursions
        set ${sets}
        where id = $1
        returning 1`,
        params
      );

      if( rowCount === 0 )
        return { errors: [ `Invalid excursion (${id})` ] };
    }

    return true;
  }

  async delete( client, id ){
    const { rows: [ row ] } = await client.query(
      `delete from excursions
      where id = $1
      returning image_url`,
      [ id ]
    );

    if( row === undefined )
      return { errors: [ `Invalid excursion (${id})` ] };

    return row.image_url;
  }
}
