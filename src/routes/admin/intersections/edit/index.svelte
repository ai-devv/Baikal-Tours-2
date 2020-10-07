<script context="module">
    import module from "./_module.js";
    import Fetcher from "/helpers/fetcher.js";

    export async function preload(page, session){
        const fetcher =             new Fetcher(this.fetch);
        const intersectionData =    await module(fetcher, page, session);

        if(intersectionData.ok)     return {intersectionData: intersectionData.data}
        else                        this.error(404, "page not found"); 
    }
</script>

<script>
    import Edit from "./_edit.svelte";

    export let intersectionData;
</script>

<style lang="scss">
    @import "./styles/global";

</style>

<Edit {...intersectionData}/>
