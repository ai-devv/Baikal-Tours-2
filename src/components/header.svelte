<script>
  import { stores, goto } from "@sapper/app";
  import Fetcher from "/helpers/fetcher.js";
  import i18n from "/helpers/i18n/index.js";
  import ChangeLanguage from "/components/language_select.svelte";
  import Register from "./register/index.svelte";
  import Login from "./login/index.svelte";
  import { parseUrlByPage } from "/helpers/parsers.js";
  import { slide } from "svelte/transition";
  import { onMount, afterUpdate } from "svelte";
  import Image from "/components/imageCenter.svelte";
  import ClickOutside from "/components/clickOutside.svelte";

  export let locale,
      compiliations = [],
    subjects = [],
    searchText = "",
    transp = false;

  const fetcher = new Fetcher();
  const { session, page } = stores();
  const _ = i18n(locale);

  let showMenu = false,
    menuButton,
    menuBlock,
    showSearch = false;

  let closeMenu;

  async function changeLanguage(e) {
    let lang = e.detail.lang;
    let result = await fetcher.put("/api/locales/" + lang);

    document.location.reload();
  }

  onMount(async () => {
    compiliations = (await fetcher.get("/api/compiliations")).data.splice(0, 6);
    subjects = (await fetcher.get("/api/dataForFilters")).data.subjects;
  });

  function search() {
    if (showSearch){
      if(searchText.length)
        document.location.href = `/events?filter&search=${searchText}`;
      else 
        document.location.href = `/events`;
    }
    else showSearch = true;
  }

  async function restorePassword({detail}){
    let result = await fetcher.get(`/api/restorePassword`, {
      query: {email: detail.email}
    });

    if(result.ok){
      goto(parseUrlByPage($page, ['window'], {
        window: 'login'
      }))
    }
    else alert(result.message)
  }

  async function logout(){

    $session.isLogged = false;
    $session.name = "";
    $session.surname = "";
    $session.email = "";
    $session.userId = 0;
    $session.role = "user";

    const result = await fetch(`/logout`, {
      type: "GET"
    });

    document.location.href = "/";
  }
</script>

