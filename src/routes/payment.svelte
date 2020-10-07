<script context="module">
    import Fetcher from "/helpers/fetcher.js";

    export async function preload(page, session){
        const fetcher = new Fetcher(this.fetch);
        const locale = session.locale;
        const code = page.query.orderId

        const payData = await fetcher.get(`/api/payment-check`, {
            credentials: "same-origin",
            query: {
                orderId: code
            }
        })

        if(payData.ok){
            if(payData.data.orderStatus === 0)
                this.redirect(payData.data.formUrl);
            
            return {payData, locale, code}
        }
        
        this.error(404, "page not found");
    }
</script>

<script>
    import Header from "/components/header.svelte";
    import Footer from "/components/footer.svelte";
    import i18n from "/helpers/i18n/index.js";

    export let isPaid;
    export let locale;
    export let payData;
    export let code;

    const fetcher = new Fetcher();
    const _ = i18n(locale);
</script>

<style lang="scss">
    @import "./styles/global.scss";

    .form-width{
        padding-top: 215px;
        min-height: calc(100vh - 240px);
        box-sizing: border-box;

        @media only screen and (max-width: 768px){
            min-height: 100vh;
        }
    }

    .form{
        background: #F5F7FA;        
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
        border-radius: 20px;
        padding: 40px 300px 80px;
        text-align: center;
        box-sizing: border-box;

        @media only screen and (max-width: 768px){
            padding: 35px 10px 45px;
        }
    }

    img{
        width: 90px;
        height: 90px;

        @media only screen and (max-width: 768px){
            width: 50px;
            height: 50px;
        }
    }

    h1{
        font-size: 36px;
        color: #34353F;
        font-family: $Playfair;
        margin-top: 10px;

        @media only screen and (max-width: 768px){
            font-size: 18px;
        }
    }

    p{
        white-space: pre-wrap;
        font-size: $Big_Font_Size;
        color: #434343;
        margin-top: 35px;

        @media only screen and (max-width: 768px){
            font-size: $Medium_Font_Size;
        }

        &.success{
            margin-top: 10px;

            > b{
                display: block;
                margin-top: 10px;
            }

            @media only screen and (max-width: 768px){
                margin-top: 15px;
            }
        }
    }

    a{
        display: block;
        margin: 35px auto 0;
        padding: 15px;
        width: 100%;
        font-size: $LowBig_Font_Size;
        color: white;
        background: #117BCD;
        border-radius: 100px;
        transition: 0.3s;
        width: 250px;
        box-sizing: border-box;

        &:enabled:hover{
          background: #0052B4;
        }

        @media only screen and (max-width: 768px){
            margin-top: 40px;
            width: 100%;
            font-size: $Medium_Font_Size;
        }
    }
</style>

<svelte:head>
    <title>
        {payData.ok && payData.data.orderStatus !== 7 ? _("success_payment") : _("error_payment")}
    </title>
</svelte:head>

<Header {locale} />
<div class="form-width">
    <div class="form">
        {#if payData.ok && payData.data.orderStatus !== 7}
            <img src="/img/success.png" alt="success">
            <h1 class="success-text">{_("success_payment")}</h1>
            <p class="message"><b>{payData.data.name} {payData.data.surname}</b> {_("success_payment_message1")}</p>
            <p class="message success">{_("success_payment_message2")}<br><b>{code}</b></p>
        {:else}
            <img src="/img/error.png" alt="error">
            <h1>{_("error_payment")}</h1>
            <p class="message">{_("error_payment_message")}</p>
        {/if}
        <a href="/events">{_("back_to_main")}</a>
    </div>
</div>
<Footer {locale} />