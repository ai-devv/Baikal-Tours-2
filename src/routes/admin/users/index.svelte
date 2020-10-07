<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let users = (await fetcher.get("/api/users", {
      credentials: "same-origin"
    })).data;

    let locale = session.locale;

    return { users, locale };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";

  export let users, locale;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  let searchText = "",
    usersLength = users.length;

  async function searchUser() {
    users = (await fetcher.get("/api/users", {
      query: { search: searchText }
    })).data;
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  h1 {
    margin-top: 35px;
    margin-bottom: 25px;
    font-size: $Big_Font_Size;
  }

  table {
    background: white;
    border-collapse: collapse;
    border: 1px solid $Gray;
    margin-top: 25px;
    width: 100%;
    text-align: center;

    & > tr:first-child {
      font-weight: bold;
    }
  }

  td {
    border: 1px solid $Gray;
    padding: 5px;
  }
</style>

<svelte:head>
  <title>{_('users')}</title>
</svelte:head>

<AdminPage page={1} {fetcher} {locale} {_}>
  <div>
    <h1>{_('users')} - {usersLength}</h1>

    <input
      type="text"
      placeholder={_('search')}
      class="search-input"
      on:blur={searchUser}
      bind:value={searchText}
      on:keyup={function(e) {
        if (e.key === 'Enter') this.blur();
      }} />

    {#if users.length > 0}
    <table>
      <tr>
        <td />
        <td>{_('name')}</td>
        <td>{_('surname')}</td>
        <td>{_('phone')}</td>
        <td>E-mail</td>
        <td>{_('role')}</td>
      </tr>
      {#each users as user}
        <tr>
          <td>
            <a href={`/admin/users/user?id=${user.id}`}>
              <img src="/img/info.png" alt="info" />
            </a>
          </td>
          <td>{user.name}</td>
          <td>{user.surname}</td>
          <td>{user.phone}</td>
          <td>{user.email}</td>
          <td>{_(user.role)}</td>
        </tr>
      {/each}
    </table>
    {:else}
      <div>{_("users_not_found")}</div>
    {/if}
  </div>
</AdminPage>
