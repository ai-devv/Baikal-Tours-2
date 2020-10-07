<script context="module">
    import Fetcher from "/helpers/fetcher.js";

    export async function preload(page, session){
        const fetcher = new Fetcher(this.fetch);
        const locale = session.locale;

        let payouts = (await fetcher.get(`/api/withdraws`, {
            credentials: "same-origin"
        })).data;

        return { locale, payouts }
    }
</script>

<script>
    import AdminPage from "../_admin_page.svelte";
    import i18n from "/helpers/i18n/index.js";
    import Payout from "/components/payout.svelte";

    export let locale, payouts;

    const _ = i18n(locale);
    const fetcher = new Fetcher();
</script>

<style lang="scss">
    @import "./styles/global";

    .payouts-block{
        margin-top: 30px;
        display: grid;
        grid-template-columns: repeat(2, 500px);
        grid-row-gap: 20px;
        justify-content: space-between;
    }
</style>

<svelte:head>
  <title>{_("payouts")}</title>
</svelte:head>

<AdminPage {locale} {fetcher} {_} page={9}>
    <h1>{_("payouts")}</h1>
    <div class="payouts-block">
        {#each payouts as payout}
            <Payout {_} {...payout}/>
        {/each}
    </div>
</AdminPage>