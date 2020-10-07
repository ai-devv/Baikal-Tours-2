<PageLoadingBar {preloading}/>

<!-- {#if !$preloading} -->
    <!-- <main transition:fade> -->
        <slot></slot>
    <!-- </main> -->
<!-- {/if} -->

<script>
    // import { fade } from "svelte/transition"
    import { stores } from "@sapper/app"
    import PageLoadingBar from "sapper-page-loading-bar/PageLoadingBar.svelte"

    const { preloading } = stores()
</script>