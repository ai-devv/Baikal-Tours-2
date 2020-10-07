<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import {
    setFilterData,
    parseFilterDataForAdmin,
    setFilterFromUrl,
    showActiveFilters,
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
      },
      offset = 0,
      count = 15,
      params = page.query,
      result_cards,
      showFilter = false,
      group;

    if (params.offset !== undefined) offset = parseInt(params.offset);
    if (params.count !== undefined) count = parseInt(params.count);

    if (params.group !== undefined) {
      let groups = ["events", "active", "hidden", "archive"];
      let bl = false;
      for (let successGroup of groups) {
        if (params.group === successGroup) {
          group = successGroup;
          break;
        }
      }
    } else group = "events";

    let result_filters = await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    });

    filter.subjects = setFilterData(result_filters.data.subjects);
    filter.locations = setNewLocationsData(result_filters.data.locations);

    let paramsKeys = Object.keys(params);

    if (
      paramsKeys.length > 1 &&
      paramsKeys[0] === "filter" &&
      paramsKeys[2] !== "count" &&
      paramsKeys[2] !== "offset" &&
      paramsKeys[2] !== "group"
    ) {
      showFilter = true;
      if (params.search !== undefined) {
        let search = parseStringToWords(params.search);
        if (search.length) {
          filter.search.value = search;
          filter.search.active = true;
        }
      }
      if (params.locations !== undefined) {
        filter.locations = setFilterFromUrl(
          params.locations.split(","),
          filter.locations
        );
      }
      if (params.subjects !== undefined) {
        filter.subjects = setFilterFromUrl(
          params.subjects.split(","),
          filter.subjects
        );
      }

      let query = parseFilterDataForAdmin(filter);

      result_cards = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query
      });
    } else {
      result_cards = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query: {
          allStatuses: ""
        }
      });
    }

    if (filter.search.active) filter.search.value = params.search;

    let locale = session.locale;

    let result_count = result_cards.count;
    result_cards = result_cards.actions;

    return {
      result_cards,
      result_filters,
      locale,
      filter,
      offset,
      count,
      result_count,
      showFilter,
      group
    };
  }
</script>

