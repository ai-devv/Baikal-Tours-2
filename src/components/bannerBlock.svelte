<script>
    import Image from "/components/imageCenter.svelte";

    export let image_url, name, site, price, isWork = false, _, noFollow = false;
</script>

<style lang="scss">
    @import "./styles/colors.scss";
    @import "./styles/fonts.scss";

  .banner-block {
    position: relative;
    width: 390px;
    height: 250px;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(
      180deg,
      rgba(59, 57, 74, 0) 61.98%,
      #3b394a 100%
    );

    & > :global(img) {
      z-index: -1;
    }

    & > .banner-info {
      position: absolute;
      bottom: 20px;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 25px;
      z-index: 1;
      width: 100%;
      box-sizing: border-box;

      & > * {
        max-width: 50%;
        font-size: 24px;
      }

      & > h4 {
        color: white;
        font-weight: normal;
      }

      & > .price {
        color: $Orange;
      }
    }
  }

  .isWork{
      pointer-events: none;
  }

  @media only screen and (max-width: 768px){
    .banner-block{
      width: 210px;
      height: 140px;
    }

    h4{
      font-size: $LowBig_Font_Size !important;
    }

    .price{
      font-size: $Medium_Font_Size !important;
    }

    .banner-info{
      padding: 0 5px !important;
      bottom: 10px !important;
    }
  }
</style>

<a class="banner-block" href={site} target="_blank" class:isWork rel={noFollow ? "nofollow" : ""}>
  <Image src={image_url} alt={name} />
  <div class="banner-info">
    <h4>{name}</h4>
    {#if price}
      <span class="price">{price}{_('rub')}</span>
    {/if}
  </div>
</a>