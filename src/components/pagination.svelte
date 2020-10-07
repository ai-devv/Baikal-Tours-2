<script>
  import { createEventDispatcher } from "svelte";
  export let pagData;

  let pag, allPags;

  const dispatch = createEventDispatcher();
  let pagList = [];

  $: {
    pag = pagData.pag;
    allPags = pagData.allPags;

    changePag(pag);
  }

  function changePag(pagL) {
    pag = pagL;
    pagList = [];
    if (allPags <= 5) for (let i = 0; i < allPags; i++) pagList.push(i);
    else {
      if (pag < 2) for (let i = 0; i < 5; i++) pagList.push(i);
      else if (pag > allPags - 3)
        for (let i = allPags - 5; i < allPags; i++) pagList.push(i);
      else for (let i = pag; i < pag + 5; i++) pagList.push(i - 2);
    }
  }

  function pagClick(pagL) {
    dispatch("clickPag", {
      pagL: pagL
    });
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .active-pag {
    color: lightseagreen;
  }

  .pag-block > button {
    margin-right: 5px;
  }

  .pag-block{
    margin-top: 10px;
  }
</style>

{#if allPags !== 1}
  <div class="pag-block">
    {#if pag > 0}
      <button on:click={() => pagClick(pag - 1)}>←</button>
    {/if}
    {#if pag > 2 && allPags > 5}
      <button on:click={() => pagClick(0)} class:active-pag={pag === 0}>
        1
      </button>
      {#if pag > 3}
        <span>...</span>
      {/if}
    {/if}
    {#each pagList as pagL}
      <button on:click={() => pagClick(pagL)} class:active-pag={pag === pagL}>
        {pagL + 1}
      </button>
    {/each}
    {#if pag < allPags - 3 && allPags > 5}
      {#if pag < allPags - 4}
        <span>...</span>
      {/if}
      <button
        on:click={() => pagClick(allPags - 1)}
        class:active-pag={pag === allPags - 1}>
        {allPags}
      </button>
    {/if}
    {#if pag < allPags - 1}
      <button on:click={() => pagClick(pag + 1)}>→</button>
    {/if}
  </div>
{/if}