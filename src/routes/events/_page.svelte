<script>
import Header from "/components/header.svelte";
import Footer from "/components/footer.svelte";
import Card from "/components/card_of_event.svelte";
import BreadCrumbs from "/components/breadcrumbs.svelte";
import {
  parseDate,
  parseDateForActiveFilter,
  parsePriceForActiveFilter
} from "/helpers/parsers.js";
import {
    parseFilterData,
    setFilterData,
    setFilterFromUrl,
    setNewLocationsData,
    createFilterWithSlug
} from "/helpers/filter.js";
import i18n from "/helpers/i18n/index.js";
import { goto, stores } from "@sapper/app";
import { onMount, afterUpdate, onDestroy } from "svelte";
import ActiveFilters from "/components/active_filters.svelte";
import Selection from "/components/selection.svelte";
import { slide } from "svelte/transition";
import * as animateScroll from "svelte-scrollto";
import SimilarEvent from "/components/similar_event.svelte";
import Carousel from "/components/carousel.svelte";
import ClickOutside from "/components/clickOutside.svelte";
import Fetcher from "/helpers/fetcher.js";

export let result_cards,
  result_filters,
  locale,
  filter,
  showFilter,
  result_compiliations,
  result_favorites,
  mobile,
  intersection;

const fetcher = new Fetcher();
const _ = i18n(locale);
const { page } = stores();

let date = "",
  price = "",
  priceStart = "",
  priceEnd = "",
  resp,
  cards = [],
  leftRange = true,
  rightRange = true,
  parseFilter = {},
  selectionsCarousel,
  start = false,
  head,
  scrollY,
  clientHeight,
  innerHeight,
  compiliations,
  swiper = null,
  visibleCards = 0,
  cardFilter;

let options = [];

for (let i = 0; i < 5; i++)
  options.push({
    isVisible: false,
    option: null,
    btn: null
  });

$: {
  
  cards = result_cards.slice(0, visibleCards);

  checkActiveFilter();
}

$: if (
  scrollY + innerHeight > clientHeight &&
  visibleCards < result_cards.length
)
    visibleCards += 15;

function checkActiveFilter() {
  let pFilter = parseFilterData(filter).params;
  if (showFilter) {
    parseFilter = pFilter;
    date = parseDateForActiveFilter(filter);
    price = parsePriceForActiveFilter(filter, _);
  }

  if (Object.keys(pFilter).length > 1)
    cardFilter = `/map${fetcher.makeQuery({ query: pFilter })}`;
  else cardFilter = `/map`;
}

function changeFilter() {
  //change date status and her correct view
  if (
    new Date(filter.date.dateStart.value) > new Date(filter.date.dateEnd.value) &&
    filter.date.dateStart.value !== "" &&
    filter.date.dateEnd.value !== ""
  )
    filter.date.dateStart.value = filter.date.dateStart.value;

  filter.date.dateStart.active = filter.date.dateStart.value === "" ? false : true;
  filter.date.dateEnd.active = filter.date.dateEnd.value === "" ? false : true;

  date = parseDateForActiveFilter(filter);

  if (filter.date.dateStart.active && filter.date.dateEnd.active)
    date = filter.date.dateStart.value + " - " + filter.date.dateEnd.value;
  else if (filter.date.dateStart.active) date = filter.date.dateStart.value;
  else if (filter.date.dateEnd.active) date = filter.date.dateEnd.value;
  else date = "";

  //change price status and her correct

  if (
    filter.price.priceMin.value > filter.price.priceMax.value &&
    filter.price.priceMin.value !== "" &&
    filter.price.priceMax.value !== ""
  ) {
    priceStart = filter.price.priceMax.value;
    filter.price.priceMin.value = filter.price.priceMax.value;
  }

  if (filter.price.priceMin.value === "" || filter.price.priceMin.value === undefined)
    filter.price.priceMin.active = false;
  else filter.price.priceMin.active = true;

  if (filter.price.priceMax.value === "" || filter.price.priceMax.value === undefined)
    filter.price.priceMax.active = false;
  else filter.price.priceMax.active = true;

  price = parsePriceForActiveFilter(filter, _);

  parseFilter = createFilterWithSlug(filter, fetcher, $page.query.search);

  visibleCards = 0;

  window.location.href = `/events${parseFilter}`;
  // goto(`events${parseFilter}`);
}

