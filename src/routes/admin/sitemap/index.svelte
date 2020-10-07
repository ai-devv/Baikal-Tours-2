<script context="module">
    import Fetcher from "/helpers/fetcher.js";

    export async function preload(page, session){
        const fetcher = new Fetcher(this.fetch);
        const locale = session.locale;

        const sitemap = (await fetcher.get(`/api/sitemap`, {
            credentials: "same-origin"
        })).data || "";

        return {locale, sitemap};
    }
</script>

<script>
    import AdminPage from "../_admin_page.svelte";
    import i18n from "/helpers/i18n/index.js";
    import Loading from "/components/adminLoadingWindow.svelte";

    export let locale;
    export let sitemap;

    const fetcher = new Fetcher();
    const _ =       i18n(locale);

    let message = "";
    let promice;

    async function generate(){
        if(!confirm(_("sitemap_generate_confirm"))) return;

        message = _("sitemap_generation");

        const generateRespopnse = await fetcher.get(`/api/sitemap/generate`);

        if(generateRespopnse.ok){
            sitemap = generateRespopnse.data;
            alert(_("sitemap_generate_success"));
        }
        else alert(generateRespopnse.message)
    }

    async function save(){
        if(!confirm(_("sitemap_saving_confirm"))) return;

        message = _("sitemap_saving");

        const savingResponse = await fetcher.put(`/api/sitemap`, {
            text: sitemap
        });

        if(savingResponse.ok)   alert(_("sitemap_saving_success"));
        else                    alert(savingResponse.message);
    }
</script>

<style lang="scss">
    @import "./styles/admin";

    .head{
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__button{
            background: white;
            padding: 10px;
            box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);

            &:not(:first-child){
                margin-left: 20px;
            }
        }
    }

    .sitemap{
        width: 100%;
        height: 400px;
        resize: none;
        box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
        background: white;
        margin-top: 30px;
    }
</style>

<svelte:head>
    <title>sitemap</title>
</svelte:head>

<AdminPage {_} {locale} {fetcher} page={11}>
    <div class="head">
        <h1 class="head__text">sitemap</h1>
        <div class="head__buttons">
            <button class="head__button" on:click={() => promice = save()}>{_("save")}</button>
            <button class="head__button" on:click={() => promice = generate()}>{_("generate")}</button>
        </div>
    </div>
    <textarea class="sitemap" bind:value={sitemap}/>
</AdminPage>

<Loading {promice} {message} />