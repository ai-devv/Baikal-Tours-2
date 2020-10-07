<script context="module">
    import Fetcher from "/helpers/fetcher.js";
    import module from "../../edit/_module.js";

    export async function preload(page, session) {
        const editData = await module(new Fetcher(this.fetch), page, session);

        if(editData.ok) return {data: editData.data}
        else this.error(404, "page not found");  
    }
</script>

<script>
    import Edit from "../../edit/_edit.svelte";

    export let data;
</script>

<Edit {...data}/>