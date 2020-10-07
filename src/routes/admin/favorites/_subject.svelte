<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import dateToString from "/helpers/dateToString.js";
  import SortableList from "/components/sortableList.svelte";
  import { onMount } from "svelte";

  export let name, id, _, fetcher;

  let showEvents = false,
    events = [],
    allEvents = [],
    search = "",
    filterEvents = [],
    find = false;

  $: {
    filterEvents = allEvents.filter(el => el.name.indexOf(search) !== -1);
  }

  async function addEvent(eventInfo) {
    let bl = true;
    for (let event of events) {
      if (event.action_id === eventInfo.id) {
        bl = false;
        break;
      }
    }

    if (bl) {
       (123)
      let result = await fetcher.post("/api/favorites", {
        subjectId: id,
        actionId: eventInfo.id
      });
       (result)
      if (result.ok) {
        eventInfo = Object.assign({}, eventInfo);
        eventInfo.action_id = eventInfo.id;
        delete eventInfo.id;
        eventInfo.id = result.data;
        events.push(eventInfo);
        events = events;
        showEvents = false;
      } else alert(_("already_added_event"));
    } 
  }

  async function sortEvents(e) {
    let newEvents = e.detail,
      i = 0;

    for (let event of events) {
      if (event.action_id !== newEvents[i].action_id) {
        let j = 0;
        for (let newEvent of newEvents) {
          if (newEvent.action_id === event.action_id) break;
          j++;
        }
        let result = await fetcher.put(`/api/favorites/${event.id}`, {
          number: j + 1,
          action: "swipe"
        });
        if (result.ok) events = newEvents;
        break;
      }
      i++;
    }
  }

  onMount(getEvents);

  async function getEvents() {
    events = (await fetcher.get("/api/favorites", {
      query: {
        filter: "",
        subjectIds: id,
        allStatuses: ""
      }
    })).data;

    allEvents = (await fetcher.get("/api/actions", {
      query: {
        filter: "",
        subjects: id
      }
    })).actions;

    find = true;
  }

  async function deleteEvent(id, i) {
    let result = await fetcher.delete(`/api/favorites/${id}`);
    if (result.ok) {
      events.splice(i, 1);
      events = events;
    }
  }
</script>

<style lang="scss">
  @import "./styles/admin";

  .add-event {
    padding: 10px;
    border-radius: 10px;
    font-size: $LowBig_Font_Size;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin-top: 40px;
    background: white;
  }

  .events-block {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 3;

    & > button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #00000088;
      z-index: 1;
    }

    & > .all-events-block {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 800px;
      padding: 20px;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      z-index: 2;
      background: white;
      overflow: auto;
    }
  }

  .event-block {
    padding: 20px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    background: white;
    width: 100%;
    box-sizing: border-box;

    & > * {
      text-align: left;
    }

    & > h3 {
      font-size: $LowBig_Font_Size;
      width: 90%;
    }

    & > .event-info {
      display: flex;
      margin-top: 20px;
      justify-content: space-between;
      align-items: flex-start;
    }

    &:not(:first-child) {
      margin-top: 20px;
    }

    ul {
      width: 50%;
    }
  }

  .subject-events-block {
    margin-top: 40px;
    width: 350px;

    & .event-block {
      position: relative;

      & > button {
        position: absolute;
        top: 10px;
        right: 10px;

        & > img {
          width: 15px;
          height: 15px;
        }
      }
    }
  }

  input {
    padding: 5px;
    border: 3px;
    border: 1px solid black;
    font-size: $Medium_Font_Size;
    margin-bottom: 20px;
  }

  .status {
    font-weight: bold;
  }
</style>

<div>
  <h2>{name}</h2>

  <div class="subject-events-block">

    {#if find}
      {#if events.length > 0}
        <SortableList
          list={events}
          key="id"
          on:sort={sortEvents}
          let:item
          let:index>
          <div class="event-block">
            <h3>{item.name}</h3>
            <div class="event-info">
              {#if item.locations}
                <ul>
                  {#each item.locations as location}
                    <li>
                      {location.address ? `${location.name}, ${location.address}` : location.name}
                    </li>
                  {/each}
                </ul>
              {/if}
              {#if item.dates}
                <ul>
                  {#each item.dates as date}
                    <li>{dateToString(date, _)}</li>
                  {/each}
                </ul>
              {/if}
            </div>
            <button class="delete" on:click={() => deleteEvent(item.id, index)}>
              <img src="/img/cross.svg" alt="delete" />
            </button>
          </div>
        </SortableList>
      {:else}
        <h4>{_('no_favorite_events')}</h4>
      {/if}
      {#if events.length < 4}
        <button class="add-event" on:click={() => (showEvents = true)}>
          {_('add_action')}
        </button>
      {/if}
    {:else}
      <span class="status">{_('loading_favorite_events')}</span>
    {/if}

  </div>
</div>

{#if showEvents}
  <div class="events-block">
    <button on:click={() => (showEvents = false)} />
    <div class="all-events-block">
      <input
        type="text"
        placeholder={_('search_by_name')}
        bind:value={search} />
      {#each filterEvents as event}
        <button class="event-block" on:click={() => addEvent(event)}>
          <h3>{event.name}</h3>
          <div class="event-info">
            {#if event.locations}
              <ul>
                {#each event.locations as location}
                  <li>
                    {location.address ? `${location.name}, ${location.address}` : location.name}
                  </li>
                {/each}
              </ul>
            {/if}
            {#if event.dates}
              <ul>
                {#each event.dates as date}
                  <li>{dateToString(date, _)}</li>
                {/each}
              </ul>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}
