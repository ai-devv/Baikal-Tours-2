<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import {
    setFilterData,
    setFilterFromUrl,
    showActiveFilters,
    parseFilterDataForHotels,
    setNewLocationsData
  } from "/helpers/filter.js";
  import { parseStringToWords } from "/helpers/parsers.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let filter = {
      search: {
        value: "",
        active: false
      }
    };
    let params = page.query;
    let hotels;
    let locale = session.locale;
    let offset = 0;
    let count = 16;
    let paramsKeys = Object.keys(params);
    let showFilter = false;
    let locations = (await fetcher.get("/api/locations2", {
      credentials: "same-origin"
    })).data;
    let str = "";

    if (params.offset !== undefined) offset = parseInt(params.offset);
    if (params.count !== undefined) count = parseInt(params.count);

    filter.locationIds = setNewLocationsData(locations);

    if (
      paramsKeys[0] === "filter" &&
      paramsKeys[1] !== "count" &&
      paramsKeys[1] !== "offset"
    ) {
      showFilter = true;

      if (params.search !== undefined) {
        str = parseStringToWords(params.search);
        if (str.length) {
          filter.search.value = parseStringToWords(params.search);
          filter.search.active = true;
        }
      }
      if (params.locationIds !== undefined)
        filter.locationIds = setFilterFromUrl(
          params.locationIds.split(","),
          filter.locationIds
        );

      hotels = await fetcher.get("api/hotels", {
        credentials: "same-origin",
        query: { ...parseFilterDataForHotels(filter), offset, count }
      });

      if (str.length) filter.search.value = params.search;
    } else
      hotels = await fetcher.get("api/hotels", {
        credentials: "same-origin",
        query: { offset, count }
      });

    let hotelsCount = hotels.count;
    hotels = hotels.hotels;

    return {
      locale,
      hotels,
      offset,
      count,
      hotelsCount,
      filter,
      showFilter
    };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import Image from "/components/imageCenter.svelte";
  import Pagination from "/components/pagination.svelte";
  import { goto } from "@sapper/app";
  import ClickOutside from "/components/clickOutside.svelte";

  export let locale,
    hotels,
    count,
    offset,
    hotelsCount,
    filter,
    showFilter;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  let locationsBlock = {
    isVisible: false,
    btn: null
  };
  let pagData;
  let parseFilter = {};
  let url = {
    ...parseFilter,
    offset: (offset / count) * count,
    count
  };
  let search = "";
  let activeLocations = "";

  $: {
    hotels;
    checkActiveFilter();
  }

  function checkActiveFilter() {
    let secondLocations = [];

    search = filter.search.value;
    pagData = {
      allPags: Math.ceil(hotelsCount / count),
      pag: offset / count
    };

    if (showFilter){
        parseFilter = parseFilterDataForHotels(filter);
        for(let location of filter.locationIds)
            if(location.active)
                secondLocations.push(location.value);
    }

    activeLocations = secondLocations.join("; ");
  }

  function changeFilter() {
    parseFilter = parseFilterDataForHotels(filter);

    changePagAndURL(0);
  }

  function changePagAndURL(pagL) {
    pagData.pag = pagL;

    url = {
      ...parseFilter,
      offset: pagData.pag * count,
      count: count
    };

    goto(`./admin/hotels${fetcher.makeQuery({ query: url })}`);
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .head-line {
    margin-top: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > h1 {
      font-size: $Big_Font_Size;
    }
  }

  .hotels-block {
    display: grid;
    grid-template-columns: repeat(4, 225px);
    grid-row-gap: 20px;
    justify-content: space-between;
    margin-top: 40px;

    & > li {
      margin: 0;
      padding: 0;
      display: block;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      background: white;
    }
  }

  .error {
    display: block;
    font-weight: bold;
    font-size: $Big_Font_Size;
    margin-top: 30px;
    text-align: center;
  }

  .img-block {
    height: 200px;
    position: relative;
    overflow: hidden;
    margin-bottom: 20px;
  }

  h3 {
    font-size: $Big_Font_Size;
  }

  .hotel-url {
    margin-top: 10px;
    color: $Blue;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price {
    display: block;
    margin-top: 10px;
  }

  .filter-block {
    display: flex;
    margin-top: 20px;
    align-items: center;

    & > input {
      width: 300px;
      padding: 5px;
      background: white;
      border: 1px solid $Gray;
    }

    & > .select-block {
      margin-left: 20px;

      & > button {
        background: white;
        width: 150px;
        box-sizing: border-box;
        margin-top: 0;
      }
    }
  }

  .active-filters {
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    & > .ul-name {
      margin-right: 20px;
      font-size: $Big_Font_Size;
    }

    & > li:not(.ul-name) {
      padding: 10px;
      background: white;
      border-radius: 100px;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      margin-right: 20px;
      display: flex;
      align-items: center;

      & img {
        width: 15px;
        margin-left: 10px;
      }
    }

    & > li {
      margin-top: 10px;
    }
  }

  .edit-hotel{
      margin: 10px auto 0;
      width: 120px;
      padding: 10px;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      text-align: center;
      display: block;
  }

  .secondLocation{
    padding-left: 15px !important;
  }

  .thridLocation{
    padding-left: 30px !important;
  }
</style>

<svelte:head>
  <title>{_('hotels')}</title>
</svelte:head>

<AdminPage {locale} {_} {fetcher} page={4}>
  <div class="head-line">
    <h1>{_('hotels')}</h1>
    <a class="green-button" href="/admin/hotels/edit">{_('new_hotel')}</a>
  </div>
  <div class="filter-block">
    <input
      type="text"
      bind:value={search}
      on:blur={() => {
        filter.search.value = search;
        changeFilter();
      }}
      on:keyup={e => {
        if (e.key === 'Enter') {
          filter.search.value = search;
          changeFilter();
        }
      }} 
      placeholder={_("search_by_name")}/>
    <div class="select-block">
      <button
        class="select"
        bind:this={locationsBlock.btn}
        on:click={() => {
          locationsBlock.isVisible = true;
        }}>
        {activeLocations.length === 0 ? _('locations') : activeLocations}
      </button>
      <ClickOutside
        on:clickoutside={() => (locationsBlock.isVisible = false)}
        exclude={[locationsBlock.btn]}>
        {#if locationsBlock.isVisible}
          <div class="option">
            {#each filter.locationIds as location}
              <div
                class:secondLocation={location.n1 && !location.n2} 
                class:thridLocation={location.n1 && location.n2}
                on:click={() => {
                  location.active = !location.active;
                  changeFilter();
                }}>
                <label>{location.value}</label>
                <input type="checkbox" bind:checked={location.active} />
              </div>
            {/each}
          </div>
        {/if}
      </ClickOutside>
    </div>
  </div>

  {#if showFilter}
    <ul class="active-filters">
      <li class="ul-name">{_("you_have_chosen")}:</li>
      {#each Object.keys(filter) as filterKey}
        {#if Array.isArray(filter[filterKey])}
          {#each filter[filterKey] as elem}
            {#if elem.active}
              <li>
                {elem.value}
                <button
                  on:click={() => {
                    elem.active = false;
                    changeFilter();
                  }}>
                  <img src="/img/cross.svg" alt="delete" />
                </button>
              </li>
            {/if}
          {/each}
        {:else if filter[filterKey].active}
          <li>
            {filter[filterKey].value}
            <button
              on:click={() => {
                filter[filterKey].active = false;
                filter[filterKey].value = '';
                changeFilter();
              }}>
              <img src="/img/cross.svg" alt="delete" />
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}

  {#if hotels.length > 0}
    <ul class="hotels-block">
      {#each hotels as hotel}
        <li class="hotel">
          <div class="img-block">
            <Image src={hotel.image_url} alt={hotel.name} />
          </div>
          <h3>{hotel.name}</h3>
          <a href={hotel.booking_url} class="hotel-url" target="_blank">
            {hotel.booking_url}
          </a>
          {#if hotel.price !== null}
            <span class="price">{hotel.price}₽</span>
          {/if}
          <a href={`./admin/hotels/edit?id=${hotel.id}`} class="edit-hotel">{_("edit")}</a>
        </li>
      {/each}
    </ul>
    <Pagination {pagData} on:clickPag={e => changePagAndURL(e.detail.pagL)} />
  {:else}
    <span class="error">{_('hotels_not_found')}</span>
  {/if}
</AdminPage>
