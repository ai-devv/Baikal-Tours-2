<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import { isMobile } from "/helpers/validators.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;

    let subjects = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data.subjects;

    let compiliations_result = (await fetcher.get("/api/compiliations", {
      credentials: "same-origin"
    })).data;

    let actions = (await fetcher.get("/api/favorites/main", {
      credentials: "same-origin",
    })).data.slice(0, 3);

    let mobile = isMobile(session["user-agent"]);

    return { locale, subjects, actions, compiliations_result, mobile };
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import Quiz from "/components/quiz.svelte";
  import Selection from "/components/selection.svelte";
  import Card from "/components/card_of_event.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { onMount } from "svelte";
  import ChangeLanguage from "/components/language_select.svelte";
  import Carousel from "/components/carousel.svelte";

  export let locale, subjects, actions, compiliations_result, mobile;

  for(let action of actions)
    action.id = action.action_id;
  
  const fetcher = new Fetcher();
  const _ = i18n(locale);

  let eventsHeight = "auto";
  onMount(() => {
    localStorage.removeItem("actionsParams");

    let maxHeight = 0
    for(let el of document.getElementsByClassName("card")){
      if(el.offsetHeight > maxHeight)
        maxHeight = el.offsetHeight;
    }
          
    eventsHeight = maxHeight;
  });

  async function setLocale(locale) {
    let result = await fetcher.put("/api/locales/" + locale);

    document.location.reload();
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  h1 {
    text-align: center;
    font-size: $Big_Font_Size;
    font-weight: normal;
    margin-top: 45px;
    margin-bottom: 20px;
  }

  .info-block {
    display: flex;
    margin-top: 80px;
    align-items: center;

    & > div {
      flex: 0.5;
    }

    & > .about-calendar {
      padding-right: 200px;
      box-sizing: border-box;

      & > pre {
        white-space: pre-wrap;
        font-family: $Gilroy;
        font-size: 20px;
        margin-top: 25px;
        color: #3b394a;
      }
    }

    & > .video-block {
      height: 400px;
      border-radius: 10px;
      background: $Light_Gray;
    }
  }

  .form-width {
    padding-bottom: 50px;
  }

  .selections-block {
    width: 675px;
    display: flex;
    justify-content: space-between;
    margin: 20px auto 0;
  }

  .selection-carousel {
    margin-top: 70px;
    overflow: hidden;
  }

  .action-carousel {
    margin-top: 75px;
  }

  .top-block {
    height: 800px;
    position: relative;
    overflow: hidden;

    & > img {
      position: absolute;
      top: 50%;
      left: 50%;
      height: 100%;
      transform: translate(-50%, -50%);
      z-index: -1;
    }
  }

  h1 {
    text-align: center;
    font-size: 48px;
    font-family: $Playfair;
    width: 1000px;
    margin: 250px auto 0;
    white-space: pre-wrap;
    font-weight: 900;
    color: #34353f;

    & > span {
      font-family: inherit;
      color: $Blue;
    }
  }

  h3 {
    color: #3b394a;
    font-family: $Playfair;
    font-size: $UltraBig_Font_Size;
    text-align: left;

    & > span,
    > pre {
      color: $Blue;
      font-family: $Playfair;
    }

    pre {
      white-space: pre-wrap;
    }
  }

  .compiliations-block {
    margin-top: 135px;

    & > h3 {
      width: 750px;
    }
  }

  .anticipated-block {
    margin-top: 100px;

    & > h3 {
      width: 570px;
    }
  }

  .translators-block {
    background: #f5f5f5;
    padding: 100px 0 65px;

    & > a {
      display: block;
      width: 380px;
      padding: 15px;
      background: #117BCD;
      border-radius: 100px;
      margin: 65px auto 0;
      text-align: center;
      color: white;
      font-family: $Gilroy;
      font-size: $LowBig_Font_Size;
      transition: 0.3s;

      &:hover{
        background: #0052B4;
      }
    }

    & > .form-width {
      display: flex;
      justify-content: space-between;
      padding: 0;

      & > button {
        width: 380px;
        height: 420px;
        position: relative;
        box-sizing: border-box;
        background-size: 100% 100%;
        border-radius: 10px;
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);

        & > span {
          width: 50%;
          color: white;
          font-size: $Big_Font_Size;
          position: absolute;
          top: 40px;
          left: 40px;
          z-index: 2;
          text-align: left;
        }

        & > .quotes {
          position: absolute;
          top: 60px;
          left: 0;
          z-index: 1;
          opacity: 0.1;
          width: 250px;
          height: 215px;
        }

        & > .language {
          position: absolute;
          bottom: 35px;
          left: 0;
          z-index: 1;
          padding: 15px 25px;
          background: white;
          border-radius: 0 10px 10px 0;

          & > img {
            width: 25px;
            height: 25px;
          }
        }

        &.ru {
          background-image: url(../img/ru-man.png);
        }

        &.us {
          background-image: url(../img/us-man.png);
        }

        &.gr {
          background-image: url(../img/gr-man.png);

          & > span {
            color: black;
          }
        }
      }
    }
  }

  .subscribe-block {
    margin-top: 35px;
    background: #f5f7fa;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 10px;
    padding: 40px 50px;
    width: 600px;
    box-sizing: border-box;

    & > .input-block {
      position: relative;

      & > input {
        background: white;
        padding: 15px 45px 15px 30px;
        border-radius: 100px;
        font-family: $Gilroy;
        width: 100%;
        font-size: $Big_Font_Size;
        box-sizing: border-box;

        &::placeholder {
          color: #c4c4c4;
        }
      }

      & > .mail-img {
        position: absolute;
        top: 10px;
        right: 10px;
        background: $Orange_Gradient;
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
          inset 0px 0px 50px rgba(255, 255, 255, 0.45);
        width: 30px;
        height: 30px;
        border-radius: 100px;

        & > img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 15px;
          height: 20px;
        }
      }
    }

    & > .input-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 30px;

      & > button {
        background: #117BCD;
        border-radius: 100px;
        color: white;
        font-size: $LowBig_Font_Size;
        font-family: $Gilroy;
        width: 200px;
        padding: 15px 0;
        transition: 0.3s;
        position: relative;
        z-index: 3;

        &:hover{
          background: #0052B4;
        }
      }
    }
  }

  .mail-block {
    margin-top: 100px;
    position: relative;
    margin-bottom: 200px;

    & > .lists {
      position: absolute;
      width: 749px;
      height: 768px;
      top: -60px;
      right: 20px;
      z-index: 2;
    }

    & > .back-texts {
      position: absolute;
      top: 200px;
      left: 900px;
      opacity: 0.1;
      z-index: 1;
      display: flex;

      & > p {
        font-family: $Gilroy;
        font-size: 24px;
        width: 300px;

        &:last-child {
          margin-left: 35px;
        }
      }
    }
  }

  .top-text{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 69.79%, rgba(255, 255, 255, 0) 83.33%);
    background-blend-mode: lighten, normal;

  }

  @media only screen and (max-width: 768px) {
    .top-block {
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.6) 69.79%,
        rgba(255, 255, 255, 0) 83.33%
      );
      background-blend-mode: lighten, normal;
      height: 650px;

      & > .top-text > h1{
        color: black;
        margin-top: 180px;
        font-size: 24px;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
      }
    }

    .info-block {
      flex-direction: column;
      margin-top: 60px;

      & > div {
        width: 100%;

        &.about-calendar {
          padding-right: 0;

          & > pre {
            font-size: $Medium_Font_Size;
            margin-top: 10px;
          }
        }

        & > .video-block {
          height: 400px;
          border-radius: 10px;
          background: $Light_Gray;
        }
      }
    }

    h3 {
      font-size: 24px;
    }

    .compiliations-block {
      margin-top: 60px;

      & > h3 {
        width: 100%;
      }
    }

    .anticipated-block {
      margin-top: 60px;

      & > h3 {
        width: 100%;
      }
    }

    .selection-carousel,
    .action-carousel {
      margin-top: 20px;
      overflow: visible;

      & :global(.card) {
        width: calc(100% - 50px) !important;
      }
    }

    .translators-block {
      padding: 30px 0;

      & > .form-width {
        flex-direction: column;
        align-items: center;

        & > button {
          width: 300px;
          height: 333px;

          & > span {
            font-weight: normal;
            font-size: $Medium_Font_Size;
            width: 125px;
            top: 30px;
            left: 20px;
          }

          &:not(:first-child) {
            margin-top: 30px;
          }
        }
      }

      & > a {
        width: calc(100% - 30px);
        margin-top: 30px;
        font-size: $LowBig_Font_Size;
        box-sizing: border-box;
      }
    }

    .mail-block {
      margin-top: 60px;
      margin-bottom: 0;
      padding-bottom: 275px;
      overflow: hidden;

      & > .subscribe-block {
        width: 100%;
        padding: 30px 10px;

        & > .input-line {
          flex-direction: column;
          align-items: flex-start;
          margin-top: 0;

          & > button {
            width: 100%;
          }

          & > * {
            margin-top: 20px;
          }
        }
      }

      & > img {
        z-index: -1 !important;
        left: 60px;
        top: 140px !important;
        width: 466px !important;
        height: 478px !important;
      }

      & > .back-texts {
        left: -30px;
        z-index: -2;
        top: 400px;

        & > p {
          font-size: $Medium_Font_Size;
          width: 180px;
        }
      }
    }

    .all-info {
      overflow: hidden;
    }
  }
