<script>
  export let page, fetcher, locale, _;

  let languages = [
    {
      id: 1,
      lang: "ru"
    },
    {
      id: 2,
      lang: "en"
    },
    {
      id: 3,
      lang: "zh"
    }
  ];

  let secondLanguage = locale;

  async function changeLanguage() {
    let result = await fetcher.put("/api/locales/" + secondLanguage);

    document.location.reload();
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .category-block {
    background: $Light_Black;
    width: 120px;
    height: 710px;
    position: relative;
  }

  h1 {
    font-size: $Big_Font_Size;
    color: white;
    margin: 22px auto 0 auto;
    width: 93px;
  }

  .category-href {
    width: 100%;
    text-align: center;
    display: block;
    color: $Gray;
    background: transparent;
    padding: 7px 0;
    font-size: $Medium_Font_Size;

    &:not(:first-child) {
      margin-top: 10px;
    }
  }

  .active-page {
    background: $Gray;
    color: $Light_Black;
    font-weight: bold;
  }

  .bottom {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;

    & > .language {
      text-transform: uppercase;
      font-weight: bold;
      border: 1px solid $Light_Black;
      // background-image: url("../img/language.png");
      // background-repeat: no-repeat;
      // background-position: right 0.7em top 50%, 0 0;
      //width: 45px;
      -moz-appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      margin-bottom: 10px;
      color: white;

      &::-ms-expand {
        display: none;
      }

      & > option {
        background: $Light_Black;
        color: white;
      }
    }
  }
</style>

<div class="category-block">
  <h1>{_("event_calendar")}</h1>
  <a class="category-href" class:active-page={page === 0} href="./admin">
    {_("actions")}
  </a>
  <a class="category-href" class:active-page={page === 1} href="./admin/users">
    {_("users")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 2}
    href="./admin/directories">
    {_("handbooks")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 3}
    href="./admin/excursions">
    {_("excursions")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 7}
    href="./admin/tours">
    {_("tours")}
  </a>
  <a class="category-href" class:active-page={page === 4} href="./admin/hotels">
    {_("hotels")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 6}
    href="./admin/selections">
    {_("selections")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 8}
    href="./admin/favorites">
    {_("featured_events")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 9}
    href="./admin/payouts">
    {_("payouts")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 10}
    href="./admin/intersections">
    {_("intersections")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 11}
    href="./admin/sitemap">
    sitemap
  </a>
  <a
    class="category-href"
    class:active-page={page === 12}
    href="./admin/digest">
    {_("digest")}
  </a>
  <div class="bottom">
    <select
      bind:value={secondLanguage}
      on:change={changeLanguage}
      class="language">
      {#each languages as lang}
        <option value={lang.lang}>{lang.lang}</option>
      {/each}
    </select>
    <a href="/" class="exit">
      <img src="/img/exit.png" alt="exit" />
    </a>
  </div>

</div>
