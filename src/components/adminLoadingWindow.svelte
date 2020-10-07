<script>
  import { Circle } from "svelte-loading-spinners"
  export let promice, message;
</script>

<style lang="scss">
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #00000055;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    & > div {
      padding: 20px;
      background: white;
      display: flex;
      align-items: center;

      & > span {
        font-size: 24px;
        margin-right: 30px;
      }
    }
  }
</style>

{#await promice}
  <div class="loading">
    <div>
      <span>{message}</span>
      <Circle size="20" color="#000000" />
    </div>
  </div>
{/await}
