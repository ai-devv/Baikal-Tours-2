<script>
    import Fetcher from "/helpers/fetcher.js";
    import { onMount } from "svelte";

    export let header;
    export let userName;

    const fetcher = new Fetcher();

    let getCards = null;

    let cards;

    $: {
        userName;

        if(getCards)
            setCards();
    }

    async function setCards(){
        cards = null;

        const cardsResponse = await getCards();

        if(cardsResponse.ok) cards = cardsResponse.data;
    }

    onMount(() => {

        if(!getCards)
            getCards = async () => await fetcher.get(`/api/getInstagramProfileMedia/${userName}`);
        
    })

</script>

<style lang="scss">
    @import "./styles/global";

    .instablock{
        
        &__header{
            font-size: 24px;
            margin-bottom: 20px;

            @media only screen and (max-width: 768px){
                font-size: $Big_Font_Size;
            }
        }

        &__list{
            display: grid;
            grid-template-columns: repeat(4, 250px);
            grid-gap: 20px;

            @media only screen and (max-width: 768px){
                grid-template-columns: repeat(2, 130px);
                grid-gap: 10px;
                justify-content: center;
            }
        }
    }

    .instacard{
        display: block;

        &__image{
            object-fit: cover;
            object-position: center;
            width: 250px;
            height: 250px;

            @media only screen and (max-width: 768px){
                width: 130px;
                height: 130px;
            }
        }
    }
</style>

{#if cards}
    <div class="instablock">
        {#if header}
            <h2 class="instablock__header">{header}</h2>
        {/if}
        <ul class="instablock__list">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            {#each cards as {display_url, shortcode}}
                <li class="instablock__item">
                    <a href="https://instagram.com/p/{shortcode}" class="instacard" target="_blank">
                        <img src="{display_url}" alt="instagram image" class="instacard__image">
                    </a>
                </li>
            {/each}
        </ul>
    </div>
{/if}