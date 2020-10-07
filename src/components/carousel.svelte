<script>
  import Selection from "/components/selection.svelte";
  import Swiper, { Navigation } from "swiper";
  import { onMount, afterUpdate } from "svelte";

  export let data, carouselData, blockHeight = "auto", mainSlide = 0;
  let swiper = null, hideButtons = false, carouselBlock;

  Swiper.use([Navigation]);

  afterUpdate(() => {
    changeUpdate();
  });

  function changeUpdate(){
    if (swiper !== null) {
      swiper.update();
      swiper.slideTo(mainSlide === 1 ? (carouselData.length < 3 ? 0 : 1) : 0, 750);
    } else swiper = new Swiper(carouselBlock, data);

    hideButtons = carouselData.length < swiper.params.slidesPerGroup
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .swiper-block {
    position: relative;
  }

  .hideButtons{
    visibility: hidden;
  }

  .swiper-button-prev, .swiper-button-next{
    background: #FFFFFF88;
    width: 50px;
    height: 50px;
    border-radius: 100px;
    display: block;
    transition: 0.3s;
    z-index: 1;

    &::after{
      display: none;
    }

    & > .prev{
      transform: rotate(180deg) translate(50%, 50%);;
    }

    & > img{
      width: 30px;
      height: 30px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css">
</svelte:head>

<div class="swiper-block" bind:this={carouselBlock}>
  <div class="swiper-wrapper" style={`height: ${blockHeight}`}>
    <slot />
  </div>
  <div class="swiper-button-prev" class:hideButtons>
    <img src="/img/next.svg" alt="prev" class="prev">
  </div>
  <div class="swiper-button-next" class:hideButtons>
    <img src="/img/next.svg" alt="prev" class="next">
  </div>
</div>
