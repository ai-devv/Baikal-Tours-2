<script>
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import { createEventDispatcher } from "svelte";
  import { parseUrlByPage } from "/helpers/parsers.js";

  export let _, page;

  const dispatch = createEventDispatcher();
  let email = "";

  async function forgotPassword(){
    dispatch("restorePassword", {
      email
    })
  }
</script>

<style lang="scss">
  @import "./styles/inter";
</style>

<div class="body" transition:fade={{duration: 150}}>
  <div class="register-block">
    <div class="in-block">
      <button class="close-window" on:click={() => goto(parseUrlByPage(page, ["window"], {}))}>
        <img src="/img/cross.svg" alt="cross" />
      </button>
      <h2>{_('forgot_password')}</h2>

      <div class="input-block">
        <input name="email" type="text" bind:value={email} placeholder="E-mail" />
        <div class="img-block">
          <img src="/img/mail.svg" alt="email" />
        </div>
      </div>

      <button
        id="login"
        class="blue-button"
        disabled={email === '' ? 'disabled' : ''}
        on:click={forgotPassword}>
        {_('get_new_password')}
      </button>

      <button
        class="blue-text forgot-password"
        on:click={() => dispatch('login')}>
        {_('return_login_page')}
      </button>
    </div>
  </div>
</div>
