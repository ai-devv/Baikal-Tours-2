<script>
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import { createEventDispatcher } from "svelte";
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import { parseUrlByPage } from "/helpers/parsers.js";

  export let _, page;

  let email = "",
    password = "",
    disabledLogin = "disabled";
  const dispatch = createEventDispatcher();

  function login() {
    dispatch("login", {
      phoneOrEmail: email,
      password: password
    });
  }

  $: if (email !== "" && password !== "") {
    disabledLogin = "";
  } else disabledLogin = "disabled";
</script>

<style lang="scss">
  @import "./styles/inter.scss";
</style>

<div class="body" transition:fade={{duration: 150}}>
  <div class="register-block">
    <div class="in-block">
      <button class="close-window" on:click={() => goto(parseUrlByPage(page, ["window"], {}))}>
        <img src="/img/cross.svg" alt="cross" />
      </button>
      <h2>{_('authorize')}</h2>

      <div class="input-block">
        <input name="email" type="text" bind:value={email} placeholder="E-mail" />
        <div class="img-block">
          <img src="/img/mail.svg" alt="email" />
        </div>
      </div>

      <div class="input-block">
        <input
          type="password"
          name="password"
          bind:value={password}
          placeholder={_('password')} />
        <div class="img-block">
          <img src="/img/password.svg" alt="password" />
        </div>
      </div>

      <button
        id="login"
        class="blue-button"
        on:click={login}
        disabled={disabledLogin}>
        {_('enter')}
      </button>

      <button
        class="forgot-password"
        on:click={() => dispatch('forgotPassword')}>
        {_('forgot_password')}
      </button>

      <div class="inter">
        {_('not_registered')}
        <button class="blue-text" on:click={() => dispatch('register')}>
          {_('registration')}
        </button>
      </div>
    </div>
  </div>
</div>
