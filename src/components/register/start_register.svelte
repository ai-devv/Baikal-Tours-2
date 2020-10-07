<script>
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import { createEventDispatcher } from "svelte";
  import { validatePhone, validateMail } from "/helpers/validators";
  import { parseUrlByPage } from "/helpers/parsers.js";

  export let _, page;

  const dispatch = createEventDispatcher();
  let disableRegister = "disabled",
    name = "",
    surname = "",
    phone = "",
    email = "";

  $: if (name !== "" && surname !== "" && phone !== "" && validateMail(email)) {
    disableRegister = false;
  } else disableRegister = true;

  function register() {
    dispatch("register", {
      name,
      surname,
      phone,
      email
    });
  }
</script>

<style lang="scss">
  @import "./styles/inter";
</style>

<svelte:window
  on:keydown={e => {
    if (e.key === 'Enter' && disableRegister === '') register();
  }} />

<div class="body" transition:fade={{ duration: 150 }}>
  <div class="register-block">
    <div class="in-block">
      <button class="close-window" on:click={() => goto(parseUrlByPage(page, ["window"], {}))}>
        <img src="/img/cross.svg" alt="cross" />
      </button>
      <h2>{_('registration')}</h2>

      <div class="inputs-block">
        <div class="input-block">
          <input
            type="text"
            bind:value={name}
            placeholder={_('name')}
            name="name" />
          <div class="img-block">
            <img src="/img/user-black.svg" alt="user" />
          </div>
        </div>

        <div class="input-block">
          <input
            type="text"
            bind:value={surname}
            placeholder={_('surname')}
            name="surname" />
          <div class="img-block">
            <img src="/img/user-black.svg" alt="user" />
          </div>
        </div>

        <div class="input-block">
          <input
            name="phone"
            type="text"
            bind:value={phone}
            on:keydown={validatePhone}
            placeholder={_('phone')} />
          <div class="img-block">
            <img src="/img/phone-call.svg" alt="phone" />
          </div>
        </div>

        <div class="input-block">
          <input
            type="text"
            bind:value={email}
            placeholder="email"
            name="email" />
          <div class="img-block">
            <img src="/img/mail.svg" alt="email" />
          </div>
        </div>
      </div>

      <button
        class="blue-button"
        on:click={register}
        disabled={disableRegister}>
        {_('register').toUpperCase()}
      </button>

      <div class="success-text">
        {_('accept')}
        <br />
        <a href="./">{_('of_user_agreement')}</a>
      </div>

      <div class="inter">
        {_('already_registered')}
        <button class="blue-text" on:click={() => dispatch('login')}>
          {_('enter')}
        </button>
      </div>
    </div>
  </div>
</div>
