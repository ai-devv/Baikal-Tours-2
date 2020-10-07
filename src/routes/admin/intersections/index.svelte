<script context="module">
    import Fetcher from "/helpers/fetcher.js";

    export async function preload(page, session){
        const fetcher = new Fetcher(this.fetch);

        const intersections = (await fetcher.get(`/api/filterCrosses`)).data;

        return {
            intersections,
            locale: session.locale
        };
    }
</script>

<script>
    import AdminPage from "../_admin_page.svelte";
    import i18n from "/helpers/i18n/index.js";
    
    export let intersections;
    export let locale;

    const fetcher = new Fetcher();
    const _ = i18n(locale);

    let findedIntersections;
    let searchValue = "";

    $: findedIntersections = intersections.filter(({slug, description, intro}) => {
        for(let val of [slug, description, intro]){
            if(val.indexOf(searchValue) !== -1)
                return true;
        }
            
        return false;
    })

    async function deleteIntersection(id){
        if(confirm(_("delete_intersection"))){
            const result = await fetcher.delete(`/api/filterCrosses/${id}`);

            if(result.ok)
                for(let i = 0; i < intersections.length; i++)
                    if(intersections[i].id === id){
                        intersections.splice(i, 1);
                        intersections = intersections;
                        break;
                    }
        }
        
    }
</script>

<style lang="scss">
    @import "./styles/admin";

    .head{
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .intersections-list{
        display: grid;
        grid-template-columns: repeat(2, calc(50% - 10px));
        grid-gap: 20px 20px;
        margin-top: 30px;
    }

    .intersections-item{
        display: block;
        padding: 10px;
        background: white;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        box-sizing: border-box;
        position: relative;

        & > span{
            display: block;
        }

        &__line{
            border: none;
            border-top: 1px solid $Gray;
            margin: 10px 0 10px -10px;
            width: calc(100% + 20px);
        }

        &__intro{
            margin-top: 10px;
        }

        &__link{
            display: block;
            width: 150px;
            margin: 10px auto 0;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            padding: 10px;
            text-align: center;
        }

        &__delete-button{
            position: absolute;
            right: 10px;
            top: 10px;

            & > img{
                width: 20px;
            }
        }
    }

    .search{
        margin-top: 10px;
        background: white;
        padding: 10px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        width: 600px;
    }
</style>

<svelte:head>
    <title>{_("intersections")}</title>
</svelte:head>

<AdminPage {locale} {_} {fetcher} page={10}>
    <div class="head">
        <h1>{_("intersections")}</h1>
        <a class="save" href="/admin/intersections/edit">{_("new_intersection")}</a>
    </div>
    <input type="text" class="search" placeholder={_("search")} bind:value={searchValue}>
    <ul class="intersections-list">
        {#each findedIntersections as {slug, description, intro, id}}
            <li class="intersections-item">
                <button class="intersections-item__delete-button" on:click={() => deleteIntersection(id)}><img src="/img/cross.svg" alt="delete"></button>
                <h3 class="intersections-item__slug">{slug}</h3>
                <hr class="intersections-item__line">
                <span class="intersections-item__description">{description}</span>
                {#if intro}
                    <span class="intersections-item__intro">{intro}</span>
                {/if}
                <a href="/admin/intersections/edit/{slug}" class="intersections-item__link">{_("edit")}</a>
            </li>
        {/each}
    </ul>
</AdminPage>