function setPrice() {
  animateScroll.scrollTo({ offset: scrollY, duration: 300 });

  let bl = false;

  if (filter.price.priceMin.value !== priceStart) {
    filter.price.priceMin.value = priceStart;
    bl = true;
  }

  if (filter.price.priceMax.value !== priceEnd) {
    filter.price.priceMax.value = priceEnd;
    bl = true;
  }

  if (bl) changeFilter();
}

onMount(() => {
  localStorage.removeItem("actionsParams");
});

function closePrice(e) {
  animateScroll.scrollTo({ offset: scrollY, duration: 300 });

  priceStart = "";
  priceEnd = "";

  setPrice();
}

function closeFilter(e) {
  filter = e.detail.filter;

  animateScroll.scrollTo({ offset: scrollY, duration: 300 });

  changeFilter();
}

function fLoad() {
  selectionsStart = true;
  if (start) startSelection();
}

function showCard() {
  let cardFilter = parseFilterData(filter).params;

  if (Object.keys(cardFilter).length > 1)
    window.location.href = `/map${fetcher.makeQuery({ query: cardFilter })}`;
  else window.location.href = `/map`;
}
</script>

<style lang="scss">
  @import "./styles/global";

  .intro{
    margin-top: 25px;
    color: rgba(52, 53, 63, 0.5);
    font-size: $Big_Font_Size;
  }

  .secondLocation {
    padding-left: 30px !important;
  }

  .thridLocation {
    padding-left: 45px !important;
  }

  .form-width {
    margin: 235px auto 15px;
    min-height: calc(100vh - 175px - 60px);
  }

  .cards-block {
    display: grid;
    grid-template-columns: repeat(3, 380px);
    justify-content: space-between;
    grid-row-gap: 30px;
    margin-top: 50px;
  }

  input:not([type="checkbox"]),
  .select {
    background: white;
    padding: 0 3px;
    font-size: $Big_Font_Size;
    width: 130px;
    padding: 25px 20px;
    box-sizing: border-box;
    color: #3b394a;

    &.date {
      position: relative;
      -moz-user-select: -moz-none;
      -o-user-select: none;
      -khtml-user-select: none;
      -webkit-user-select: none;
      user-select: none;

      &:last-child {
        margin-left: 30px;
      }
    }

    &::placeholder {
      color: #3b394a;
    }
  }

  .select {
    width: 170px;
    height: 74px;
  }

  .date::-webkit-inner-spin-button,
  .date::-webkit-clear-button {
    display: none;
    -webkit-appearance: none;
  }

  .date::-webkit-calendar-picker-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    height: auto;
    color: transparent;
    background: transparent;
  }

  .filters {
    background: #f5f7fa;
    padding: 45px 50px;
    margin: 30px 0 70px;
    display: flex;
    justify-content: space-between;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    width: 1300px;
    margin-left: -50px;
    box-sizing: border-box;
  }

  .selections-carousel {
    overflow: hidden;
    position: relative;
  }

  .price-filter {
    position: relative;

    & > :global(div) {
      position: absolute;
      bottom: -20px;
      left: 0;
      width: 100%;
    }

    & input[type="range"] {
      width: 100%;
    }

    &:last-child > :global(div) {
      width: calc(100% - 30px);
      left: 30px;
    }
  }

  .prices {
    display: flex;
  }

  .selection-carousel {
    margin-top: 235px;
    opacity: 0;
    transition: 0.3s;

    & :global(.selection-block) {
      margin-left: 15px;
    }
  }

  .selection-carousel-loaded {
    opacity: 1;
  }

  .selections-block {
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    grid-row-gap: 40px;
    border-radius: 10px;
    margin-top: 60px;
  }

  #price-end {
    margin-left: 30px;
  }

  .two-input {
    position: relative;

    &::before {
      position: absolute;
      content: " ";
      width: 20px;
      height: 2px;
      background: #34353f;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
    }
  }

  .select::before {
    transform: rotate(90deg);
    width: 15px;
    height: 10px;
    right: 20px;
    background-image: url(../img/next.svg);
  }

  h2 {
    margin-top: 235px;
  }

  h2,
  h1 {
    font-family: $Playfair;
    color: #434343;
    font-size: $UltraBig_Font_Size;

    & > span {
      font-family: inherit;
      color: $Blue;
    }
  }

  h1 {
    margin-top: 100px;
  }

  .option {
    border: none;
    top: 100%;
    left: 0;
    width: 370px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
    visibility: visible;

    & > div {
      padding: 15px 20px;

      & > label {
        font-size: $Big_Font_Size;
        font-family: $Gilroy;
        color: #3b394a;
        width: calc(100% - 40px);
      }

      & > img {
        opacity: 0.3;
        height: 20px;
        margin-right: 10px;
      }
    }
  }

  .more-events {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 115px;

    & > h2 {
      font-size: 36px;
      margin: 0;
    }

    & > a {
      border-radius: 100px;
      background: #117bcd;
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.15);
      color: white;
      padding: 15px 55px;
      font-family: $Gilroy;
      font-size: $LowBig_Font_Size;
      position: relative;
      transition: 0.3s;

      &:hover {
        background: #0052b4;

        > img {
          bottom: 20px;
        }
      }

      & > img {
        position: absolute;
        bottom: 15px;
        right: 10px;
        width: 40px;
        transition: 0.3s;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .filters {
      flex-direction: column;

      & > *:not(:first-child) {
        margin-top: 15px;
      }
    }

    .two-input {
      display: flex;
      justify-content: space-between;

      &:before {
        width: 10px;
      }

      & > input {
        margin: 0 !important;
        width: 125px;
        font-size: $Medium_Font_Size !important;
        padding: 15px 20px;
      }
    }

    #price-end,
    #price-start {
      margin: 0 !important;
      font-size: $Medium_Font_Size;
      padding: 15px 20px;
      width: 125px;
    }

    .select {
      padding: 15px 20px;
      height: auto;

      &:before {
        top: calc(50% - 3px);
      }
    }

    .option,
    .select {
      width: 100%;
      font-size: $Medium_Font_Size;

      & label {
        font-size: $Medium_Font_Size;
      }
    }

    .cards-block {
      grid-template-columns: repeat(1, 100%);
    }

    .form-width{
      margin-top: 160px;
    }

    h1 {
      margin-top: 60px;
      font-size: 24px;
    }

    .filters {
      padding: 30px 10px;
      margin: 30px 0 60px;
      display: flex;
      justify-content: space-between;
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      width: 100%;
      box-sizing: border-box;
    }

    .selections-block {
      grid-template-columns: repeat(1, 100%);
      grid-row-gap: 15px;
      margin-top: 30px;
    }

    .more-events {
      flex-direction: column;
      margin-top: 60px;

      & > h2 {
        font-size: 24px;
        width: 100%;
      }

      & > button {
        margin-top: 25px;
        display: block;
        width: 100%;
      }
    }

    .price-filter {
      & > :global(div) {
        width: 100% !important;
        top: 45px;
        padding: 0;
        left: 0 !important;
      }

      & input[type="range"] {
        padding: 0;
      }
    }
  }
