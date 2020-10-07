<script>
  import i18n from "/helpers/i18n/index.js";

  export let locale;

  const _ = i18n(locale);
</script>

<style lang="scss">
  @import "./styles/global.scss";

  * {
    color: #34353f;
  }

  footer {
    border: solid #e5e5e5;
    border-width: 1px 0 0 0;
    padding: 50px 0;
    box-sizing: border-box;

    & > .form-width {
      box-sizing: border-box;
      display: grid;
      justify-content: space-between;
      justify-items: start;
      grid-row-gap: 15px;
      grid-template-areas:
        "left-block center-block right-block"
        "left-block assign policy";

      & > div {
        font-size: $Big_Font_Size;
      }
    }
  }

  .left-side {
    text-align: right;
    justify-self: end;
    align-self: center;
    grid-area: left-block;

    & > p {
      font-size: $Medium_Font_Size;
      color: rgba(52, 53, 63, 0.7);
      width: 205px;
      margin-top: 10px;
    }
  }

  .center{
    grid-area: center-block;
    color: #34353F;

    > a{
      display: block;

      &:not(:first-child){
        margin-top: 20px;
      }
    }
  }

  .right-side{
    grid-area: right-block;
  }

  .assign{
    grid-area: assign;
  }

  .policy{
    grid-area: policy;
  }

  .logo-images {
    display: grid;
    grid-template-columns: auto auto;
    grid-column-gap: 15px;
    align-items: center;
    justify-content: end;
    margin-top: 10px;
    
    & > span{
      background: linear-gradient(0deg, #f5822a, #f04a30);
      font-weight: 600;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: $LowMedium_Font_Size;
      text-transform: uppercase;
    }

    & > img{
      width: 158px;
    }
  }

  .underline {
    text-decoration: underline;
    display: block;
    font-size: $Big_Font_Size;
    color: rgba(52, 53, 63, 0.5) !important;
    align-self: center;
  }

  .hrefs > a:not(:first-child) {
    display: block;
    margin-top: 20px;
  }

  h6, h5 {
    font-size: $LowBig_Font_Size;
    font-weight: normal;
    color: #4d5062;
  }

  h5{
    letter-spacing: 0.1em;
  }

  .mail {
    margin-top: 20px;
  }

  .info {
    margin-top: 35px;
  }

  h6{
    font-size: $Big_Font_Size;
  }

  @media only screen and (max-width: 768px) {
    .form-width {
      padding: 0 10px !important;
      grid-row-gap: 10px;
      grid-template-areas: "left-block left-block"
                           "center-block right-block"
                           "center-block assign"
                           "center-block policy" !important;
      grid-template-columns: 150px 150px;

      & > div{
        font-size: $LowMedium_Font_Size;
      }
    }

    .left-side{
      justify-self: center;
      text-align: center;
      margin-bottom: 20px;

      & > p{
        font-size: $LowMedium_Font_Size;
        margin-top: 10px;
      }
    }

    .logo-images{
      justify-content: center;
    }

    .underline{
      font-size: $Mini_Font_Size;
    }

    .download{
      padding: 12px 25px;
      font-size: $Medium_Font_Size;
    }

    .info{
      margin-top: 20px;
    }

    .mail{
      margin-top: 10px;
    }

    h6{
      font-size: $LowMedium_Font_Size;
    }

    .center{
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      > a{
        margin-top: 0 !important;
      }
    }
  }
</style>

<footer>
  <div class="form-width">
    <div class="left-side">
      <h5>{_('event_calendar').toUpperCase()}</h5>
      <div class="logo-images">
        <span>{_("from")}</span>
        <img src="img/logo.png" alt="logo.png" />
      </div>
      <p>{_('event_calendar_info')}</p>
    </div>
    <div class="center">
      <a href="./">{_('main')}</a>
      <a href="./events">{_('event_catalog')}</a>
      <a href="./profile">{_('personal_account')}</a>
    </div>
    <div class="right-side">
      <h6>{_('contacts')}</h6>
      <div class="mail">info@baikal.events</div>
    </div>
    <a href="./" class="underline assign">{_('user_agreement')}</a>
    <a href="./" class="underline policy">{_('privacy_policy')}</a>
  </div>
</footer>
