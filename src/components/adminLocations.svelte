<script>
    import { createEventDispatcher } from "svelte";
    import ClickOutside from "/components/clickOutside.svelte";

    export let allLocations;
    export let changedLocation;

    const dispatch = createEventDispatcher();

    let showLocations = false;
    let locationNameBlock;
    let locationName = "";

    const getLocationName = () => {
        if(changedLocation)
            for (let location of allLocations)
                if (location.id === changedLocation) {
                    locationName = location.name;
                    break;
                }  
        else
            locationName = "";
    };

    const changeNewLocation = location => {
        locationName = location.name;
        dispatch("change", {
            id: location.id
        });
        hideLocationsList();
    };
    const hideLocationsList = () => {
        showLocations = false;
    };

    const showLocationsList = () => {
        showLocations = true;
    };

    getLocationName();
</script>

<style lang="scss">
    @import "./styles/global";

    .locations-block{
        position: relative;
        width: 165px;
        margin-top: 8px;
    }

    .location-name{
        background: white;
        border: 1px solid $Gray;
        padding: 5px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 24px;
        display: block;
        width: 100%;
        text-align: left;

        &::before{
            position: absolute;
            content: " ";
            width: 20px;
            height: 8px;
            top: 50%;
            right: 5px;
            -webkit-transform: translateY(-50%) rotate(90deg);
            transform: translateY(-50%) rotate(90deg);
            background-image: url(../img/next.svg);
            background-size: 100% 100%;
        }
    }

    .locations-list{
        position: absolute;
        background: white;
        width: 100%;
        left: 0;
        top: 26px;
        z-index: 3;
        max-height: 400px;
        overflow: auto;
        border: 1px solid $Gray;

        &__item{
            padding: 5px;
            box-sizing: border-box;

            &.secondLocation{
                padding-left: 15px;
            }

            &.thridLocation{
                padding-left: 30px;
            }

            &:not(:first-child){
                border-bottom: 1px solid $Gray;
            }
        }

        &__button{
            text-align: left;
        }
    }
</style>

<div class="locations-block">
    <button class="location-name" bind:this={locationNameBlock} on:click={showLocationsList}>
        {locationName}
    </button>
    <ClickOutside
        on:clickoutside={hideLocationsList}
        exclude={[locationNameBlock]}
    >
        {#if showLocations}
            <ul class="locations-list">
                {#each allLocations as location}
                    <li class="locations-list__item" 
                        class:secondLocation={location.n1 && !location.n2} 
                        class:thridLocation={location.n1 && location.n2}
                    >
                        <button class="locations-list__button"
                                on:click={() => changeNewLocation(location)} >
                            {location.name}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </ClickOutside>
</div>
