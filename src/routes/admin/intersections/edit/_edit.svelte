<script>
    import AdminPage from "../../_admin_page.svelte";
    import i18n from "/helpers/i18n/index.js";
    import Fetcher from "/helpers/fetcher.js";
    import ClickOutside from "/components/clickOutside.svelte";
    import {
        setFilterData,
        setNewLocationsData,
        setFilterBySlug,
        createSlugByFilter
    } from "/helpers/filter.js";
    import { 
        validateNewData, 
        validateNewtranslateData, 
        setTextTranslation 
    } from "/helpers/edit.js";
    import {goto} from "@sapper/app";
    import Loading from "/components/adminLoadingWindow.svelte";

    export let locale;
    export let startedSlug;
    export let locations;
    export let subjects;
    export let intersectionData;
    export let allIntersections;
    export let description;
    export let slug;
    export let intro;
    export let id;
    export let h1;
    export let title;

    const fetcher = new Fetcher();
    const _ = i18n(locale);

    let locationsButton;
    let locationsVisible = false;
    let locationsOption;

    let subjectsButton;
    let subjectsVisible = false;
    let subjectsOption;

    let save;

    let filter = {};

    let newData = {};

    filter.locations = setNewLocationsData(locations);
    filter.subjects = setFilterData(subjects);

    if(startedSlug)
        filter = setFilterBySlug(filter, startedSlug);

    allIntersections = allIntersections.reduce(
        (cur, { id, description, slug, intro }) => {
            return {
                ...cur,
                [slug]: {id, description, intro}
            }
        },
        {}
    );

    $: {
        slug = createSlugByFilter(filter).replace("/", "");
    }

    $: newData = validateNewData(slug, intersectionData.slug, "slug", newData);

    $: newData = validateNewtranslateData(
        setTextTranslation(description, locale, id),
        intersectionData.description,
        "description",
        newData
    )

    $: newData = validateNewtranslateData(
        setTextTranslation(intro, locale, id),
        intersectionData.intro,
        "intro",
        newData
    )

    $: newData = validateNewtranslateData(
        setTextTranslation(h1, locale, id),
        intersectionData.h1,
        "h1",
        newData
    )

    $: newData = validateNewtranslateData(
        setTextTranslation(title, locale, id),
        intersectionData.title,
        "title",
        newData
    )

    async function saveIntersection(){
        if(slug.length && description.length && title.length && h1.length){
            let find = allIntersections[slug]
            if(find && find.id !== id){
                if(confirm(_("finded_intersection"))){
                    id = find.id;
                    newData.description = setTextTranslation(description, locale, id);
                    newData.intro = setTextTranslation(intro, locale, id);
                    newData.h1 = setTextTranslation(h1, locale, id);
                    newData.title = setTextTranslation(title, locale, id);
                    delete newData.slug;
                }
                else{
                    alert(_("redid_intersection_url"))
                    return;
                }
            }

            let result;

             (newData)
            
            if(id)
                result = await fetcher.put(`/api/filterCrosses/${id}`, newData)
            else
                result = await fetcher.post(`/api/filterCrosses`, newData)

            if(result.ok)
                goto("/admin/intersections")
            else
                alert(result.message)

        }
        else alert(_("required_fields_message"));
    }
</script>

<style lang="scss">
    @import "./styles/admin";

    .slug-block {
        display: flex;
        margin-top: 20px;

        & > *:not(:first-child) {
            margin-left: 20px;
        }
    }

    .head{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .option {
        border: none;
        top: 100%;
        left: 0;
        width: 100%;
        visibility: visible;

        & > div {

            &:not(:first-child){
                padding-top: 5px 0;
            }

            & > label {
                color: #3b394a;
                width: calc(100% - 40px);
            }
        }
    }

    .select{
        background: white;
        border: 1px solid $Gray;
        width: 100%;
        margin: 0;
    }

    .select-block{
        width: 200px;
    }

    .final-slug{
        padding: 5px;
        background: white;
        min-height: 25px;
        width: calc(1050px - 200px * 2 - 20px * 2);
        display: block;
        box-sizing: border-box;
    }

    h2{
        margin-top: 20px;
    }

    textarea{
        margin-top: 10px;
        background: white;
        resize: none;
        width: 100%;
        min-height: 200px;
    }

    input{
        background: white;
        margin-top: 10px;
        width: 100%;
        padding: 5px;
        box-sizing: border-box;
    }

    .secondLocation{
        padding-left: 15px !important;
    }

    .thridLocation{
        padding-left: 30px !important;
    }
</style>

<svelte:head>
    <title>{_("intersections")}</title>
</svelte:head>

<AdminPage {locale} {_} {fetcher} page={10}>
    <div class="head">
        <h1>{_('intersections')}</h1>
        <button class="save" on:click={() => save = saveIntersection()}>{_("save")}</button>
    </div>
    <div class="slug-block">
        <div class="select-block">
            <button
                class="select"
                bind:this={locationsButton}
                on:click={() => {
                    locationsVisible = true;
                }}>
                {_('locations')}
            </button>
            <ClickOutside
                on:clickoutside={() => (locationsVisible = false)}
                exclude={[locationsButton]}>
                {#if locationsVisible}
                    <div class="option" bind:this={locationsOption}>
                        {#each filter.locations as city, i}
                            <div
                                class:secondLocation={city.n1 && !city.n2}
                                class:thridLocation={city.n1 && city.n2}
                                on:click={() => {
                                    city.active = !city.active;
                                }}>
                                <label>{city.value}</label>
                                <input type="checkbox" bind:checked={city.active} />
                            </div>
                        {/each}
                    </div>
                {/if}
            </ClickOutside>
        </div>
        <div class="select-block">
            <button
                class="select"
                bind:this={subjectsButton}
                on:click={() => {
                    subjectsVisible = true;
                }}>
                {_('subjects')}
            </button>
            <ClickOutside
                on:clickoutside={() => (subjectsVisible = false)}
                exclude={[subjectsButton]}>
                {#if subjectsVisible}
                    <div class="option" bind:this={subjectsOption}>
                        {#each filter.subjects as subject, i}
                            <div
                                on:click={() => {
                                    subject.active = !subject.active;
                                }}>
                                <label>{subject.value}</label>
                                <input type="checkbox" bind:checked={subject.active} />
                            </div>
                        {/each}
                    </div>
                {/if}
            </ClickOutside>
        </div>
        <span class="final-slug">{slug}</span>
    </div>
    <h2>title</h2>
    <input type="text" name="title" bind:value={title}/>
    <h2>h1</h2>
    <input type="text" name="h1" bind:value={h1}/>
    <h2>Description</h2>
    <textarea name="description" bind:value={description}/>
    <h2>Intro</h2>
    <textarea name="intro" bind:value={intro}/>
</AdminPage>
<Loading promice={save} message={_("intersection_saving")} />