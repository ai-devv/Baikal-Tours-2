<script>
  import { createEventDispatcher } from "svelte";
  
  export let result_users, organizer_ids, _, fetcher, id;

  const dispatch = createEventDispatcher();

  let userSearch = "";
  let oldId = id;

  function returnUser(id){
      for(let organizer of organizer_ids)
        if(organizer.id === id && oldId !== id){
            alert(_("added_organizer"));
            return;
        }
      dispatch("changeUser", {
          id
      })

      oldId = id;
  }

  async function searchUser(){
    if(userSearch.length)
        result_users = (await fetcher.get("/api/users", {
          query: { search: userSearch }
        })).data; 
    else
        result_users = (await fetcher.get("/api/users")).data;
  }
</script>

<style lang="scss">
  @import "./styles/colors.scss";

  .users-block{
      position: absolute;
      top: 25px;
      right: 0;
      width: 600px;
      background: white;
      z-index: 2;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      padding: 10px;
      max-height: 600px;
      overflow: auto;
  }

  input{
      width: 100%;
      padding: 5px;
      box-sizing: border-box;
      border: 1px solid $Gray;
  }

  .all-users{
      border-collapse: collapse;
      border: 1px solid $Gray;
      width: 100%;
      margin-top: 10px;
  }

  th, td{
    border: 1px solid $Gray;
    padding: 5px;
  }

  th{
      font-weight: bold;
  }

  .add-user{
      width: 20px;
      height: 20px;
      border: 1px solid $Gray;
      font-size: 14px;
      cursor: pointer;
  }

  .button-column{
      text-align: center;
  }
</style>

<div class="users-block">
  <input type="text" bind:value={userSearch}
    on:blur={searchUser}
    on:keyup={function(e){
        if(e.key === "Enter"){
            this.blur();
        }
    }}
  />
  <table class="all-users">
    <tr>
        <th class="users-head">{_('name')}</th>
        <th class="users-head">{_('surname')}</th>
        <th class="users-head">{_('phone')}</th>
        <th class="users-head">E-mail</th>
        <th class="users-head">{_('role')}</th>
        <th></th>
    </tr>
    {#each result_users as user}
        <tr>
          <td>{user.name}</td>
          <td>{user.surname}</td>
          <td>{user.phone}</td>
          <td>{user.email}</td>
          <td>{_(user.role)}</td>
          <td class="button-column">
            <button class="add-user" on:click={() => returnUser(user.id)}>
                {#if id === user.id}
                    ✓
                {/if}
            </button>
          </td>
        </tr>
    {/each}
  </table>
</div>
