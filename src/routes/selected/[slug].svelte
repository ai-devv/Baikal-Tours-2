<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    let locale = session.locale;

    const fetcher = new Fetcher(this.fetch);

    let compiliation_result = await fetcher.get(
      `/api/compiliations/${page.params.slug}`,
      {
        credentials: "same-origin"
      }
    );

    if (compiliation_result.ok) {
      compiliation_result = compiliation_result.data;
      return { locale, compiliation_result };
    }

    this.error(404, "page not found");
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { onMount } from "svelte";
  import dateToString from "/helpers/dateToString.js";
  import { parsePrice } from "/helpers/parsers.js";
  import Image from "/components/imageCenter.svelte";

  export let locale, compiliation_result;

  const _ = i18n(locale);

  let vkHref = "",
    facebookHref = "",
    twitterHref = "",
    start = false,
    isVkLoad = false;

  onMount(() => {
    start = true;
    if (isVkLoad) startVk();

    twitterHref = encodeURI("compilation" + "\n\n" + document.location.href);
    facebookHref = document.location.href;
  });

  function vkLoad() {
    isVkLoad = true;
    if (start) startVk();
  }

  function startVk() {
    vkHref = VK.Share.button(false, {
      type: "custom",
      text: '<img src="/img/vk-grey.svg"/>'
    });
  }
  
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .main-block {
    height: 700px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(360deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
    background-blend-mode: lighten, normal;

    & > :global(img) {
      z-index: -1;
    }
  }

  h1 {
    color: white;
    font-size: $MaxBig_Font_Size;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    font-family: $Playfair;
    padding-right: 45%;
    box-sizing: border-box;
  }

  .share {
    display: flex;
    align-items: center;
    font-family: $Playfair;
    font-size: $Big_Font_Size;
    font-weight: bold;

    & :global(img) {
      margin-left: 20px;
      height: 20px;
    }

    & :global(img:first-child) {
      margin-left: 30px;
    }
  }

  .line {
    display: flex;
    margin-top: 100px;
    justify-content: space-between;
    align-items: center;
  }

  .center-date {
    align-items: center;
  }

  .main-date {
    display: flex;
    font-size: $LowBig_Font_Size;

    & > .mini-image-block {
      margin-right: 30px;
      width: 30px;
      height: 30px;
      background: $Orange_Gradient;
      border-radius: 100px;
      position: relative;
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.45);

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
      }
    }
  }

  h2 {
    font-size: 36px;
    margin-top: 75px;
    width: 75%;
    font-family: $Playfair;
  }

  .description {
    font-size: 20px;
    margin-top: 30px;
    white-space: pre-wrap;
    width: 75%;
  }

  .events-block {
    margin-bottom: 115px;
    & > .event-block:nth-child(2n) {
      & > .img-block {
        order: 1;
      }

      & > .event-info {
        order: 0;
      }
    }

    & > .event-block {
      display: flex;
      margin-top: 100px;
      justify-content: space-between;

      & > .img-block {
        position: relative;
        overflow: hidden;
        height: 570px;
        width: 570px;

        & > img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          min-width: 100%;
          min-height: 100%;
        }
      }

      & > .event-info {
        box-sizing: border-box;
        position: relative;
        padding-bottom: 60px;
        width: 570px;

        & > *:not(a) {
          margin-top: 25px;
          color: #434343;
        }

        & > ul {
          font-size: $Big_Font_Size;
          margin-top: 15px;

          & > li:not(:first-child) {
            margin-top: 5px;
          }
        }

        .price {
          display: block;
          font-size: 20px;
          color: $Blue;
        }

        & > h3 {
          font-size: 36px;
          margin: 0;
          font-family: $Playfair;
        }

        & > .action-description {
          white-space: pre-wrap;
        }

        & > a {
          position: absolute;
          bottom: 0;
          left: 0;
          background: $Blue_Gradient;
          box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
            inset 0px 0px 50px rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          color: white;
          padding: 15px 0;
          width: 250px;
          font-size: $Big_Font_Size;
          text-transform: uppercase;
          text-align: center;
        }
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .main-block {
      height: 400px;

      & > h1 {
        font-size: 24px;
      }
    }

    .share {
      font-size: $Medium_Font_Size;

      & :global(img) {
        margin-left: 20px;
        height: 15px;
      }
    }

    .line {
      flex-direction: column;
      margin-top: 30px;
      align-items: flex-start;
      justify-content: flex-start;

      & > .main-date {
        margin-top: 15px;

        & li {
          font-size: $LowMedium_Font_Size;
        }

        & > .mini-image-block {
          width: 25px;
          height: 25px;

          & > img {
            width: 16px;
          }
        }
      }
    }

    h2 {
      margin-top: 35px;
      width: 100%;
      font-size: $Big_Font_Size;
    }

    .description {
      width: 100%;
      font-size: $Medium_Font_Size;
      margin-top: 10px;
    }

    .event-block {
      flex-direction: column;
      justify-content: flex-start;

      & > .img-block {
        order: 0 !important;
        min-width: 100%;
        max-width: 100%;
        height: 290px !important;
      }

      & > .event-info {
        min-width: 100%;
        max-width: 100%;
        margin-top: 20px;
        padding-bottom: 0 !important;

        & > a{
          position: relative;
          width: 100%;
          margin-top: 20px;
          top: 0;
          left: 0;
          display: block;
        }
      }

      & h3 {
        font-size: $Big_Font_Size;
      }

      & ul {
        margin-top: 20px;
      }

      & .price,
      .action-description {
        margin-top: 30px !important;
      }

      & * {
        font-size: $Medium_Font_Size !important;
      }
    }
  }
</style>

<svelte:head>
  <title>{compiliation_result.title}</title>

  <script
    type="text/javascript"
    src="https://vk.com/js/api/share.js?95"
    charset="windows-1251"
    on:load={vkLoad}>
  </script>

  <meta name="description" content={compiliation_result.tagline}>
</svelte:head>

<Header {locale} transp={true}/>

<div class="main-block">
  <Image src={compiliation_result.image_url} alt="test" />
  <h1 class="form-width">{compiliation_result.name}</h1>
</div>

<div class="form-width">
  <div class="line">
    <div class="share">
      {_('share')}
      <a
        class="twitter-share-button"
        href="https://twitter.com/intent/tweet?text={twitterHref}"
        target="_blank">
        <img src="/img/twitter-grey.svg" alt="twitter" />
      </a>
      <a
        href="https://www.facebook.com/sharer/sharer.php?u={facebookHref}"
        target="_blank">
        <img src="/img/facebook-grey.svg" alt="facebook" />
      </a>
      {@html vkHref}
    </div>
  </div>
  <h2>{compiliation_result.tagline}</h2>
  <div class="description">{compiliation_result.description}</div>

  <div class="events-block">
    {#each compiliation_result.actions as action}
      <div class="event-block">
        <div class="img-block">
          <Image
            src={action.image_url ? action.image_url : '/img/logo.png'}
            alt="test"
            autoWidth={action.image_url === null}/>
        </div>
        <div class="event-info">
          <h3>{action.name}</h3>
          <ul>
            {#if action.locations}
              {#each action.locations as location, i}
                <li>
                  {location.name}
                  {#if i != action.locations.length - 1}{'; '}{/if}
                </li>
              {/each}
            {/if}
            {#if action.dates}
              {#each action.dates as date, i}
                <li>
                  {dateToString(date, _)}
                  {#if i != action.dates.length - 1}{'; '}{/if}
                </li>
              {/each}
            {/if}
          </ul>
          <b class="price">
            {parsePrice(action.price_min, action.price_max, _)}
          </b>
          <div class="action-description">{action.description}</div>
          <a href={`/event/${action.slug}`}>{_('detailed')}</a>
        </div>
      </div>
    {/each}
  </div>
</div>
<Footer {locale} />
