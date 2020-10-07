<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;
    let directories = (await fetcher.get("/api/transfers", {
      credentials: "same-origin"
    })).data;

    return { locale, directories };
  }
</script>

<script>
  import i18n from "/helpers/i18n/index.js";
  import AdminPage from "../_admin_page.svelte";
  import { formatStringArrays } from "/helpers/edit.js";
  import Loading from "/components/adminLoadingWindow.svelte";

  export let locale;
  export let directories;

  let newData = [];
  let editData = [];
  let deleteData = [];
  let data;
  let save;
  let directoriesClone = directories.map(el => {
    return Object.assign({}, el);
  });

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  $: {
    data = formatStringArrays(directories, directoriesClone);

    newData = data.create;
    editData = data.edit;
    deleteData = data.delete;
  }

  async function saveDirectories() {
    for (let directory of newData) {
      directory.name.name = directory.name.text;
      delete directory.name.text;

      await fetcher.post(`/api/transfers`, directory.name);
    }

    for (let directory of editData) {
      directory.name.name = directory.name.text;
      delete directory.name.text;

      await fetcher.put(`/api/transfers/${directory.id}`, directory.name);
    }

    for (let directory of deleteData)
      await fetcher.delete(`/api/transfers/${directory}`);

    document.location.href = "/admin/directories";
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  h1 {
    font-size: 24px;
    margin: 0;
  }

  ul {
    margin-top: 20px;

    & > li {
      display: flex;
      align-items: center;

      &:not(:first-child) {
        margin-top: 10px;
      }

      & > input {
        background: white;
        border: 1px solid $Gray;
        padding: 5px;
        width: 300px;
      }

      & > button {
        margin-left: 10px;

        & > img {
          width: 20px;
        }
      }
    }
  }

  .add-directory {
    background: white;
    padding: 10px;
    font-size: $Big_Font_Size;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    margin-top: 20px;
  }

  .header-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>

<svelte:head>
    <title>{_("transfers")}</title>
</svelte:head>

<AdminPage {_} {fetcher} {locale} page={2}>
  <div class="header-line">
    <h1>{_('transfers')}</h1>
    <button class="green-button" on:click={() => save = saveDirectories()}>{_('save_transfers')}</button>
  </div>

  <ul>
    {#each directories as directory, i}
      <li class="line">
        <input type="text" bind:value={directory.name} />
        <button
          on:click={() => {
            directories.splice(i, 1);
            directories = directories;
          }}>
          <img src="/img/cross.svg" alt="delete" />
        </button>
      </li>
    {/each}
  </ul>

  <button
    class="add-directory"
    on:click={() => {
      directories.push({ name: '' });
      directories = directories;
    }}>
    {_('add_transfer')}
  </button>

</AdminPage>

<Loading promice={save} message={_("saving_transfers")}/>