</style>

<svelte:head>
  <title>{_('event_calendar')}</title>
  <meta name="description" content="{_('quiz_text')} {_('on_four_clicks')}" />
</svelte:head>

<Header {locale} {mobile} />
<div class="top-block">
  <div class="top-text">
    <h1>
      {_('quiz_text')}
      <span>{_('on_four_clicks')}</span>
    </h1>
  </div>
  <img src="/img/index-top.png" alt={_('main_text')} />
</div>

<div class="form-width">
  <Quiz {_} {subjects} {fetcher} />
</div>

<div class="form-width all-info">
  <!-- <div class="info-block">
    <div class="about-calendar">
      <h3>
        {_('event_calendar')}
        <br />
        <span>{_('on_baikal')}</span>
      </h3>
      <pre>{_('event_calendar_text')}</pre>
    </div>
    <div class="video-block" />
  </div> -->

  {#if compiliations_result.length}
    <div class="compiliations-block">
      <h3>
        {_('events_compiliations')}
        <br />
        <span>{_('events_compiliations_blue')}</span>
      </h3>
      <div class="selection-carousel">
        <Carousel
          data={{ slidesPerView: mobile ? 'auto' : 3, spaceBetween: 15, slidesPerGroup: mobile ? 1 : 3, speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } }}
          carouselData={compiliations_result}>
          {#each compiliations_result as compiliation}
            <Selection
              width={mobile ? 210 : 390}
              height={mobile ? 140 : 200}
              {...compiliation} />
          {/each}
        </Carousel>
      </div>
    </div>
  {/if}

  {#if actions.length}
  <div class="anticipated-block">
    <h3>
      {_('most_anticipated')}
      <br />
      <span>{_('actions')}</span>
    </h3>
    <div class="action-carousel">
      <Carousel
        data={{ slidesPerView: mobile ? 'auto' : 3, spaceBetween: 30, slidesPerGroup: mobile ? 1 : 3, speed: 750, allowTouchMove: mobile ? true : false, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } }}
        carouselData={compiliations_result}
        blockHeight={eventsHeight + "px"}>
        {#each actions as action}
          <Card {...action} {locale} saveUrl={false} />
        {/each}
      </Carousel>
    </div>
  </div>
  {/if}
  
</div>

<div class="translators-block">
  <div class="form-width">
    <button class="ru" on:click={() => setLocale('ru')}>
      <span>
        Привет, я Мария!
        <br />
        <br />
        Каждую зиму мы с подругами берём купальники и едем кататься на лыжах.
        Только представь, сотни людей в купальниках и на лыжах!
      </span>
      <img src="/img/left-quotes-sign.svg" alt="quotes" class="quotes" />
      <div class="language">
        <img src="/img/russia.svg" alt="ru" />
      </div>
    </button>

    <button class="us" on:click={() => setLocale('en')}>
      <span>
        Hi, I’m Bill!
        <br />
        <br />
        last summer I watched the stars on the shore of Lake Baikal It was
        unforgettable!
      </span>
      <img src="/img/left-quotes-sign.svg" alt="quotes" class="quotes" />
      <div class="language">
        <img src="/img/united-states.svg" alt="us" />
      </div>
    </button>

    <button class="gr" on:click={() => setLocale('gr')}>
      <span>
        ich heiße Andrea
        <br />
        <br />
        Einmal habe ich auf dem Eisdes Baikalsees Golf gespielt. Ich möchte
        wirklich wieder dorthin gehen
      </span>
      <img src="/img/left-quotes-sign.svg" alt="quotes" class="quotes" />
      <div class="language">
        <img src="/img/germany.svg" alt="gr" />
      </div>
    </button>
  </div>
  <a href="/events">{_('find_your_adventure')}</a>
</div>

<!-- <div class="form-width mail-block">
  <h3>
    {_('without_internet')}
    <br />
    <pre>{_('neccessary_information')}</pre>
    {_('under_hand')}
  </h3>
  <div class="subscribe-block">
    <div class="input-block">
      <input type="text" placeholder={_('inter_your_email')} />
      <div class="mail-img">
        <img src="/img/mail.svg" alt="mail" />
      </div>
    </div>
    <div class="input-line">
      <div class="language">
        <ChangeLanguage {locale} white={true} />
      </div>
      <button class="send">{_('send')}</button>
    </div>
  </div>
  <img src="/img/lists.png" alt="lists" class="lists" />
  <div class="back-texts">
    <p>
      Где находится информационное бюро? Я транзитный пассажир до Иркутска. Я
      успею сделать пересадку в тот же день? Сколько нужно времени на пересадку?
      Можно мне заказать номер в гостиницу? Где я могу сесть на автобус в город?
    </p>
    <p>
      Where is the tourist information office? I am a transit passenger to
      Irkutsk. Can I make a connection on the same day? How long does it take to
      make a connection? Can I reserve a hotel room here? Where can I catch the
      shuttle bus?
    </p>
  </div>
</div> -->
<Footer {locale} />
