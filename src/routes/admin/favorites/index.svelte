<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let locale = session.locale;

    let subjects = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data.subjects;

    return { subjects, locale };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import Subject from "./_subject.svelte";
  import Main from "./_main.svelte";

  export let locale, subjects;

  const _ = i18n(locale);
  const fetcher = new Fetcher();
</script>

<style lang="scss">
  @import "./styles/admin";

  h1 {
    margin-top: 35px;
    margin-bottom: 25px;
    font-size: $Big_Font_Size;
  }

  .subjects-block {
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    grid-row-gap: 30px;
    margin-top: 50px;
  }
</style>

<svlete:head>
  <title>{_('featured_events')}</title>
</svlete:head>

<AdminPage {_} {fetcher} {locale} page={8}>
  <h1>{_('featured_events')}</h1>
  <div class="subjects-block">
    <Main {_} {fetcher} />
    {#each subjects as subject}
      <Subject {...subject} {_} {fetcher}/>
    {/each}
  </div>
</AdminPage>
