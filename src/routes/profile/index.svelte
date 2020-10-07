<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let locale = session.locale,
      section = page.query.section;

    let userId = session.userId;

    let sections = ["settings", "actions", "organizer"],
      bl = false;
    if (section !== undefined)
      for (let secondSection of sections)
        if (secondSection === section) {
          bl = true;
          break;
        }

    if(!session.isLogged)
      this.redirect(302, "./?redirect=/profile&window=login");

    if (section === undefined || !bl)
      this.redirect(302, "/profile?section=settings");

    let userInfo = (await fetcher.get(`/api/users/${session.userId}`, {
      credentials: "same-origin"
    })).data;

    let subjectsInfo = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data.subjects;

    let reservations = (await fetcher.get(`/api/actionReservations`,{
      credentials: "same-origin",
      query: {userId}
    })).data

    let organizerEvents = (await fetcher.get(`/api/users/${userId}/actionsWhenOrganizer`, {
      credentials: "same-origin"
    })).data;

    let organizerPayouts = (await fetcher.get(`/api/users/${session.userId}/withdraws`, {
      credentials: "same-origin"
    })).data;

    return { locale, section, userInfo, subjectsInfo, reservations, organizerEvents, organizerPayouts};
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import Settings from "./_settings.svelte";
  import Actions from "./_actions.svelte";
  import Organizer from "./_organizer.svelte";
  import { goto } from "@sapper/app";
  import i18n from "/helpers/i18n/index.js";

  export let locale, section, userInfo, subjectsInfo, reservations, organizerEvents, organizerPayouts;

  const _ = i18n( locale );

  function setSection(sectionType) {
    goto(`/profile?section=${sectionType}`);
  }
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  h1 {
    margin-top: 255px;
    font-size: $MaxBig_Font_Size;
    font-family: $Playfair;
  }

  .form-width {
    min-height: calc(100vh - 210px);
    padding-bottom: 30px;
  }

  @media only screen and (max-width: 768px){
    h1{
      margin-top: 160px;
      font-size: 24px;
    }
  }
</style>

<svelte:head>
  <title>{_(section)}</title>
</svelte:head>

<Header {locale} little={true} />
<div class="form-width">
  <h1>{_("personal_account")}</h1>
  <div class="profile-type-block">
    <button
      class:active={section === 'settings'}
      on:click={() => setSection('settings')}
      disabled={section === 'settings'}>
      {_("account_settings")}
    </button>
    <button
      class:active={section === 'actions'}
      on:click={() => setSection('actions')}
      disabled={section === 'actions'}>
      {_("my_events")}
    </button>
    {#if organizerEvents.length}
      <button
        class:active={section === 'organizer'}
        on:click={() => setSection('organizer')}
        disabled={section === 'organizer'}>
        {_("organizer_office")}
      </button>
    {/if}
  </div>

  {#if section === 'settings'}
    <Settings {userInfo} {...userInfo} {subjectsInfo} {_}/>
  {:else if section === 'actions'}
    <Actions {_} {reservations}/>
  {:else if section === 'organizer' && organizerEvents.length}
    <Organizer {_} {organizerEvents} {organizerPayouts}/>
  {/if}
</div>

<Footer {locale} little={true} />
