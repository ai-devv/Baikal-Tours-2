<script>
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import ClickOutside from "/components/clickOutside.svelte";

  export let locale,
    white = false;

  const dispatch = createEventDispatcher();

  let languages = [
    {
      id: 1,
      lang: "ru"
    },
    {
      id: 2,
      lang: "en"
    },
    {
      id: 3,
      lang: "zh"
    }
  ];

  let secondLanguage = locale;

  let languageBlock,
    languageButton,
    languagesVisible = false;

  function changeLanguage(lang) {
    secondLanguage = lang;
    languages = languages;
    dispatch("changeLanguage", {
      lang
    });
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .language-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: $Gilroy;
    color: rgba(77, 80, 98, 0.5);
    text-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);

    & > img {
      transform: rotate(90deg);
      width: 10px;
      height: 15px;
      transition: 0.3s;
      opacity: 0.4;
    }
  }

  .language {
    text-transform: uppercase;
    width: 45px;
    background: $Light_Gray;
    border-radius: 25px;
    box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
      inset 0px 0px 50px rgba(255, 255, 255, 0.15);
    padding: 10px 15px;
    font-size: $LowBig_Font_Size;
    cursor: pointer;
  }

  .languages-block > button {
    display: block;
    padding: 5px 0;
    font-family: $Gilroy;
    font-size: $LowBig_Font_Size;
    text-transform: uppercase;
    width: 100%;
    text-align: left;
    color: rgba(77, 80, 98, 0.5);
    text-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);

    &:first-child {
      padding: 10px 0 5px;
    }

    &:last-child {
      padding: 5px 0 0;
    }
  }

  .rotate {
    transform: rotate(270deg) !important;
  }

  .language-block {
    width: 75px;
    height: 39px;
    position: relative;
  }

  .white {
    background: white;
  }
</style>

<ClickOutside
  on:clickoutside={() => (languagesVisible = false)}
  exclude={[languageButton]}>
  <div class="language-block">
    <div
      class="language"
      bind:this={languageButton}
      on:click={() => (languagesVisible = true)}
      class:white>
      <div class="language-line">
        {secondLanguage}
        <img src="/img/next.svg" alt="show" class:rotate={languagesVisible} />
      </div>
      {#if languagesVisible}
        <div class="languages-block" bind:this={languageBlock} transition:slide>
          {#each languages as lang}
            {#if lang.lang !== secondLanguage}
              <button on:click={() => changeLanguage(lang.lang)}>
                {lang.lang}
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</ClickOutside>