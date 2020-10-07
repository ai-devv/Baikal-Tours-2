<script>
  import Action from "/components/profile_event_card.svelte";

  export let _, reservations;

  let section = "next";

  let secondActions = [],
    oldActions = [];

  for (let action of reservations){
    let actionDate = null;
    if(action.date){
      actionDate = new Date(action.date)
    }

     (actionDate)
      
    if (
      actionDate &&
      actionDate < new Date()
    )
      oldActions.push(action);
    else secondActions.push(action);
  }
    

  function setSection(sectionType) {
    section = sectionType;
  }
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  .action-type-block {
    border: none;
    justify-content: space-around;
    padding: 15px 0 0 0;
  }

  .not-found{
      margin-top: 40px;
      text-align: center;
  }
</style>

<div>
  <div class="action-type-block">
    <button
      class:active={section === 'next'}
      on:click={() => setSection('next')}
      disabled={section === 'next'}>
      {_("next_events")}
    </button>
    <button
      class:active={section === 'prev'}
      on:click={() => setSection('prev')}
      disabled={section === 'prev'}>
      {_("prev_events")}
    </button>
  </div>
  {#if section === 'next'}
    {#if secondActions.length !== 0}
      {#each secondActions as action, i}
        <Action {...action} {_} on:canselReservation={() => {secondActions.splice(i, 1); secondActions = secondActions;}}/>
      {/each}
    {:else}
      <h2 class="not-found">{_("next_events_not_found")}</h2>
    {/if}
  {:else if section === 'prev'}
    {#if oldActions.length !== 0}
      {#each oldActions as action}
        <Action {...action} {_} prev={true}/>
      {/each}
    {:else}
      <h2 class="not-found">{_("prev_events_not_found")}</h2>
    {/if}
  {/if}
</div>
