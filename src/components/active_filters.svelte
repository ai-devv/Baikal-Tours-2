<script>
  import { createEventDispatcher } from "svelte";

  export let filter,
    showFilter,
    date = "",
    price = "",
    _,
    search = "",
    white = false;

  // $: if (search !== "") filter.date.dateStart.value = search;

  const dispatch = createEventDispatcher();

  function closeFilter() {
    dispatch("closeFilter", {
      filter: filter
    });
  }

  function closePrice() {
    dispatch("closePrice");
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .active-filter-block {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-size: $Medium_Font_Size;

    & > .filter-head {
      font-size: $Big_Font_Size;
      font-family: $Playfair;
      font-weight: bold;
      margin-top: 10px;
      margin-right: 10px;
    }
  }

  .active-filter {
    padding: 15px 20px;
    background: #eeeeee;
    border-radius: 100px;
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-top: 20px;
    font-family: $Gilroy;
    font-size: $Big_Font_Size;

    & > button {
      margin-left: 15px;

      & > img {
        width: 10px;
        height: 10px;
      }
    }
  }

  .white {
    background: white !important;
  }
</style>

{#if showFilter}
  <div class="active-filter-block">
    <div class="filter-head">{_('you_have_chosen')}</div>
    {#if date !== ''}
      <div class="active-filter" class:white>
        {date}
        <button
          class="delete-filter"
          on:click={() => {
            filter.date.dateStart.value = '';
            filter.date.dateEnd.value = '';
            closeFilter();
          }}>
          <img src="img/cross-grey.svg" alt="clear" />
        </button>
      </div>
    {/if}

    {#each ['locations', 'subjects', 'companions'] as key, i}
      {#each filter[key] as fl, j}
        {#if fl.active}
          <div class="active-filter" class:white>
            {fl.value}
            <button
              class="delete-filter"
              on:click={() => {
                fl.active = false;
                closeFilter();
              }}>
              <img src="img/cross-grey.svg" alt="clear" />
            </button>
          </div>
        {/if}
      {/each}
    {/each}

    {#if price !== ''}
      <div class="active-filter" class:white>
        {price}
        <button
          class="delete-filter"
          on:click={() => {
            closePrice();
          }}>
          <img src="img/cross-grey.svg" alt="clear" />
        </button>
      </div>
    {/if}
  </div>
{/if}
