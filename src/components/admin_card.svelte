<script>
    import Image from "/components/imageCenter.svelte";
    import { createEventDispatcher } from "svelte";

    export let id, name = "", image_url = "", site = "", price, href = "", _, isChange = false, noEvents = false;

    const dispatch = createEventDispatcher();

    function change(){
        if(isChange)
            dispatch("change", {
                name, image_url, site, price, id
            })
    }
</script>

<style lang="scss">
    @import "./styles/admin.scss";

    .excursion-block{
        padding: 20px;
        box-sizing: border-box;
        width: 225px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        background: white;

        & > *:not(:first-child){
            margin-top: 10px;
        }
    }

    h3{
        font-size: $LowBig_Font_Size;
    }

    .image-block{
        position: relative;
        width: 100%;
        height: 100px;
        overflow: hidden;
    }

    a{
        color: $Blue;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    ul > li:not(:first-child){
        margin-top: 5px;
    }

    .edit{
        margin: 10px auto 0;
        padding: 10px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        width: 125px;
        text-align: center;
    }

    .isChange{
        cursor: pointer;
    }

    .noEvents{
        pointer-events: none;
    }
</style>

<div class="excursion-block" on:click={change} class:isChange>
  <h3>{name}</h3>
  <div class="image-block" class:noEvents>
    <Image src={image_url} alt="test"/>
  </div>
  {#if !noEvents}
    <a href={site}>{site}</a>
  {/if}
  <ul class="locations">
    {#if price}
        <li>{_('price')}: {price}{_('rub')}</li>
    {/if}
  </ul>
  {#if href.length}
    <a {href} class="edit">{_('edit')}</a>
  {/if}
</div>
