<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import {
    setFilterData,
    parseFilterDataForAdmin,
    setFilterFromUrl,
    showActiveFilters
  } from "/helpers/filter.js";
  import Image from "/components/imageCenter.svelte";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let locale = session.locale;

    let result_compiliations = (await fetcher.get("api/compiliations", {
      credentials: "same-origin"
    })).data;

    return {
      result_compiliations,
      locale
    };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";

  export let locale, result_compiliations;

  const _ = i18n(locale);
  const fetcher = new Fetcher();
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .head-line {
    display: flex;
    align-items: center;
    margin-top: 20px;
    justify-content: space-between;
  }

  h3 {
    text-align: center;
    margin-top: 30px;
    font-size: $Big_Font_Size;
  }

  .compiliations-block {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(3, 200px);
    justify-content: space-between;
    grid-row-gap: 20px;
  }

  .compiliation-block {
    display: block;
    background: white;
    font-size: $Medium_Font_Size;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    padding: 10px;
  }

  .img{
    height: 200px;
    position: relative;
    overflow: hidden;
  }

  h2{
    font-size: $Big_Font_Size;
    margin-top: 20px;
  }
</style>

<AdminPage page={6} {fetcher} {locale} {_}>
  <div class="head-line">
    <h1>{_('selections')}</h1>
    <a href="/admin/selections/edit" class="new-compilation">
      {_('new_compilation')}
    </a>
  </div>

  <div class="compiliations-block">
    {#if result_compiliations.length > 0}
      {#each result_compiliations as compiliation}
        <a
          href={`/admin/selections/${compiliation.url}`}
          class="compiliation-block">
          <div class="img">
            <Image src={compiliation.image_url} alt={compiliation.name} />
          </div>
          <h2>{compiliation.name}</h2>
        </a>
      {/each}
    {:else}
      <h3>{_('compiliations_not_found')}</h3>
    {/if}
  </div>
</AdminPage>
