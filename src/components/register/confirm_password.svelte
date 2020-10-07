<script>
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import { createEventDispatcher } from "svelte";
  import { parseUrlByPage } from "/helpers/parsers.js";

  export let _, page;

  const dispatch = createEventDispatcher();

  let password = "";
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
      <h2>{_('registration')}</h2>
      <p class="description">{_('sent_mail_message')}</p>
      <div class="inputs-block">
        <div class="input-block">
          <input
            name="password"
            type="password"
            bind:value={password}
            placeholder={_('password')} />
          <div class="img-block">
            <img src="/img/password.svg" alt="password" />
          </div>
        </div>
      </div>
      <button
        class="blue-button"
        disabled={password === '' ? 'disabled' : ''}
        on:click={() => dispatch('confirmPassword', { password })}>
        {_('complete_registration')}
      </button>
    </div>
  </div>
</div>
