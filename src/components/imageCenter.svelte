<script>
  import { afterUpdate } from "svelte";

  export let src,
    alt,
    autoWidth = false;

  let vertical = false;
  let image;
  let start;

  afterUpdate(() => {
    if (src !== null) {
      let width = image.parentElement.clientWidth;
      let height = image.parentElement.clientHeight;

      let img = new Image();

      img.onload = function() {
        if (this.width / width < this.height / height) vertical = true;
        else vertical = false;
        start = true;
      };

      img.src = src;
    } else start = true;
  });
</script>

<style lang="scss">
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    width: auto;
    transition: 0.3s;
    opacity: 0;
  }

  .vertical {
    width: 100%;
    height: auto;
  }

  .autoWidth {
    width: 100% !important;
    height: auto !important;
  }

  .start {
    opacity: 1;
  }
</style>

<img
  {src}
  {alt}
  class:vertical
  bind:this={image}
  class:autoWidth
  class:start
  itemprop="image"/>
