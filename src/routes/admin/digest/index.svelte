<script context="module">
    export async function preload(page, session){
        return {locale: session.locale};
    }
</script>

<script>
    import Fetcher from "/helpers/fetcher.js";
    import AdminPage from "../_admin_page.svelte";
    import i18n from "/helpers/i18n/index.js";

    export let locale;

    const fetcher = new Fetcher();
    const _ =       i18n(locale);

    async function updateTime(period){
        if(!confirm(_("confirm_update_digest_time"))) return;

        const updateTimeRequest = await fetcher.get(`/api/updateDigestTimestamp`, {
            query: {period}
        })

        if(updateTimeRequest.ok) alert(_("success_update_digest_time"));
    }
</script>

<style lang="scss">
    @import "./styles/global";

    .buttons-block{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;

        &__button{
            width: 200px;
            background: white;
            padding: 10px;
            box-sizing: border-box;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        }
    }
</style>

<AdminPage {fetcher} {_} {locale} page={12}>
    <h1>{_("update_digest_time")}</h1>
    <div class="buttons-block">
        <button class="buttons-block__button" on:click={() => updateTime("month")}>{_("digest_mounth")}</button>
        <button class="buttons-block__button" on:click={() => updateTime("2months")}>{_("digest_two_mounth")}</button>
        <button class="buttons-block__button" on:click={() => updateTime("halfYear")}>{_("digest_half_a_year")}</button>
    </div>
</AdminPage>