<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import Module from "./_module.js";

  export async function preload(page, session){
    const fetcher = new Fetcher(this.fetch);

    return {data: await Module(fetcher, page, session) }
  }
</script>

<script>
  import Page from "./_page.svelte";

  export let data;

  
</script>

<Page {...data}/>