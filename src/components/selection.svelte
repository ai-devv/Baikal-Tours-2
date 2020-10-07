<script>
  import Image from "/components/imageCenter.svelte";

  export let width, height, id, url, image_url, name;
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .selection-block {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: inset 0px -75px 100px -13px rgba(0, 0, 0, 1);
    position: relative;
    display: block;

    > :global(img){
      z-index: -1 !important;
    }
  }

  p {
    color: white;
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 1;
    font-size: 24px;
    font-family: $Gilroy;
  }

  @media only screen and (max-width: 768px){
    p{
      font-size: $Medium_Font_Size;
    }
  }
</style>

<a
  class="selection-block swiper-slide"
  style="width: {width}px; height: {height}px;"
  href={`/selected/${url}`}>
  <p>{name}</p>
  <Image src={image_url} alt={name} />
</a>
