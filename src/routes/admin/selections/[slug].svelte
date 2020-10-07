<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    let locale = session.locale;

    const fetcher = new Fetcher(this.fetch);

    let compiliationInfo = await fetcher.get(`/api/compiliations/${page.params.slug}`);

    if (compiliationInfo.ok) {
      compiliationInfo = compiliationInfo.data;

      return { locale, compiliationInfo };
    }

    this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import dateToString from "/helpers/dateToString.js";

  export let locale, url, compiliationInfo;

  const _ = i18n(locale);
  const fetcher = new Fetcher();
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .compiliation-block {
    margin-top: 15px;
    background: white;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 15px;
  }

  .edit {
    background: $Medium_Gray;
    border: 1px solid black;
    font-weight: bold;
    padding: 3px 6px;
    height: 26px;
  }

  h1 {
    margin-top: 20px;
  }

  h2 {
    font-style: italic;
    margin-top: 20px;
    font-size: $LowBig_Font_Size;
  }

  .img {
    width: 400px;
    height: 200px;
    margin: 20px auto 0;

    & > img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .info-block {
    margin-top: 20px;
  }

  .line {
    display: flex;
    align-items: flex-start;

    & > img {
      width: 25px;
      margin-right: 15px;
    }

    &:not(:first-child) {
      margin-top: 17px;
    }
  }

  .actions-block {
    margin-top: 20px;
  }

  pre {
    white-space: pre-wrap;
  }

  .action-block {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    & > * {
      width: calc(100% / 2 - 10px);
    }

    & > pre {
      margin-left: 30px;
    }

    &:not(:first-child) {
      margin-top: 10px;
    }
  }

  .action {
    padding: 10px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);

    & > div {
      display: flex;
      align-items: flex-start;
      margin-top: 10px;

      & > span {
        display: block;
        width: calc(100% / 3 - 20px);
      }
    }
  }

  .margin-top {
    margin-top: 20px;
  }
</style>

<svelte:head>
  <title>{compiliationInfo.title}</title>
</svelte:head>

<AdminPage {fetcher} {locale} {_} page={6}>
  <a href="/admin/selections" class="back-page">
    {_('return_to_compiliations')}
  </a>
  <div class="compiliation-block">
    <a class="edit" href="admin/selections/edit?url={compiliationInfo.url}">{_('edit')}</a>
    <h1>{compiliationInfo.name}</h1>
    <h2>{compiliationInfo.tagline}</h2>
    <pre class="margin-top">{compiliationInfo.description}</pre>
    <div class="img">
      <img src={compiliationInfo.image_url} alt={compiliationInfo.name} />
    </div>

    <div class="actions-block">
      {#each compiliationInfo.actions as action}
        <div class="action-block">
          <a class="action" href={`/admin/event/${action.id}`}>
            <h3>{action.name}</h3>
            <div>
              <!-- <span>
                {#each action.subjects as subject}
                  {subject.name}
                  <br />
                {/each}
              </span> -->
              {#if action.locations}
                <span>
                  {#each action.locations as location}
                    {location.name}
                    <br />
                  {/each}
                </span>
              {/if}
              {#if action.dates}
                <span>
                  {#each action.dates as date}
                    {dateToString(date, _)}
                    <br />
                  {/each}
                </span>
              {/if}
            </div>
          </a>
          <pre>{action.description}</pre>
        </div>
      {/each}

      <!-- <div class="info-block">
        <div class="line">
          <img src="img/admin-date.png" alt="date" />
          <div class="info">
            {#if compiliationInfo.dates.length > 0}
              <ul>
                {#each compiliationInfo.dates as date}
                  <li>{dateToString(date, _)}</li>
                {/each}
              </ul>
            {:else}{_('no_data')}{/if}
          </div>
        </div>
      </div> -->
    </div>
  </div>
</AdminPage>
