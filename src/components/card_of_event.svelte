<script>
  import { parsePrice, parseDate } from "/helpers/parsers.js";
  import i18n from "/helpers/i18n/index.js";
  import Image from "/components/imageCenter.svelte";
  import dateToString from "/helpers/dateToString.js";

  export let name,
    dates,
    image_url,
    price_min = "",
    price_max = "",
    subjects,
    locations,
    id,
    locale,
    companions = "",
    saveURL = true,
    status = "",
    slug;

  const _ = i18n(locale);

  let second_price = parsePrice(price_min, price_max, _);
</script>

<style lang="scss">
  @import "./styles/global";

  .card {
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 10px;
    width: 380px;
    padding: 40px 0;
    box-sizing: border-box;
    background-color: white;

    &:hover {
      cursor: pointer;
    }

    & > *:not(.image-and-price) {
      padding: 0 40px;
    }
  }

  .priceCurrency{
    display: none;
  }

  h4 {
    font-size: 24px;
    font-family: $Playfair;
    color: #4d5062;
    margin-top: 10px;
  }

  .line {
    display: flex;
    align-items: center;
    margin-top: 20px;

    & > div:not(.img),
    ul {
      margin-left: 30px;
      font-size: $Mini_Font_Size;
      font-size: $LowBig_Font_Size;
      font-family: $Gilroy;
      color: #434343;

      & > li:not(:first-child) {
        margin-top: 5px;
      }
    }

    .img {
      background: $Orange_Gradient;
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.45);
      min-width: 40px;
      max-width: 40px;
      height: 40px;
      position: relative;
      border-radius: 100px;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 20px;
      }
    }
  }

  .image {
    height: 230px;
    overflow: hidden;
    position: relative;
    border-radius: 10px;

    & > img {
      width: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .image-and-price {
    position: relative;
    padding: 0 10px;

    & > .price {
      position: absolute;
      top: 30px;
      left: 0px;
      padding: 5px 16px;
      border-radius: 0px 10px 10px 0px;
      background: linear-gradient(185.86deg, #ffffff 24.24%, #efefef 90.54%);
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.15);
      font-size: 20px;
      color: #434343;
    }
  }

  .date-block {
    margin-top: 10px;
    font-size: $LowBig_Font_Size;
    color: #434343;
  }

  @media only screen and (max-width: 768px) {
    .card {
      width: 100%;

      & > * {
        padding: 0 10px !important;
      }
    }

    .image {
      height: 200px;
    }

    h4 {
      font-size: $LowBig_Font_Size !important;
    }

    * {
      font-size: $LowMedium_Font_Size !important;
    }

    .line {
      & > .img {
        min-width: 20px;
        max-width: 20px;
        height: 20px;
        margin-left: 0 !important;

        & > img {
          width: 14px;
        }
      }

      & > div,
      ul {
        margin-left: 10px !important;
      }
    }
  }
</style>

<a
  itemscope
  itemtype="http://schema.org/Event"
  itemprop="itemListElement"
  class="card swiper-slide"
  href="./event/{slug}"
  >
  <link itemprop="url" href={`./event/${slug}`}>
  <div class="image-and-price">
    <div class="image">
      <Image
        src={image_url === null ? 'img/logo.png' : image_url}
        alt="image of event"
        autoWidth={image_url === null} />
    </div>
    <div
      class="price"
      itemprop="offers"
      itemscope
      itemtype="http://schema.org/Offer">
      <span itemprop="price">{second_price}</span>
      {#if second_price !== _("free")}
        <meta itemprop="priceCurrency" content="RUB"> ₽
      {/if}
    </div>
  </div>
  <h4 itemprop="name">{name}</h4>
  {#if dates && dates.length !== 0}
    <ul class="date-block">
      {#each dates as date}
        <li>
          <time itemprop="startDate" datetime={parseDate(new Date(date.date_start ? date.date_start : (date.date_end ? date_end : "")))}>{dateToString(date, _)}</time>
        </li>
      {/each}
    </ul>
  {/if}
  {#if subjects && subjects.length !== 0 && subjects[0] !== null}
    <div class="line">
      <div class="img">
        <img src="img/star.svg" alt="category" />
      </div>
      <div>
        {subjects.join(", ")}
      </div>
    </div>
  {/if}
  {#if locations && locations.length !== 0 && locations[0] !== null}
    <div class="line">
      <div class="img">
        <img src="img/placeholder.svg" alt="Category" />
      </div>
      <ul>
        {#each locations as location}
          <li>
            <span itemprop="location">{location.name}{location.address ? `, ${location.address}` : ''}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</a>
