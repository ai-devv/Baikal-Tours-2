<script>
  import Image from "/components/imageCenter.svelte";
  import dateToString from "/helpers/dateToString.js";

  export let name, dates, location, image_url, id, _, slug;
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .card-block {
    position: relative;
    background: linear-gradient(
      270deg,
      rgba(255, 255, 255, 0) 26.95%,
      #ffffff 100%
    );
    border-radius: 10px;
    overflow: hidden;
    width: 100%;

    & > .event-info-block {
      padding: 15px 40% 15px 20px;
      box-sizing: border-box;
      background: linear-gradient(
        90deg,
        white 40%,
        rgba(255, 255, 255, 0) 100%
      );
      position: relative;
      z-index: 2;

      & > *:not(h2) {
        font-size: $Medium_Font_Size;
        margin-top: 5px;
        display: block;
      }

      & > h2 {
        font-size: $LowBig_Font_Size;
        color: #34353f;
        margin: 0;
        font-family: $Playfair;
        margin: 0;
        margin-bottom: 3px;
      }

      & > span {
        color: #3b394a;
      }

      > .event-date{
        li{
          color: #3b394a;
          font-size: $Medium_Font_Size;
        }
      }

      & > a {
        color: $Blue;
        text-decoration: underline;
      }
    }

    .image-block {
      position: absolute;
      height: 100%;
      width: 60%;
      top: 0;
      right: 0;
    }
  }

  @media only screen and (max-width: 768px) {
    .card-block {
      & > .event-info-block {
        padding: 15px 40% 15px 10px;

        & > h2 {
          font-size: $Medium_Font_Size;
        }

        & > span {
          font-size: $Mini_Font_Size;
          margin-top: 8px;
        }

        & > a {
          font-size: $Mini_Font_Size;
          margin-top: 13px;
        }
      }
    }
  }
</style>

<div class="card-block">
  <div class="event-info-block">
    <h2>{name}</h2>
    {#if dates}
      <ul class="event-date">
        {#each dates as date}
          <li>{dateToString(date, _)}</li>
        {/each}
      </ul>
    {/if}
    <span class="event-location">{location}</span>
    <a href="/event/{slug}">{_('detailed')}</a>
  </div>
  {#if image_url}
    <div class="image-block">
      <Image src={image_url} alt={name} />
    </div>
  {/if}
</div>
