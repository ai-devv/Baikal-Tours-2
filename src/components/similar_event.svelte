<script>
  import dateToString from "/helpers/dateToString.js";
  import { parseDate } from "/helpers/parsers.js";
  import Image from "/components/imageCenter.svelte";

  export let _, favorite;
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .similar-block {
    width: 580px;
    height: 320px;
    position: relative;
    overflow: hidden;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
    border-radius: 10px;
    display: block;

    & * {
      transition: 0.3s;
    }

    & > img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100%;
      min-height: 100%;
      z-index: -1;
    }

    & > div {
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 1;
      color: #34353f;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.6) 100%
      );
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      border-radius: 10px;
      text-align: left;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 35px;
      box-sizing: border-box;

      & > h4 {
        font-size: 24px;
        font-family: $Playfair;
        width: 100%;
        color: white;
      }

      & > ul {
        margin-top: 15px;

        & > li {
          font-size: $LowBig_Font_Size;
          color: $Orange;
          font-weight: 600;

          > time{
            color: inherit;
          }
        }
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .similar-block {
      width: 100%;
      height: 165px;

      > div {
        padding: 10px;
      }
    }

    h4 {
      font-size: $LowBig_Font_Size !important;
    }

    ul {
      margin-top: 5px !important;
    }

    li {
      font-size: $LowMedium_Font_Size !important;
    }
  }
</style>

<a
  class="similar-block"
  href={`/event/${favorite.slug}`}
  itemscope
  itemtype="http://schema.org/Event"
  itemprop="itemListElement">
  {#if favorite.image_url !== null}
    <Image src={favorite.image_url} alt={favorite.name} />
  {/if}
  <div>
    <h4 itemprop="name">{favorite.name}</h4>
    {#if favorite.dates}
      <ul class="dates">
        {#each favorite.dates as date}
          <li>
            <time
              itemprop="startDate"
              datetime={parseDate(new Date(date.date_start ? date.date_start : date.date_end ? date_end : ''))}>
              {dateToString(date, _)}
            </time>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</a>
