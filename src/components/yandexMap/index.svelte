<style>
  .container{
    width: 100%;
    height: 100%;
  }
</style>

<script>
  import { onMount, createEventDispatcher } from "svelte";
  import ymaps from "./loader";

  export let apiKey = null;
  export let center = null;
  export let zoom = 10;
  export let editable = false;
  export let staticPlacemarks = null;
  export let editablePlacemark = null;
  export let customIcon;
  export let lang = "ru_RU";
  export let searchText = "Поиск...";

  const dispatch = new createEventDispatcher();

  let container;
  let maps;
  let map;
  let loaded = false;
  let placemark = null;

  if( apiKey === null )
    throw "[MAP] Invalid props \"apiKey\"";

  if( center === null )
    throw "[MAP] Invalid props \"center\"";

  if( customIcon === null || typeof customIcon !== "object" || Array.isArray( customIcon ) )
    customIcon = null;

  $: if( loaded && staticPlacemarks !== null ){
    createActionCoords();

    const bounds = map.geoObjects.getBounds();

    if( bounds !== null ){
      map.setBounds( bounds );

      if( map.getZoom() > 17 )
        map.setZoom( 17 );
    }
  }

  $: loaded, editablePlacemark, editablePlacemarkChanged();

  function createActionCoords(){
    const geoObjects = [];

    if( customIcon !== null )
      customIcon = { iconLayout: "default#image", ...customIcon };

    map.geoObjects.each( geoObject => geoObject !== placemark ? map.geoObjects.remove( geoObject ) : null );
    staticPlacemarks.forEach( ( { coords, meta } ) => {
      const geoObject = new maps.GeoObject( {
        geometry: {
          type: "Point",
          coordinates: coords
        }
      }, customIcon );

      geoObject.events.add( "click", () => dispatch( "placemarkMeta", { meta } ) );
      geoObjects.push( geoObject );
    } );

    const clusterer = new maps.Clusterer();

    clusterer.add( geoObjects );
    map.geoObjects.add( clusterer );
  }

  function editablePlacemarkChanged(){
    if( !loaded ) return;

    if( editablePlacemark === null ){
      if( placemark !== null )
        map.geoObjects.remove( placemark );
    } else {
      createPoint( editablePlacemark, false );
      map.setCenter( editablePlacemark );
      map.setZoom( 17 );
    }
  }

  async function createPoint( coords, isDispatch ){
    if( placemark !== null )
      map.geoObjects.remove( placemark );

    placemark = new maps.Placemark( coords, {
      iconCaption: searchText
    } );

    map.geoObjects.add( placemark );

    const geoObject = ( await maps.geocode( coords ) ).geoObjects.get( 0 );
    const address = geoObject.getAddressLine();
    const street = geoObject.getThoroughfare() || geoObject.getPremise();
    const house = geoObject.getPremiseNumber();
    let iconCaption;

    if( typeof street === "string" && street !== "" ){
      iconCaption = street;

      if( typeof house === "string" && house !== "" )
        iconCaption += `, ${house}`;
    }
    else iconCaption = address;

    placemark.properties.set( "iconCaption", iconCaption );

    if( isDispatch !== false )
      dispatch( "newPlacemark", { coords, address } );
  }

  async function initMap(){
    maps = await ymaps.load( `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&load=Map,GeoObject,Clusterer,Placemark,geocode&lang=${lang}` );
    map = new maps.Map( container, { center, zoom } );
    map.cursors.push( "arrow" );
    loaded = true;

    if( editable )
      map.events.add( "click", e => createPoint( e.get( "coords" ) ) );

    dispatch( "load" );
  }

  onMount( initMap );
</script>

<div bind:this = {container} class = "container"></div>