</style>

<svelte:head>
  {#if intersection.data[0]}
    <title>{intersection.data[0].title}</title>
  {:else}
    <title>{_('event_catalog')}</title>
  {/if}
  <!-- <link rel="stylesheet" href="https://unpkg.com/swiper/css/swiper.css" /> -->
  {#if intersection.data[0]}
    <meta name="description" content={intersection.data[0].description}>
  {/if}
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight />

<Header {locale} searchText={$page.query.search ? $page.query.search : ''} />
<!-- <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}]} /> -->
<div class="form-width" bind:clientHeight>

  {#if result_compiliations.length}
    <div class="selections-carousel">
      <Carousel
        data={{ slidesPerView: 'auto', slidesPerView: mobile ? 'auto' : 3, spaceBetween: mobile ? 10 : 30, slidesPerGroup: mobile ? 1 : 3, speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, watchOverflow: false }}
        carouselData={result_compiliations}>
        {#each result_compiliations as compiliation}
          <Selection
            width={mobile ? 210 : 390}
            height={mobile ? 140 : 200}
            {...compiliation} />
        {/each}
      </Carousel>
    </div>
  {/if}

  <h1>
    {#if $page.query.search}
      {_('finded')}
    {:else if intersection.data[0]}
      {intersection.data[0].h1}
    {:else}
      {_('event_catalog')}
    {/if}
  </h1>

  {#if intersection.data[0] && intersection.data[0].intro}
    <h2 class="intro">
      {intersection.data[0].intro}
    </h2>
  {/if}

  <div class="filters">
    <div class="two-input">
      <input
        placeholder={_('date_from')}
        class="date"
        type="date"
        bind:value={filter.date.dateStart.value}
        on:change={() => {
          animateScroll.scrollTo({ offset: scrollY, duration: 300 });
          changeFilter();
        }} />
      <input
        placeholder={_('date_by')}
        class="date"
        type="date"
        bind:value={filter.date.dateEnd.value}
        on:change={() => {
          animateScroll.scrollTo({ offset: scrollY, duration: 300 });
          changeFilter();
        }}
        id="date-end" />
    </div>
    <div class="select-block">
      <button
        class="select"
        bind:this={options[0].btn}
        on:click={() => {
          options[0].isVisible = true;
        }}>
        {_('where')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[0].isVisible = false)}
        exclude={[options[0].btn]}>
        {#if options[0].isVisible}
          <div class="option" bind:this={options[0].option} transition:slide>
            {#each filter.locations as city, i}
              <div
                class:secondLocation={city.n1 && !city.n2}
                class:thridLocation={city.n1 && city.n2}
                on:click={() => {
                  city.active = !city.active;
                  animateScroll.scrollTo({ offset: scrollY, duration: 300 });
                  changeFilter();
                }}>
                <img src="/img/placeholder.svg" alt="place" />
                <label>{city.value}</label>
                <input type="checkbox" bind:checked={city.active} />
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
        {_('with_whom')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[1].isVisible = false)}
        exclude={[options[1].btn]}>
        {#if options[1].isVisible}
          <div class="option" bind:this={options[1].option} transition:slide>
            {#each filter.companions as companios}
              <div
                on:click={() => {
                  companios.active = !companios.active;
                  animateScroll.scrollTo({ offset: scrollY, duration: 300 });
                  changeFilter();
                }}>
                <label>{companios.value}</label>
                <input type="checkbox" checked={companios.active} />
              </div>
            {/each}
          </div>
        {/if}
      </ClickOutside>
    </div>
    <div class="select-block">
      <button
        class="select"
        bind:this={options[2].btn}
        on:click={() => {
          options[2].isVisible = true;
        }}>
        {_('thematics')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[2].isVisible = false)}
        exclude={[options[2].btn]}>
        {#if options[2].isVisible}
          <div class="option" bind:this={options[2].option} transition:slide>
            {#each filter.subjects as subjects}
              <div
                on:click={() => {
                  subjects.active = !subjects.active;
                  animateScroll.scrollTo({ offset: scrollY, duration: 300 });
                  changeFilter();
                }}>
                <label>{subjects.value}</label>
                <input type="checkbox" bind:checked={subjects.active} />
              </div>
            {/each}
          </div>
        {/if}
      </ClickOutside>
    </div>
    <div class="prices two-input">
      <div class="price-filter">
        <input
          type="number"
          placeholder={_('price_from')}
          id="price-start"
          bind:value={priceStart}
          on:blur={setPrice}
          bind:this={options[3].btn}
          class="price"
          on:click={() => {
            options[3].isVisible = true;
          }} />
        <!-- <ClickOutside
          on:clickoutside={() => (options[3].isVisible = false)}
          exclude={[options[3].btn]}>
          {#if options[3].isVisible}
            <input
              type="range"
              min={result_filters.data.prices[0].min}
              max={priceEnd === '' ? result_filters.data.prices[0].max - 1 : priceEnd}
              bind:value={priceStart}
              on:change={setPrice} />
          {/if}
        </ClickOutside> -->
      </div>
      <div class="price-filter">
        <input
          type="number"
          placeholder={_('to')}
          id="price-end"
          bind:value={priceEnd}
          on:blur={setPrice}
          bind:this={options[4].btn}
          class="price"
          on:click={() => {
            options[4].isVisible = true;
          }} />
        <!-- <ClickOutside
          on:clickoutside={() => (options[4].isVisible = false)}
          exclude={[options[4].btn]}>
          {#if options[4].isVisible}
            <input
              type="range"
              min={priceStart}
              max={result_filters.data.prices[0].max}
              bind:value={priceEnd}
              on:change={setPrice} />
          {/if}
        </ClickOutside> -->
      </div>
    </div>
  </div>

  <ActiveFilters
    {filter}
    {showFilter}
    {date}
    {price}
    {_}
    on:closeFilter={closeFilter}
    on:closePrice={closePrice} />

  <div class="selections-block" itemscope itemtype="http://schema.org/ItemList">
    {#each result_favorites as favorite}
      <SimilarEvent {_} {favorite} />
    {/each}
  </div>

  <div class="more-events">
    <h2>{_('all_events')}</h2>
    <a class="show-card" href={cardFilter}>
      {_('show_on_card')}
      <img src="/img/placeholder-map.svg" alt="placeholder" />
    </a>
  </div>

  <div
    class="cards-block"
    bind:this={head}
    itemscope
    itemtype="http://schema.org/ItemList">
    {#each cards as cardInfo (cardInfo.id)}
      <Card {...cardInfo} {locale} />
    {/each}
  </div>
</div>
<Footer {locale} />
