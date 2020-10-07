<script>
    import { fade } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    export let _;
    export let header =             _("header");
    export let message =            _("message");
    export let firstButtonText =    _("yes");
    export let secondButtonText =   _("cansel");
    export let type =               "success";
    export let closable =           true;
    export let showWindow =         false;

    const dispatch = createEventDispatcher();

    function close(){
        dispatch("close");
    }

    function firstClick(){
        dispatch("firstClick");
    }

    function secondClick(){
        dispatch("secondClick")
    }
</script>

<style lang="scss">
    @import "./styles/global";

    .window{
        position: fixed;
        width: 100%;
        height: 100vh;
        z-index: 20;
        top: 0;
        left: 0;
        background: #00000088;

        &__back{
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0.5;
            z-index: 1;
        }

        &__modal{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 45px 75px;
            background: #F5F7FA;
            box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
            border-radius: 10px;
            z-index: 2;
            width: 550px;

            @media screen and (max-width: 768px){
                padding: 20px 20px;
                width: calc(100% - 20px);
            }
        }

        &__header{
            text-align: center;
            font-weight: bold;
            font-size: 30px;
            color: $MaxDark_Gray;
        }

        &__message{
            display: block;
            margin-top: 20px;
            font-size: $Big_Font_Size;
            color: $MaxDark_Gray;
            text-align: center;
        }

        &__buttons{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 40px;

            & > button{
                width: calc(50% - 20px);
                border-radius: 100px;
                border: 1px solid $Dark_Blue;
                box-sizing: border-box;
                box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.15);
                text-align: center;
                padding: 15px;
                font-size: $Medium_Font_Size;
            }
        }

        &__second-button{
            background: #F5F7FA;
            color: $Dark_Blue;
        }

        &__first-button{
            background: $Dark_Blue;
            color: #F5F7FA;

            &_full-width{
                width: 100%;
            }
        }

        &__close{
            position: absolute;
            right: -15px;
            top: -15px;
            background: #F5F7FA;
            width: 30px;
            height: 30px;
            border-radius: 100px;

            & > img{
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 15px;
            }
        }
    }
</style>

<svelte:head>
    {#if showWindow}
        <style>
            body {
                overflow: hidden;
            }
        </style>
    {/if}
</svelte:head>

{#if showWindow}
    <div class="window" transition:fade>
        {#if closable}
            <button class="window__back" on:click={close}/>
        {/if}
        <div class="window__modal">
            <h5 class="window__header">{header}</h5>
            <span class="window__message">{message}</span>
            <div class="window__buttons">
                {#if type === "success"}
                    <button class="window__first-button" on:click={firstClick}>{firstButtonText}</button>
                    <button class="window__second-button" on:click={secondClick}>{secondButtonText}</button>
                {:else}
                    <button class="window__first-button window__first-button_full-width" on:click={firstClick}>{firstButtonText}</button>
                {/if}
            </div>
            {#if closable}
                <button class="window__close" on:click={close}> <img src="/img/cross.svg" alt="close"> </button>
            {/if}
        </div>
    </div>
{/if}