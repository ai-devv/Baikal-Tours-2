<script>
  import AdminCard from "/components/admin_card.svelte";
  import ClickOutside from "/components/clickOutside.svelte";
  import Pagination from "/components/pagination.svelte";
  import {
    setFilterData,
    setFilterFromUrl,
    showActiveFilters,
    parseFilterDataForHotels,
    setNewLocationsData
  } from "/helpers/filter.js";
  import { parseStringToWords } from "/helpers/parsers.js";
  import { createEventDispatcher } from "svelte";

  export let showHotels, allHotels, hotelsCount, _, fetcher, locations;

  const dispatch = createEventDispatcher();

  let count = 8;
  let offset = 0;
  let filter = {
    search: {
      value: "",
      active: false
    }
  };
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

  filter.locationIds = setNewLocationsData(locations);

  $: {
    pagData = {
      allPags: Math.ceil(hotelsCount / count),
      pag: offset / count
    };
  }

  function changeFilter() {
    parseFilter = parseFilterDataForHotels(filter);

    let secondLocations = [];
    for (let location of filter.locationIds)
      if (location.active) secondLocations.push(location.value);

    activeLocations = secondLocations.join("; ");

    changePagAndURL(0);
  }

  async function changePagAndURL(pagL) {
    pagData.pag = pagL;

    url = {
      ...parseFilter,
      offset: pagData.pag * count,
      count: count
    };

    let result = await fetcher.get(`/api/hotels`, {
      query: url
    });

    hotelsCount = result.count;
    allHotels = result.hotels;
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .all-tours-block {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 2;

    & > button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #00000088;
      z-index: 1;
    }

    & > div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;

      & > h4 {
        font-size: 20px;
        color: white;
      }

      & > div {
        width: 1050px;
        height: 800px;
        background: white;
        margin-top: 30px;
        padding: 20px;
      }
    }
  }

  .tours-block {
    display: grid;
    grid-template-columns: repeat(4, 225px);
    justify-content: space-between;
    grid-row-gap: 20px;
    align-items: start;
    height: 700px;
    margin-top: 30px;
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
      border: 1px solid $Gray;

      & > button {
        background: white;
        width: 150px;
        box-sizing: border-box;
        margin-top: 0;
      }
    }
  }

  .select{
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  .secondLocation{
    padding-left: 15px !important;
  }

  .thridLocation{
    padding-left: 30px !important;
  }
</style>

{#if showHotels}
  <div class="all-tours-block">
    <button on:click={() => dispatch('closeWindow')} />
    <div class="all-tours">
      <h4>{_('hotels')}</h4>
      <div class="tours">
        <div class="filter-block">
          <input
            type="text"
            bind:value={search}
            on:blur={() => {
              filter.search.value = parseStringToWords(search);
              changeFilter();
            }}
            on:keyup={e => {
              if (e.key === 'Enter') {
                filter.search.value = parseStringToWords(search);
                changeFilter();
              }
            }}
            placeholder={_('search_by_name')} />
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
              on:clickoutside={() => locationsBlock.isVisible = false}
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
        <div class="tours-block">
          {#each allHotels as hotel}
            <AdminCard
              name={hotel.name}
              image_url={hotel.image_url}
              price={hotel.price}
              site={hotel.booking_url}
              id={hotel.id}
              {_}
              on:change
              isChange={true} />
          {/each}
        </div>
        <Pagination
          {pagData}
          on:clickPag={e => changePagAndURL(e.detail.pagL)} />
      </div>
    </div>
  </div>
{/if}
