<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;

    let result_directories = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data;

    let locations = (await fetcher.get("/api/locations2", {
      credentials: "same-origin"
    })).data;

    return { locale, result_directories, locations };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";

  export let locale, result_directories, locations;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

</script>

<style lang="scss">
  @import "./styles/admin.scss";

  h1 {
    margin-top: 35px;
    margin-bottom: 25px;
    font-size: $Big_Font_Size;
  }

  .directories-line {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    & > div {
      width: 250px;
      background: white;
      box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    }
  }

  .directory-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 10px 10px 20px;
    border: solid $Light_Gray;
    border-width: 0 0 1px 0;

    & > h2 {
      font-size: $Medium_Font_Size;
    }
  }

  .directory-info{
      padding: 10px 10px 10px 20px;
  }

  .transfers-block, .subjects-block{
      font-weight: bold;
  }

  .second-level {
    margin-left: 15px;
    font-weight: 600;
  }

  .thrid-level{
    margin-left: 30px;
  }

  .first-level{
    font-weight: bold;
  }
</style>

<svelte:head>
  <title>{_("handbooks")}</title>
</svelte:head>

<AdminPage page={2} {fetcher} {_} {locale}>
  <h1>{_("handbooks")}</h1>
  <div class="directories-line">

    <div class="directory">
      <div class="directory-header">
        <h2>{_("locations")}</h2>
        <a href="admin/directories/locations">
          <img src="/img/edit_green.png" alt="edit" />
        </a>
      </div>
      <div class="directory-info">
        <ul class="location-block">
          {#each locations as location}
            {#if location.n1 && !location.n2}
              <li class="second-level">{location.name}</li>
            {:else if location.n1 && location.n2}
              <li class="thrid-level">{location.name}</li>
            {:else}
              <li class="first-level">{location.name}</li>
            {/if}
          {/each}
        </ul>
      </div>
    </div>

    <div class="directory">
      <div class="directory-header">
        <h2>{_("subjects")}</h2>
        <a href="./admin/directories/subjects">
          <img src="/img/edit_green.png" alt="edit" />
        </a>
      </div>
      <div class="directory-info">
        <ul class="subjects-block">
          {#each result_directories.subjects as subject}
            <li>{subject.name}</li>
          {/each}
        </ul>
      </div>
    </div>
    
    <div class="directory">
      <div class="directory-header">
        <h2>{_("transfers")}</h2>
        <a href="/admin/directories/transfers">
          <img src="/img/edit_green.png" alt="edit" />
        </a>
      </div>
      <div class="directory-info">
        <ul class="transfers-block">
          {#each result_directories.transfers as transfer}
            <li>{transfer.name}</li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</AdminPage>