<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    const userId = page.query.id;
    const locale = session.locale;

    let result_user = await fetcher.get(`/api/users/${userId}`, {
      credentials: "same-origin"
    });

    if (result_user.ok) {
      result_user = result_user.data;

      let userEvents = (await fetcher.get(`/api/actionReservations`, {
        credentials: "same-origin",
        query: { userId }
      })).data;

      return { locale, result_user, userEvents };
    }

    this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { parseDate } from "/helpers/parsers.js";

  export let locale, result_user, userEvents;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  async function changeRole() {
    let result = await fetcher.put(`/api/users/${result_user.id}`, {
      role: result_user.role
    });
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .user-block {
    margin-top: 15px;
    background: white;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 15px;

    & > span {
      display: block;
    }

    & > span:not(:first-child) {
      margin-top: 15px;
    }
  }

  select {
    background: $Gray;
  }

  .user-events-block{
    margin-top: 10px;

    & > .event-block{
      background: white;
      padding: 10px;
      box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
      width: 750px;

      &:not(:first-child){
        margin-top: 15px;
      }

      & > *:not(h3){
        margin-top: 10px;
        display: block;
      }

      & > .event-date{
        display: block;
      }

      & > .event-tickets{
        display: flex;
        align-items: flex-start;

        & > div{
          width: 300px;

          &:not(:first-child){
            margin-left: 30px;
          }

          & > ul{
            
            & > li{
              display: flex;

              & > span{
                display: block;

                &:last-child{
                  margin-left: 15px;
                }
              }

              &:not(:first-child){
                margin-top: 5px;
              }
            }
          }
        }
      }
    }
  }

  h2{
    margin: 20px 0;
  }
</style>

<AdminPage {_} {locale} {fetcher} page={1}>
  <h1>{_('user_info')}</h1>
  <div class="user-block">
    <select
      name="userStatus"
      bind:value={result_user.role}
      on:change={changeRole}>
      <option value="admin">{_('admin')}</option>
      <option value="user">{_('user')}</option>
    </select>
    <span>
      <b>{_('name')}:</b>
      {result_user.name}
    </span>
    <span>
      <b>{_('surname')}:</b>
      {result_user.surname}
    </span>
    <span>
      <b>{_('phone')}:</b>
      {result_user.phone}
    </span>
    <span>
      <b>email:</b>
      {result_user.email}
    </span>

    <h2>{_('user_events')}</h2>
    {#if userEvents && userEvents.length}
      <div class="user-events-block">
        {#each userEvents as event}
          <div class="event-block">
            <h3><a href={`/admin/event/${event.slug}`}>{event.name}</a></h3>
            <span class="event-date">{parseDate(new Date(event.date))}</span>
            {#if event.buyable}
              <div class="event-tickets">
                {#if event.buyable.filter(el => el.type === "ticket").length}
                  <div class="tickets">
                    <h4>{_("tickets")}</h4>
                    <ul>
                      {#each event.buyable.filter(el => el.type === "ticket") as ticket}
                        <li>
                          <span>{ticket.name} * {ticket.count}</span>
                          <span>{ticket.count * ticket.price}{_("rub")}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
                {#if event.buyable.filter(el => el.type === "additional").length}
                  <div class="tickets">
                    <h4>{_("short_additional")}</h4>
                    <ul>
                      {#each event.buyable.filter(el => el.type === "additional") as ticket}
                        <li>
                          <span>{ticket.name} * {ticket.count}</span>
                          <span>{ticket.count * ticket.price}{_("rub")}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>
              {#if event.paid}
                <span class="paid-message">{_("event_is_paid")}</span>
              {:else}
                <span class="paid-message">{_("event_is_not_paid")}</span>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</AdminPage>