<style lang="scss">
  @import "./styles/global";

  header {
    background-color: white;
    padding: 20px 50px;
    box-sizing: border-box;
    position: absolute;
    border-radius: 10px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
  }

  .header-name {
    display: inline-block;

    & > div {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background: linear-gradient(0deg, #f5822a, #f04a30);
      font-weight: 600;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: $LowMedium_Font_Size;
      text-transform: uppercase;

      & > .logo {
        width: 156px;
        margin-left: 15px;
      }
    }
  }

  h2 {
    color: $MaxDark_Gray;
    text-transform: uppercase;
    font-size: $LowBig_Font_Size;
    font-weight: normal;
    font-family: $Gilroy;
    margin-bottom: 10px;
    letter-spacing: 0.1em;
  }

  .line {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-name {
    margin-left: 37px;
    font-size: $Medium_Font_Size;
  }

  .right-side,
  .left-side {
    display: flex;
    align-items: center;
    position: relative;
  }

  a,
  button {
    font-size: $LowBig_Font_Size;
    font-family: $Gilroy;

    &.login,
    &.logout {
      margin-left: 15px;
      background: white;
      border-radius: 100px;
      padding: 15px 45px 15px 30px;
      border: 1px solid $Blue;
      color: $Blue;
      display: flex;
      align-items: center;
      box-sizing: border-box;

      & > img {
        width: 20px;
        height: 20px;
        margin-right: 20px;
      }
    }

    &.logout {
      padding: 15px 45px;
    }

    &.register {
      margin-left: 23px;
      padding: 15px 30px;
      border-radius: 100px;
      background: #117BCD;
      display: flex;
      align-items: center;
      color: white;
      box-sizing: border-box;
      transition: 0.3s;

      &:hover{
        background: #0052B4;
      }

      & > img {
        width: 20px;
        height: 20px;
        margin-right: 20px;
      }
    }
  }

  .language-img {
    margin-left: 5px;
  }

  .my-page {
    font-weight: bold;
  }

  .user-info {
    display: flex;
    align-items: center;
    transition: 0.3s;

    &.showSearch {
      opacity: 0;
      visibility: hidden;
    }
  }

  .language {
    position: absolute;
    right: -100px;
    top: 5px;
    transition: 0.3s;

    &.showSearch {
      opacity: 0;
      visibility: hidden;
    }
  }

  .menu > img {
    width: 30px;
  }

  .navigate-block > button {
    margin-left: 50px;
  }

  .menu-block {
    position: absolute;
    top: 130px;
    left: 50%;
    transform: translateX(-50%);
    width: 1200px;
    padding: 45px 55px;
    background: white;
    z-index: 5;
    box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
      inset 0px 0px 50px rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    box-sizing: border-box;
  }

  .menu-info {
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
  }

  h3 {
    margin-bottom: 30px;
    font-size: $LowBig_Font_Size;
  }

  .categories-block {
    width: 240px;

    & li {
      font-size: $LowBig_Font_Size;
      color: rgba(52, 53, 63, 0.5);

      &:not(:first-child) {
        margin-top: 20px;
      }
    }
  }

  .compiliations-block {
    width: 810px;

    & > ul {
      display: grid;
      justify-content: space-between;
      grid-template-columns: repeat(3, 250px);
      grid-row-gap: 30px;

      & a {
        display: flex;

        & > .img {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          height: 120px;
        }

        & > h4 {
          font-weight: normal;
          font-size: $Medium_Font_Size;
          margin: 0;
          padding-left: 10px;
          color: #34353f;
          box-sizing: border-box;
        }

        & > * {
          flex: 0.5;
        }
      }
    }
  }

  .top,
  .menu-login {
    display: none;
  }

  .search {
    position: relative;
    z-index: 3;
    transition: 0.3s;

    & > img {
      width: 25px;
    }

    &.showSearch {
      margin-right: 80px;
      margin-top: 2px;
    }
  }

  .navigate-block {
    display: flex;
    align-items: center;
  }

  .input-block {
    position: absolute;
    top: 50%;
    right: 130px;
    transform: translateY(-50%);
    width: 0;
    height: 50%;
    background: #f4f4f4;
    z-index: 1;
    border-radius: 100px;
    overflow: hidden;
    transition: 0.3s;
    opacity: 0;

    & > input {
      border-radius: 100%;
      height: 50px;
      padding: 13px 90px 13px 35px;
      width: 100%;
      box-sizing: border-box;
      font-size: 24px;
    }

    & > button {
      position: absolute;
      top: 50%;
      right: -20px;
      transform: translateY(calc(-50% + 2px));
      transition: 0.3s;

      & > img {
        width: 20px;
      }
    }

    &.showSearch {
      width: 745px;
      opacity: 1;

      & > button {
        right: 30px;
      }
    }
  }

  .transp{
    background: rgba(255, 255, 255, 0.7);
  }

  @media only screen and (max-width: 768px) {
    .user-info {
      display: none;
    }

    header {
      padding: 20px 30px !important;
    }

    .page-name {
      margin-left: 0;
    }

    .form-width {
      padding: 20px;
      width: calc(100% - 30px);
    }

    h2 {
      font-size: $LowMedium_Font_Size;
      margin-bottom: 5px;
    }

    .menu > img {
      width: 20px;
    }

    .menu-block {
      position: fixed;
      overflow: auto;
      width: 100%;
      height: 100vh;
      padding: 20px 35px;
      top: 0;
      left: 0;
      border-radius: 0;
      transform: translateX(0);
      box-shadow: none;
    }

    .language {
      display: none;
    }

    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-menu {
      margin-top: 10px;

      & > img {
        width: 20px;
      }
    }

    .blue {
      color: $Blue;

      & > button {
        color: inherit;
        font-size: $Medium_Font_Size;
      }
    }

    .menu-login {
      margin-top: 20px;
      display: block;

      & > .blue {
        margin-top: 20px;
        display: block;
      }
    }

    .menu-info {
      margin-top: 30px;
      grid-template-columns: repeat(1, 100%);
      grid-row-gap: 30px;

      & * {
        font-size: 14px !important;
      }
    }

    h3 {
      margin-bottom: 20px;
    }

    .compiliations {
      grid-template-columns: repeat(1, 100%) !important;
      grid-row-gap: 20px !important;

      & .img {
        display: none;
      }

      & h4 {
        padding-left: 0 !important;
      }
    }

    .compiliations-block {
      width: 100%;
    }

    .categories-block {
      width: 100%;
    }

    .logo {
      width: 121px !important;
      margin-left: 7px !important;
    }

    .header-name,
    .menu {
      transition: 0.3s;

      &.showSearch {
        opacity: 0;
        visibility: hidden;
      }
    }

    .header-name > div {
      font-size: $LowMedium_Font_Size;
    }

    .input-block {
      right: 10px;
      height: 50px;

      &.showSearch {
        width: calc(100% - 20px);
      }

      & > input {
        font-size: $Big_Font_Size;
        padding-left: 20px;
      }

      & > button {
        right: 20px;

        & > img {
          width: 15px;
        }
      }
    }

    .search {
      & > img {
        width: 16px;
      }

      &.showSearch {
        margin-right: 0px;
      }
    }

    .navigate-block > button {
      margin-left: 0;

      &:not(:first-child) {
        margin-left: 30px;
      }
    }
  }
</style>

<svelte:head>
    {#if $page.query.window}
        <style>
            body {
                overflow: hidden;
            }
        </style>
    {/if}
</svelte:head>

<header class="form-width line" class:transp>
  <div class="left-side" class:showSearch>
    <a class="header-name" href="./events">
      <h2>{_('event_calendar')}</h2>
      <div>
        {_('from')}
        <img src="img/logo.png" alt="logo" class="logo" />
      </div>
    </a>
    <div class="language" class:showSearch>
      <ChangeLanguage {locale} on:changeLanguage={changeLanguage} />
    </div>
  </div>
  <div class="right-side">
    <div class="user-info" class:showSearch>
      {#if !$session.isLogged}
        <button
          class="login"
          on:click={() => goto(parseUrlByPage($page, [], { window: 'login' }))}>
          <img src="/img/log-in.svg" alt="login" />
          {_('authorize')}
        </button>
        <button
          class="register"
          on:click={() => goto(parseUrlByPage($page, [], {
                window: 'register'
              }))}>
          <img src="/img/user.svg" alt="user" />
          {_('registration')}
        </button>
      {:else}
        <a href="./profile?section=settings" class="my-page">
          {`${$session.name} ${$session.surname}`}
        </a>
        <button class="logout" on:click={logout}>{_('logout')}</button>
      {/if}
    </div>
    <div class="navigate-block">
      <button class="search" on:click={search} class:showSearch>
        <img src="/img/search.svg" alt="search" />
      </button>
      <button
        class="menu"
        on:click={() => (showMenu = true)}
        bind:this={menuButton}
        class:showSearch>
        <img src="/img/open-menu.svg" alt="menu" />
      </button>
    </div>
  </div>
  <div class="input-block" class:showSearch>
    <input
      type="text"
      bind:value={searchText}
      on:keyup={e => {
        if (e.key === 'Enter') search();
      }} />
    <button class="close" on:click={() => (showSearch = false)}>
      <img src="/img/cross.svg" alt="clear" />
    </button>
  </div>
</header>

<ClickOutside
  on:clickoutside={() => (showMenu = false)}
  exclude={[menuButton, closeMenu]}>
  {#if showMenu}
    <div class="menu-block" transition:slide bind:this={menuBlock}>
      <div class="top">
        <div class="mobile-language">
          <ChangeLanguage {locale} on:changeLanguage={changeLanguage} />
        </div>
        <button class="close-menu" bind:this={closeMenu}>
          <img src="/img/cross.svg" alt="close" />
        </button>
      </div>
      <div class="menu-login">
        {#if !$session.isLogged}
          <div class="blue">
            <button
              on:click={() => {
                goto(parseUrlByPage($page, [], { window: 'login' }));
                showMenu = false;
              }}>
              {_('authorize')}
            </button>
            {' / '}
            <button
              on:click={() => {
                goto(parseUrlByPage($page, [], { window: 'register' }));
                showMenu = false;
              }}>
              {_('registration')}
            </button>
          </div>
        {:else}
          <a href="./profile?section=settings" class="my-page">
            {`${$session.name} ${$session.surname}`}
          </a>
          <br />
          <a class="blue" href="/logout">{_('logout')}</a>
        {/if}
      </div>
      <div class="menu-info">
        <div class="categories-block">
          <h3>{_('category')}</h3>
          <ul class="categories">
            {#each subjects as subject}
              <li>
                <a href={`events/${subject.slug}`}>
                  {subject.name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
        <div class="compiliations-block">
          <h3>{_('selections')}</h3>
          <ul class="compiliations">
            {#each compiliations as compiliation}
              <li>
                <a href={`/selected/${compiliation.url}`}>
                  <div class="img">
                    <Image
                      src={compiliation.image_url}
                      alt={compiliation.name} />
                  </div>
                  <h4>{compiliation.name}</h4>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/if}
</ClickOutside>

<Register
  page={$page}
  {_}
  {fetcher}
  on:confirmPassword={() => goto(parseUrlByPage($page, ['window'], {
        window: 'confirm-password'
      }))}
  on:login={() => goto(parseUrlByPage($page, ['window'], {
        window: 'login'
      }))} />

<Login
  page={$page}
  {_}
  {fetcher}
  on:forgotPassword={() => goto(parseUrlByPage($page, ['window'], {
        window: 'forgot-password'
      }))}
  on:restorePassword={restorePassword}
  on:login={() => goto(parseUrlByPage($page, ['window'], { window: 'login' }))}
  on:register={() => goto(parseUrlByPage($page, ['window'], {
        window: 'register'
      }))} />
