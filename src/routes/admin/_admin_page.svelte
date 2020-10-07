<script>
  import HrefMenu from "./_href_menu.svelte";

  export let page, fetcher, _, locale;
</script>

<style lang="scss">
  @import "./styles/admin.scss";
</style>

<div class="admin-block">
  <div class="form-width">
    <HrefMenu {page} {fetcher} {_} {locale}/>
    <div class="admin-page">
      <slot />
    </div>
  </div>
</div>
