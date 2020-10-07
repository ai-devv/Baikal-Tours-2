<script>
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { stores } from "@sapper/app";
  import Register from "./start_register.svelte";
  import ConfirmPassword from "./confirm_password.svelte";
  import { parseUrlByPage } from "/helpers/parsers.js";

  export let _, fetcher, page;

  const { session } = stores();

  let registerStatus;

  $: {
    registerStatus = page.query.window;
  }

  const dispatch = createEventDispatcher();

  async function showConfirmPassword(e) {
    let data = e.detail;
    let result = await fetcher.post("/api/signup?action=start", data);

    if (result.ok) {
      localStorage.setItem("email", data.email);
      dispatch("confirmPassword");
    } else {
      alert(result.replace);
    }
  }

  async function finishRegister(e){

    let data = {
      phoneOrEmail: localStorage.getItem("email"),
      password: e.detail.password
    };

    let result = await fetcher.post("/api/signup?action=confirm", data);

    if (result.ok) {
      localStorage.removeItem("email");

      $session.email = result.data.email;
      $session.name = result.data.name;
      $session.surname = result.data.surname;
      $session.userId = result.data.userId;
      $session.isLogged = true;

      document.location.href = parseUrlByPage(page, ["window"], {});
    } else {
      alert(result.message);
    }
  }
</script>

<style lang="scss">
  @import "./styles/inter";
</style>

{#if (registerStatus === 'register')}
  <Register {_} on:register={showConfirmPassword} {page} on:login/>
{:else if (registerStatus === 'confirm-password')}
  <ConfirmPassword {_} on:confirmPassword={finishRegister} {page} />
{/if}