<script>
  import AdminPage from "./_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import dateToString from "/helpers/dateToString.js";
  import Pagination from "/components/pagination.svelte";
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";
  import ClickOutside from "/components/clickOutside.svelte";

  export let result_cards,
    result_filters,
    locale,
    filter,
    count,
    offset,
    result_count,
    showFilter,
    group;

  let options = [],
    cards = result_cards,
    search = "";

  let cardsCounts = {
    active: 0,
    hidden: 0,
    archive: 0,
    allCards: 0
  };

  let pagData;

  $: {
    for (let key of Object.keys(cardsCounts)) cardsCounts[key] = 0;

    for (let i = 0; i < result_cards.length; i++) {
      cardsCounts[result_cards[i].status]++;
      cardsCounts.allCards++;
    }

    result_cards = result_cards.filter(
      el => !(group !== "events" && el.status !== group)
    );
    cards = result_cards.slice(offset, offset + count);
    result_count = result_cards.length;

    pagData = {
      allPags: Math.ceil(result_count / pagCards),
      pag: offset / count
    };

    if (showFilter) parseFilter = parseFilterDataForAdmin(filter);
    changeSearch()
  }

  const fetcher = new Fetcher();

  let pagCards = count,
    parseFilter = {};

  let url = {
    ...parseFilter,
    offset: (offset / count) * pagCards,
    count: pagCards,
    group: group
  };

  const _ = i18n(locale);

  for (let i = 0; i < 2; i++)
    options.push({
      isVisible: false,
      option: null,
      btn: null
    });

  function changeSearch(){
    search = filter.search.value;
  }

  function setURL() {
    let URL = fetcher.makeQuery({ query: url });

    //#fix переписать логику на сторы
    goto("/admin" + URL);
  }

  function changePagAndURL(pagL) {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    pagData.pag = pagL;

    url = {
      ...parseFilter,
      offset: pagData.pag * pagCards,
      count: pagCards,
      group: group
    };

    setURL();
  }

  function clickPag(e) {
    let pagL = e.detail.pagL;

    changePagAndURL(pagL);
  }

  function changeFilter() {
    parseFilter = parseFilterDataForAdmin(filter);
    parseFilter.count = pagCards;
    parseFilter.offset = pagData.pag * pagCards;

    changePagAndURL(0);
    showFilter = showActiveFilters(filter);
  }

  onMount(() => {
    localStorage.removeItem("adminActionParams");
  });

  function changeGroup(gr) {
    url.group = gr;
    setURL();
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .events-status-block {
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
  }

  .event-statuses {
    display: flex;

    & > button {
      border: 1px solid $Light_Blue;
      border-radius: 5px;
      -webkit-box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      -moz-box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      padding: 10px;
      font-size: $Big_Font_Size;
    }

    & > button:not(:first-child) {
      margin-left: 30px;
    }

    & > .active {
      background: rgba(103, 182, 255, 1);
      color: white;
      font-weight: bold;
      box-shadow: inset 0px 0px 6px rgba(0, 0, 0, 0.25);
      // border-color: $Medium_Gray;
    }
  }

  .select-block {
    position: relative;
  }

  .select {
    width: 190px;
    height: 22px;
    text-align: left;
    position: relative;
    color: #00000099;
    background: white;
    border: 1px solid $Gray;
    padding-left: 12px;
    box-sizing: border-box;
    margin-top: 0;
  }

  .option {
    position: absolute;
    top: 27px;
    left: 0;
    background: white;
    border: 1px solid $Gray;
    min-width: 100%;
    box-sizing: border-box;
    z-index: 2;
    max-height: 300px;
    overflow: auto;

    & > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      padding: 0 5px;

      & > input {
        margin-left: 5px;
      }
    }
  }

  .filter-block {
    display: flex;
    align-items: center;
    margin-top: 25px;

    & > *:not(:first-child){
      margin-left: 40px;
    }
  }

  .event-block {
    display: flex;
    background: white;
    font-size: $Medium_Font_Size;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    & > .event {
      width: 100%;
      padding: 10px;
    }

    &:not(:first-child) {
      margin-top: 20px;
    }
  }

  .event-name-block {
    display: flex;
    align-items: flex-end;
    font-weight: bold;

    & > img {
      width: 21px;
      margin-right: 11px;
      visibility: hidden;
    }
  }

  .event-info-block {
    display: flex;
    margin-top: 18px;

    & > div {
      flex: calc(10 / 3);
      padding-right: 15px;
    }
  }

  .events-block {
    margin-top: 30px;
  }

  .event-status-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .event-status {
    width: 85px;
    position: relative;
    font-weight: bold;
    box-shadow: inset 0px 0px 7px rgba(0, 0, 0, 0.25);

    & > div {
      color: white;
    }
  }

  .active-status {
    background: $Green;
  }

  .archive-status {
    background: $Dark_Gray;
  }

  .hidden-status {
    background: $Light_Blue;
  }

  .full-event-block {
    margin-top: 15px;
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

  .search-input{
    width: 300px;
    padding: 5px;
    background: white;
    border: 1px solid $Gray;
    border-radius: 0;
  }

  .secondLocation{
    padding-left: 15px !important;
  }

  .thridLocation{
    padding-left: 30px !important;
  }
</style>

<svelte:head>
  <title>{_('actions')}</title>
</svelte:head>

<AdminPage page={0} {fetcher} {_} {locale}>
  <div class="events-status-block">
    <div class="event-statuses">
      <button
        class:active={group === 'events'}
        on:click={() => changeGroup('events')}>
        {_('actions')} {cardsCounts.allCards}
      </button>
      <button
        class:active={group === 'active'}
        on:click={() => changeGroup('active')}>
        {_('active')} {cardsCounts.active}
      </button>
      <button
        class:active={group === 'hidden'}
        on:click={() => changeGroup('hidden')}>
        {_('hidden')} {cardsCounts.hidden}
      </button>
      <button
        class:active={group === 'archive'}
        on:click={() => changeGroup('archive')}>
        {_('archive')} {cardsCounts.archive}
      </button>
    </div>
    <a href="./admin/event/edit" class="new-event">{_('new_event')}</a>
  </div>
  <div class="filter-block">
    <input
      type="text"
      placeholder={_('search_by_name')}
      bind:value={search}
      on:blur={() => {
        filter.search.value = search;
        changeFilter();
      }}
      class="search-input"
      on:keyup={function(e) {
        if (e.key === 'Enter') this.blur();
      }} />
    <div class="select-block">
      <button
        class="select"
        bind:this={options[0].btn}
        on:click={() => {
          options[0].isVisible = true;
        }}>
        {_('thematics')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[0].isVisible = false)}
        exclude={[options[0].btn]}>
        {#if options[0].isVisible}
          <div class="option" bind:this={options[0].option}>
            {#each filter.subjects as subject}
              <div
                on:click={() => {
                  subject.active = !subject.active;
                  changeFilter();
                }}>
                <label>{subject.value}</label>
                <input type="checkbox" bind:checked={subject.active} />
              </div>
            {/each}
          </div>
        {/if}
      </ClickOutside>
    </div>
    <div class="select-block">
      <button
        class="select"
        bind:this={options[1].btn}
        on:click={() => {
          options[1].isVisible = true;
        }}>
        {_('location')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[1].isVisible = false)}
        exclude={[options[1].btn]}>
        {#if options[1].isVisible}
          <div class="option" bind:this={options[1].option}>
            {#each filter.locations as location}
              <div
                class:secondLocation={location.n1 && !location.n2} class:thridLocation={location.n1 && location.n2}
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
      <li class="ul-name">{_('you_have_chosen')}:</li>
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
  
  <div class="events-block">
    {#each cards as card, i}
      <div class="full-event-block">
        <a
          class="event-block"
          on:click={() => localStorage.setItem('adminActionParams', document.location.href)}
          href='./admin/event/{card.slug}'>
          <div class="event">
            <div class="event-name-block">{card.name}</div>
            <div class="event-info-block">
              <div>{card.subjects.join('; ')}</div>
              {#if card.dates}
                <div>
                  <ul>
                    {#each card.dates as date}
                      <li>
                        {dateToString(date, _)}
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
              <div>
                {#if card.locations}
                  <ul>
                    {#each card.locations as location}
                      <li>
                        {location.address ? `${location.name}, ${location.address}` : location.name}
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            </div>
          </div>
          <div
            class="event-status"
            class:active-status={card.status === 'active'}
            class:archive-status={card.status === 'archive'}
            class:hidden-status={card.status === 'hidden'}>
            <div class="event-status-text">
              {#if card.status === 'active'}
                {_('active')}
              {:else if card.status === 'hidden'}
                {_('hidden')}
              {:else if card.status === 'archive'}{_('archive')}{/if}
            </div>
          </div>
        </a>
      </div>
    {/each}
  </div>
  <Pagination {pagData} on:clickPag={clickPag} />
</AdminPage>
