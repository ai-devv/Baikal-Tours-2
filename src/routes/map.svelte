<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let params = page.query;
    let locale = session.locale;
    let actions;

    if (params.filter === "") {
      actions = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query: params
      });
    } else
      actions = await fetcher.get("api/actions", {
        credentials: "same-origin"
      });

    return { locale, actions };
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import YandexMap from "/components/yandexMap/index.svelte";
  import i18n from "/helpers/i18n/index.js";
  import Image from "/components/imageCenter.svelte";
  import { slide } from "svelte/transition";
  import Card from "/components/cardOfEventForMap.svelte";
  import ClickOutside from "/components/clickOutside.svelte";

  export let locale, actions;

  const _ = i18n(locale);
  const customIcon = {
    iconImageHref: "/img/placeholder-map.svg",
    iconImageSize: [30, 42],
    iconImageOffset: [-14, -36]
  };
  const apiKey = "c7b75af8-80f3-4ff2-afb6-a05da8ecdeec";

  let eventsWithCoords = [];
  let visibleEvent = null;
  let searchText = "";
  let notFoundText = "";
  let findLocations = [];
  let allLocations = [];
  let searchBlock;
  let showFindLocations = false;
  let allEvents;
  let showMobileEvents = false;
  let showOneMobileEvent = false;

  function makePlaceholders() {
    for (let event of actions.actions)
      if (event.locations)
        for (let location of event.locations)
          if (location.coords) {
            eventsWithCoords.push({
              coords: location.coords,
              meta: {
                name: event.name,
                image_url: event.image_url,
                location: location.address
                  ? `${location.name}, ${location.address}`
                  : location.name,
                id: event.id,
                date_starts: event.date_starts,
                date_ends: event.date_ends
              }
            });
            allLocations.push(
              location.address
                ? `${location.name}, ${location.address}`
                : location.name
            );
          }
    allEvents = Object.assign([], eventsWithCoords);
    eventsWithCoords = eventsWithCoords;
  }

  function showEvent(e) {
    visibleEvent = e.detail.meta;

    showOneMobileEvent = true;
  }

  function searchLocations() {
    findLocations = [];
    for (let location of allLocations) {
      if (location.toLowerCase().includes(searchText.toLowerCase())) {
        let leftText = location.substring(
          0,
          location.toLowerCase().indexOf(searchText.toLowerCase())
        );
        let rightText = location.substring(
          leftText.length + searchText.length,
          location.length
        );
        let allText = `${leftText}<b>${location.substring(
          leftText.length - 1,
          leftText.length + searchText.length
        )}</b>${rightText}`;

        findLocations.push({
          formatedText: allText,
          location: location
        });
        if (findLocations.length > 2) break;
      }
    }
    findLocations = findLocations;
  }

  function showFindEvents() {
    eventsWithCoords = [];

    for (let event of allEvents) {
      if (event.meta.location.toLowerCase().includes(searchText.toLowerCase()))
        eventsWithCoords.push(event);
    }

    if (!eventsWithCoords.length) notFoundText = searchText;
    else showMobileEvents = true;

    showOneMobileEvent = false;
    visibleEvent = null;

    eventsWithCoords = eventsWithCoords;
    showFindLocations = false;
  }

  makePlaceholders();
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .map-block {
    width: 100%;
    height: 100vh;
    background: $Light_Gray;
    position: relative;
  }

  .search-block {
    padding: 25px;
    background: white;
    position: absolute;
    top: 160px;
    left: calc(50% - 600px);
    box-sizing: border-box;
    height: 100px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    z-index: 3;
    width: 400px;
    border-radius: 10px 10px 0 0;
  }

  .cards-block {
    height: calc(100% - 100px);
    overflow: auto;
    padding: 0 25px;
    position: absolute;
    left: calc(50% - 600px);
    z-index: 1;
    background: white;
    top: 260px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    width: 400px;
    border-radius: 0 0 10px 10px;
    height: calc(100vh - 300px);
    box-sizing: border-box;

    & > :global(div:not(:first-child)) {
      margin-top: 30px;
    }
  }

  .finded-location {
    padding: 0 25px;

    &:not(:first-child) {
      margin-top: 15px;
    }

    & > button {
      font-size: $LowBig_Font_Size;
      text-align: left;
    }
  }

  .finded-list {
    padding-bottom: 15px;
  }

  .see-all {
    font-size: $LowBig_Font_Size;
    text-decoration: underline;
    color: #4d5062;
    margin-top: 15px;
    display: block;
    text-align: center;
    width: 100%;
  }

  .not-found {
    position: absolute;
    top: calc(100% + 20px);
    color: #c1c1c1;
    font-size: $LowBig_Font_Size;
    display: block;
    width: calc(100% - 50px);
  }

  .full-search-block {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > .full-input-block {
      width: 100%;
      position: relative;
    }

    & > .show-map {
      display: none;
      width: 25px;

      & > img {
        width: 100%;
      }
    }
  }

  .input-block {
    width: 100%;
    position: relative;
    z-index: 4;

    & > input {
      padding-left: 25px;
      width: calc(100% - 80px);
      font-size: $LowBig_Font_Size;
      height: 50px;
    }

    & > button {
      position: absolute;
      top: 50%;
      right: 25px;
      width: 25px;
      transform: translateY(-50%);
      z-index: 5;
    }
  }

  .finded-locations {
    position: absolute;
    width: 100%;
    padding-top: 50px;
    background: #f5f5f5;
    border-radius: 25px;
    z-index: 3;
    top: 0;
  }

  .close-one-event{
    display: none;
  }

  :global(header){
    position: absolute !important;
  }

  @media only screen and (max-width: 768px) {
    :global(header) {
      width: 100% !important;
      top: 0 !important;
      left: 0 !important;
      transform: translateX(0) !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    .search-block {
      top: 74px;
      left: 0;
      border-radius: 0;
      width: 100%;
      box-shadow: none;
      padding: 8px 10px;
      height: auto;
      transition: 0.3s;
    }

    .input-block {
      & > input {
        height: 40px;
        font-size: $Medium_Font_Size;
        transition: 0.3s;
      }

      & > button {
        right: 15px;

        & > img {
          width: 15px;
        }
      }
    }

    .finded-locations {
      padding-top: 40px;
    }

    .finded-location {
      padding: 0 25px;

      &:not(:first-child) {
        margin-top: 10px;
      }

      & > button {
        font-size: $Medium_Font_Size;
        text-align: left;
      }
    }

    .show-map {
      display: block !important;
      width: 0 !important;
      overflow: hidden !important;
    }

    .not-found {
      position: static;
      color: #ed2d33;
      margin-top: 8px;
      font-size: $Mini_Font_Size;
      width: 100%;
      margin-left: 25px;
    }

    .cards-block {
      border-radius: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      top: auto;
      height: 0;
      overflow: hidden;
      transition: 0.3s;
      padding: 0 10px;
    }

    .search-block.showMobileEvents {
      top: 0;
      z-index: 5;

      & .full-input-block {
        width: calc(100% - 40px);
      }

      & .show-map {
        width: 25px !important;
      }
    }

    .cards-block.showOneMobileEvent {
      display: block;
      height: auto;
    }

    .cards-block.showMobileEvents {
      display: block;
      height: calc(100vh - 56px);
      z-index: 4;
      overflow: auto;
    }

    .one-event{
      padding: 8px 0;
      position: relative;
    }

    .see-all{
      font-size: $Medium_Font_Size;
      margin-top: 5px;
    }

    .close-one-event{
      position: absolute;
      top: 25px;
      right: 18px;
      z-index: 3;
      display: block;

      & > img{
        width: 15px;
      }
    }
  }
</style>

<svelte:head>
  <title>{_('events_on_card')}</title>
</svelte:head>

<Header {locale} />
<div class="map-block">
  <div class="search-block" class:showMobileEvents>
    <div class="full-search-block">
      <div class="full-input-block">
        <div class="input-block">
          <input
            type="text"
            on:keyup={searchLocations}
            bind:value={searchText}
            placeholder={_('search')}
            bind:this={searchBlock}
            on:focus={() => (showFindLocations = true)}
            on:keydown={function(e) {
              if (e.key === 'Enter') {
                showFindEvents();
                this.blur();
              }
            }} />
          <button on:click={showFindEvents}>
            <img src="/img/search.svg" alt="search" />
          </button>
        </div>
        <div class="finded-locations" on:clickOutside>
          <ClickOutside
            exclude={[searchBlock]}
            on:clickoutside={() => (showFindLocations = false)}
            hideByExclude={false}>
            {#if showFindLocations && findLocations.length && searchText.length}
              <ul class="finded-list">
                {#each findLocations as location}
                  <li class="finded-location">
                    <button
                      on:click={() => {
                        searchText = location.location;
                        showFindEvents();
                      }}>
                      {@html location.formatedText}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </ClickOutside>
        </div>
      </div>
      <button class="show-map" on:click={() => (showMobileEvents = false)}>
        <img src="/img/map.svg" alt="show map" />
      </button>
    </div>
    {#if !visibleEvent && !eventsWithCoords.length && (showFindLocations || searchText.length)}
      <span class="not-found">
        {_('locations_search_not_found').replace(/{text}/g, notFoundText)}
      </span>
    {:else if !allEvents.length}
      <span class="not-found">{_('events_not_found')}</span>
    {/if}
  </div>
  <div class="cards-block" class:showOneMobileEvent class:showMobileEvents>
    {#if visibleEvent}
      <div class="one-event" transition:slide={{duration: 300}}>
        <button class="close-one-event" on:click={() => {
          showOneMobileEvent = false;
        }}> <img src="/img/cross.svg" alt="close" /> </button>
        <Card {...visibleEvent} {_} />
        <button
          class="see-all"
          on:click={() => {
            visibleEvent = null;
            showOneMobileEvent = false;
            showMobileEvents = true;
          }}>
          {_('see_all_events')}
        </button>
      </div>
    {:else if eventsWithCoords.length}
      {#each eventsWithCoords as event}
        <Card {...event.meta} {_} />
      {/each}
    {/if}
  </div>
  <YandexMap
    {apiKey}
    {customIcon}
    staticPlacemarks={eventsWithCoords}
    on:placemarkMeta={showEvent}
    center={[52.285725130459866, 104.28156685575135]} />
</div>
<Footer {locale} />
