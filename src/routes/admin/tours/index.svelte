<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;
    let tours = (await fetcher.get("/api/tours", {
      credentials: "same-origin"
    })).data;

    return { locale, tours };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import Card from "/components/admin_card.svelte";

  export let locale, tours;

  const fetcher = new Fetcher();
  const _ = i18n(locale);
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

  .tours-block {
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-row-gap: 20px;
    justify-content: space-between;
    margin-top: 40px;
  }

  span {
    display: block;
    font-weight: bold;
    font-size: $Big_Font_Size;
    margin-top: 30px;
    text-align: center;
  }
</style>

<svelte:head>
  <title>{_('tours')}</title>
</svelte:head>

<AdminPage {locale} {_} {fetcher} page={7}>
  <div class="head-line">
    <h1>{_('tours')}</h1>
    <a class="green-button" href="/admin/tours/edit">{_('new_tour')}</a>
  </div>
  {#if tours.length > 0}
    <div class="tours-block">
      {#each tours as excursion}
        <Card {...excursion} {_} href="/admin/tours/edit?id={excursion.id}" />
      {/each}
    </div>
  {:else}
    <span>{_('tours_not_found')}</span>
  {/if}
</AdminPage>
