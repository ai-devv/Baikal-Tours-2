<script>
  import { createEventDispatcher } from "svelte";
  import {
    setFilterData,
    parseFilterDataForAdmin,
    showActiveFilters,
    setNewLocationsData
  } from "/helpers/filter.js";
  import ClickOutside from "/components/clickOutside.svelte";
  import { parseStringToWords } from "/helpers/parsers.js";
  import dateToString from "/helpers/dateToString.js";

  export let _,
    result_filters,
    result_actions,
    showEvents,
    actions,
    fetcher;

  result_actions = result_actions.filter(el => el.status === "active");

  const dispatch = createEventDispatcher();

  let filter = {
      search: {
        value: "",
        active: false
      }
    },
    parseFilter,
    showFilter = false;

  let search = "";
  filter.subjects = setFilterData(result_filters.subjects);
  filter.locations = setNewLocationsData(result_filters.locations);

  let options = [];
  for (let i = 0; i < 2; i++)
    options.push({
      isVisible: false,
      option: null,
      btn: null
    });

  function checkSearchFilter() {
    var str = parseStringToWords(search);

    if (str.length !== 0) filter.search.active = true;
    else filter.search.active = false;

    filter.search.value = str;

    changeFilter();

    filter.search.value = search;
  }

  function closeFilter(e) {
    filter = e.detail.filter;

    changeFilter();
  }

  async function changeFilter() {
    parseFilter = parseFilterDataForAdmin(filter);

    delete parseFilter.allStatuses;

    showFilter = Object.keys(parseFilter).length > 1;

    result_actions = (await fetcher.get("/api/actions", {
      query: parseFilter
    })).actions.filter(el => el.status === "active");
  }

  function changeAction(action) {
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].id === action.id) {
        alert(_("already_added_event"));
        return 0;
      }
    }
    dispatch("changeAction", {
      action
    });
    hideActionsWindow();
  }

  function hideActionsWindow() {
    dispatch("hideActionWindow");
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .secondLocation{
    padding-left: 15px !important;
  }

  .thridLocation{
    padding-left: 30px !important;
  }

  .events-window {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    background: #00000055;
    overflow: hidden;
    visibility: hidden;

    & > button {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 1;
    }

    & > .events-block {
      z-index: 2;
      position: absolute;
      width: 600px;
      height: 600px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      overflow: auto;
    }
  }

  .showEvents {
    visibility: visible;
  }

  .action {
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 10px;
    cursor: pointer;

    & > h2 {
      margin: 0;
    }

    & > div {
      display: flex;
      margin-top: 10px;

      & > span,
      ul {
        width: calc(100% / 3 - 20px);
      }
    }

    &:not(:first-child) {
      margin-top: 20px;
    }
  }

  .line {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
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
</style>

<div class="events-window" class:showEvents>
  <button class="close-window" on:click={hideActionsWindow} />
  <div class="events-block">
    <div class="filter-block">
      <input
        type="text"
        placeholder={_('search_by_name')}
        bind:value={search}
        on:blur={checkSearchFilter}
        class="search-input"
        on:keyup={function(e) {
          if (e.key === 'Enter') this.blur();
        }} />
      <div class="line">
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

    {#each result_actions as action}
      <div class="action" on:click={() => changeAction(action)}>
        <h2>{action.name}</h2>
        <div>
          <span>{action.subjects.join('; ')}</span>
          {#if action.locations}
            <ul>
              {#each action.locations as location}
                <li>
                  {location.address ? `${location.name}, ${location.address}` : location.name}
                </li>
              {/each}
            </ul>
          {/if}
          {#if action.dates}
            <ul>
              {#each action.dates as date}
                <li>
                  {dateToString(date, _)}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
