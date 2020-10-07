<script>
  import { slide } from "svelte/transition";
  import { stores } from "@sapper/app";
  import dateToString from "/helpers/dateToString.js";
  import Fetcher from "/helpers/fetcher.js";

  export let _, organizerEvents, organizerPayouts;
  let hideForm = false,
    hideApplications = false;

  let tickets, additions;

  let allBalance = organizerEvents
    ? organizerEvents.reduce((cur, sec) => cur + sec.balance, 0)
    : 0;

  let recipient = "";
  let bank = "";
  let accountNumber = "";
  let bik = "";
  let inn = "";
  let kpp = "";
  let amount = "";

  const { session } = stores();
  const fetcher = new Fetcher();

  function getCount(ticket, bl) {
    if (ticket.count)
      if (ticket.count[0].paid === bl)
        return `${ticket.count[0].count}${_("piece_short")}`;
      else if (ticket.count[1])
        return `${ticket.count[1].count}${_("piece_short")}`;
      else return "-";
    else return "-";
  }

  function getAmount(ticket) {
    let paids = getCount(ticket, true);

    return paids === "-"
      ? "-"
      : `${paids.replace(/\D+/g, "") * ticket.price}${_("rub")}`;
  }

  function getAllAmount(tickets) {
    if (!tickets) return 0;

    let total = 0;
    for (let ticket of tickets) {
      if (ticket.count)
        for (let paid of ticket.count)
          if (paid.paid) total += paid.count * ticket.price;
    }

    return total;
  }

  async function downloadFile(id) {
    const response = await fetch(
      `/api/actions/${id}/xlsx?userId=${$session.userId}`
    );
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    window.open(url);
  }

  async function sendPayout() {
    let data = [
      {
        value: recipient,
        name: "recipient"
      },
      {
        value: bank,
        name: "recipient_bank"
      },
      {
        value: accountNumber,
        name: "account_number"
      },
      {
        value: bik,
        name: "bik"
      },
      {
        value: inn,
        name: "inn"
      },
      {
        value: kpp,
        name: "kpp"
      },
      {
        value: Number(amount),
        name: "amount"
      }
    ];

    let sendData = {
      recipient,
      bank,
      accountNumber,
      bik,
      inn,
      kpp,
      amount: Number(amount)
    };

    for (let key of data)
      if (!(key.value + "").length) {
        alert(_("required_field_message").replace(/{field}/g, _(key.name)));
        return;
      }

    if (amount > allBalance) {
      alert(_("amount_error"));
      return;
    }

    const payoutResult = await fetcher.post(`/api/withdraws`, {
      userId: $session.userId,
      ...sendData
    });

    if (payoutResult.ok) {
      organizerPayouts.unshift({
        sum: amount,
        status: "process",
        fail_message: null
      });
      organizerPayouts = organizerPayouts;

      organizerEvents = (await fetcher.get(
        `/api/users/${$session.userId}/actionsWhenOrganizer`
      )).data;

      allBalance = organizerEvents
        ? organizerEvents.reduce((cur, sec) => cur + sec.balance, 0)
        : 0;

      recipient = "";
      bank = "";
      accountNumber = "";
      bik = "";
      inn = "";
      kpp = "";
      amount = "";

      alert(_("payout_send_message"));
    } else alert(_("payout_send_error"));
  }
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  * {
    color: #434343;
  }

  .balance-block {
    background: #f5f7fa;
    padding: 100px;
    box-sizing: border-box;
    margin-top: 50px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 10px;
  }

  h2 {
    font-size: 36px;
    color: #34353f;
    font-family: $Playfair;
    margin: 0;
  }

  .balance-info-block {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > div {
      font-size: 36px;
      font-weight: 600;
    }
  }

  .hide {
    margin-top: 25px;
    font-size: $Big_Font_Size;
    display: flex;
    align-items: center;

    &:not(:first-child) {
      margin-top: 90px;
    }

    & > img {
      transform: rotate(90deg);
      width: 15px;
      height: 10px;
      transition: 0.3s;

      &.rotate {
        transform: rotate(270deg);
      }
    }

    & > span {
      margin-right: 10px;
    }
  }

  .payment-block > h3 {
    margin-top: 55px;
    font-family: $Playfair;
    font-size: 24px;
  }

  .payment-block,
  .price-list-block {
    display: flex;
    flex-direction: column;
  }

  input {
    background: white;
    padding: 15px 30px;
    box-sizing: border-box;
    border-radius: 100px;
    box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
    font-size: $LowBig_Font_Size;
  }

  .payment-info-block {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    & > div {
      width: 700px;

      & > div {
        display: flex;
        align-items: center;
        height: 50px;
        margin-top: 40px;

        & > label {
          min-width: 150px;
          max-width: 150px;
          font-size: $Big_Font_Size;
        }

        & > input {
          width: calc(100% - 150px);
          margin-left: 30px;
        }
      }
    }

    & > div:last-child {
      width: 265px;

      & > div {
        & > label {
          min-width: 40px;
          max-width: 40px;
        }
        & > input {
          width: calc(100% - 40px);
        }
      }
    }
  }

  .price-block {
    display: flex;
    align-items: center;
    margin-top: 60px;

    & > div {
      display: flex;
      align-items: center;

      & > input {
        margin: 0 30px;
        width: 150px;
      }

      & > .ruble {
        font-size: 40px;
      }
    }

    & > label {
      width: 150px;
      font-size: $Big_Font_Size;
    }

    & > button {
      margin-left: 115px;
      width: 200px;
      background: #117bcd;
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      transition: 0.3s;

      &:hover {
        background: #0052b4;
      }
    }
  }

  .price-list {
    margin-top: 50px;
    width: calc(100% + 200px);
    margin-left: -100px;
    border-spacing: 0px;

    & > tr {
      &:first-child > td {
        color: black !important;
      }

      &:not(:last-child) > td {
        border-bottom: 1px solid #efefef;
      }

      & > td {
        position: relative;
        font-size: 20px;
        font-weight: 600;
        padding: 12px 0;

        &:first-child {
          color: $Blue;
          padding-left: 100px;
          width: 180px;
          max-width: 180px;
        }

        & > div {
          display: flex;
          align-items: center;

          & > button {
            margin-left: 10px;

            &:hover + div {
              visibility: visible;
              opacity: 1;
            }
          }

          & > div {
            visibility: hidden;
            position: absolute;
            bottom: 30px;
            left: 170px;
            background: white;
            border: $Gray;
            padding: 10px;
            width: 200px;
            transition: 0.3s;
            opacity: 0;
          }
        }
      }
    }
  }

  .event {
    background: white;
    padding: 50px 100px;
    box-sizing: border-box;
    margin-top: 35px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);

    &:first-child {
      margin-top: 50px;
    }

    & > h3 {
      margin: 0;
      font-size: 24px;
      font-family: $Playfair;
      letter-spacing: 0.1em;
    }

    & > ul {
      margin-top: 10px;
    }
  }

  .download-info-block {
    width: 320px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    & > button {
      background: linear-gradient(
        180deg,
        #ffc700 0%,
        rgba(255, 199, 0, 0.7) 100%
      );
      display: flex;
      align-items: center;
      padding: 35px 15px;
      color: white;
      text-align: left;
      box-sizing: border-box;
      border-radius: 10px;
      font-size: 20px;

      & > img {
        margin-right: 15px;
        width: 50px;
      }
    }
  }

  .user-events-block {
    margin-top: 100px;

    & > h2 {
      margin: 0;
    }
  }

  .payed {
    display: flex;
    align-items: center;
    justify-content: space-between;

    li {
      font-size: 24px;
      font-weight: 600;

      > span {
        color: $Blue;
        margin-left: 20px;
      }

      &:last-child {
        font-size: 20px;
        margin-top: 15px;
      }
    }
  }

  hr {
    width: calc(100% + 200px);
    margin: 35px 0 35px -100px;
    border-top: 1px solid #e7e7e7;
  }

  .gray {
    color: #c4c4c4;
  }

  .red {
    color: #b66868;
  }

  .green {
    color: #8cc261;
  }

  .additions-block > h4 {
    display: none;
  }

  .onlyAdditions {
    margin-top: 5px !important;
  }

  .tickets-block,
  .additions-block {
    display: grid;
    grid-template-areas:
      "ticketName    ticketBooked   ticketPaid    ticketPrice   ticketAmount"
      "ticket        ticket         ticket        ticket        ticket"
      "ticketBlock   ticketBlock    ticketBlock   ticketBlock   ticketBlock";
    justify-content: space-between;
    margin-top: 40px;

    & > h4 {
      font-size: 20px;
      color: #434343;
      font-weight: 600;
      width: 175px;

      & > span {
        display: block;
        font-size: $Medium_Font_Size;
      }
    }

    & > .ticket-booked-head,
    .ticket-paid-head,
    .ticket-price-head {
      text-align: center;
    }

    & > h5 {
      font-size: $Medium_Font_Size;
    }

    & > .ticket-block,
    .addition-block {
      display: grid;
      grid-auto-flow: row;
      justify-content: space-between;
      grid-template-columns: repeat(5, 175px);
      grid-row-gap: 10px;

      & > span {
        font-size: 20px;
        margin-right: 60px;
        display: inline-block;

        &:not(.ticket-name) {
          justify-self: right;
        }
      }
    }

    & > .category-ticket {
      grid-area: ticket;
      margin-top: 5px;
    }

    & > .ticket-block {
      grid-area: ticketBlock;
    }

    & > .ticket-name-head {
      grid-area: ticketName;
    }
    & > .ticket-booked-head {
      grid-area: ticketBooked;
    }
    & > .ticket-paid-head {
      grid-area: ticketPaid;
    }
    & > .ticket-price-head {
      grid-area: ticketPrice;
    }
    & > .ticket-amount-head {
      grid-area: ticketAmount;
    }
  }

  .all-registered-users {
    margin-top: 30px;
    display: flex;
    align-items: center;

    & > span {
      display: inline-block;
      font-weight: 600;

      &:last-child {
        margin-left: 30px;
        color: $Blue;
      }
    }
  }

  .rightElements {
    justify-content: flex-end;
  }

  @media only screen and (max-width: 768px) {
    .balance-block {
      padding: 40px 10px;

      & > .balance-info-block {
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;

        & > * {
          font-size: $Big_Font_Size !important;
        }

        & > div {
          margin-top: 15px;
        }

        & > h2 {
          margin: 0;
        }
      }

      & > .hide {
        margin-top: 50px;

        & > span {
          font-size: $Medium_Font_Size;
          margin-right: 15px;
        }

        & > img {
          width: 10px;
        }
      }
    }

    .showMobile {
      display: none;
    }

    .payment-block {
      & > h3 {
        font-size: $Medium_Font_Size;
        margin-top: 25px;
      }
    }

    .payment-info-block {
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;

      & > div {
        width: 100%;

        & > div {
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          height: auto;

          &:not(:first-child) {
            margin-top: 20px;
          }

          & > input {
            width: 100%;
            margin-top: 5px;
            margin-left: 0;
          }

          & > label {
            font-size: $Medium_Font_Size;
            margin-left: 10px;
          }
        }

        &:not(:first-child) {
          width: 100% !important;

          & > div {
            margin-top: 20px;

            &:first-child {
              margin-top: 20px !important;
            }

            & > input {
              width: 200px;
            }
          }
        }
      }
    }

    .price-block {
      flex-direction: column;
      align-items: flex-start;
      margin-top: 30px;

      & > label {
        font-size: $Medium_Font_Size;
      }

      & > div {
        margin-top: 5px;

        & > input {
          margin: 0 15px 0 0;
          width: 200px;
        }

        & > .ruble {
          font-size: 30px;
        }
      }

      & > button {
        width: 100%;
        font-size: $Medium_Font_Size;
        padding: 10px 0;
        margin-left: 0;
        margin-top: 45px;
      }
    }

    .price-list-block {
      width: 100%;

      & > .price-list {
        width: calc(100% + 30px);
        margin-left: -15px;

        & td:first-child {
          padding-left: 15px !important;
          width: auto !important;
        }

        & td {
          font-size: $Medium_Font_Size !important;
        }
      }
    }

    .user-events-block {
      margin-top: 60px;

      & > h2 {
        font-size: 24px;
      }
    }

    .event {
      padding: 25px 10px;

      & * {
        font-size: $Medium_Font_Size !important;
      }

      & > h3 {
        font-size: $LowBig_Font_Size;
      }

      & > ul {
        margin-top: 15px;
      }

      & > hr {
        width: calc(100% + 20px);
        margin-left: -10px;
      }
    }

    .payed {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;

      li {
        font-size: $LowBig_Font_Size !important;

        > span {
          margin-left: 50px;
          font-size: inherit !important;
        }
      }
    }

    .download-info-block {
      display: block;
      margin-top: 30px;
      width: 100%;

      & > button {
        padding: 20px;
      }
    }

    .additions-block > h4 {
      display: block;
    }

    .tickets-block,
    .additions-block {
      grid-template-areas:
        "ticket              ticket"
        "ticketName          ticketBlock"
        "ticketBooked        ticketBlock"
        "ticketPaid          ticketBlock"
        "ticketPrice         ticketBlock"
        "ticketAmount        ticketBlock";
      justify-content: start !important;
      grid-column-gap: 25px;
      grid-row-gap: 15px;
      overflow-x: scroll;

      & > h5 {
        margin-top: 25px;
        font-size: $LowMedium_Font_Size !important;
        margin-bottom: 5px;

        &.category-ticket {
          margin: 0;
        }
      }

      & > h4 {
        text-align: left !important;
      }

      & > .ticket-block,
      .addition-block {
        grid-auto-flow: column;
        grid-template-rows: repeat(5, auto);
        grid-template-columns: repeat(1, auto);
        grid-column-gap: 20px;

        & > span {
          justify-self: center !important;
          margin: 0;
          white-space: nowrap;
        }
      }

      & > .addition-name-head {
        grid-area: additionName;
      }
    }

    .onlyAdditions {
      margin-top: 40px !important;
    }
  }
</style>

<div>
  <div class="balance-block">
    <div class="balance-info-block">
      <h2>{_('balance_status')}</h2>
      <div>{allBalance} {_('rub')}</div>
    </div>
    <button class="hide" on:click={() => (hideForm = !hideForm)}>
      <span>
        {#if !hideForm}
          {_('hide_application_form')}
        {:else}{_('show_application_form')}{/if}
      </span>
      <img src="/img/next.svg" alt="hide" class:rotate={hideForm} />
    </button>
    <br />
    {#if !hideForm}
      <div class="payment-block" transition:slide>
        <h3>{_('request_for_applications')}</h3>
        <div class="payment-info-block">
          <div>
            <div>
              <label for="name">{_('recipient')}</label>
              <input type="text" name="name" bind:value={recipient} />
            </div>
            <div>
              <label for="bank">{_('recipient_bank')}</label>
              <input type="text" name="bank" bind:value={bank} />
            </div>
            <div>
              <label for="number">{_('account_number')}</label>
              <input type="text" name="number" bind:value={accountNumber} />
            </div>
          </div>
          <div>
            <div>
              <label for="bik">{_('bik')}</label>
              <input type="text" name="bik" bind:value={bik} />
            </div>
            <div>
              <label for="inn">{_('inn')}</label>
              <input type="text" name="inn" bind:value={inn} />
            </div>
            <div>
              <label for="kpp">{_('kpp')}</label>
              <input type="text" name="kpp" bind:value={kpp} />
            </div>
          </div>
        </div>
        <div class="price-block">
          <label for="price">{_('amount')}</label>
          <div>
            <input type="text" name="price" bind:value={amount} />
            <span class="ruble">₽</span>
          </div>
          <button class="blue-button" on:click={sendPayout}>
            {_('send_request')}
          </button>
        </div>
      </div>
    {/if}
    {#if organizerPayouts.length}
      <button
        class="hide"
        on:click={() => (hideApplications = !hideApplications)}>
        <span>
          {#if !hideApplications}
            {_('hide_all_applications')}
          {:else}{_('show_all_applications')}{/if}
        </span>
        <img src="/img/next.svg" alt="hide" class:rotate={hideApplications} />
      </button>
      {#if !hideApplications}
        <div class="price-list-block" transition:slide>
          <table class="price-list">
            <tr>
              <td>{_('amount')}</td>
              <td>{_('order_status')}</td>
            </tr>
            {#each organizerPayouts as payout}
              <tr>
                <td>{payout.sum} {_('rub')}</td>
                {#if payout.status === 'process'}
                  <td class="gray">{_('processed')}</td>
                {:else if payout.status === 'rejected'}
                  <td>
                    <div class="red">
                      {_('rejected')}
                      <button class="info">
                        <img src="/img/tooltip.png" alt="tooltip" />
                      </button>
                      <div class="info-hover">{payout.fail_message}</div>
                    </div>
                  </td>
                {:else}
                  <td class="green">{_('paid')}</td>
                {/if}
              </tr>
            {/each}
          </table>
        </div>
      {/if}
    {/if}
  </div>

  <div class="user-events-block">
    <h2>{_('your_events')}</h2>

    {#if organizerEvents}
      <div class="events-block">
        {#each organizerEvents as event}
          <div class="event">
            <h3>{event.name}</h3>
            {#if event.locations}
              <ul>
                {#each event.locations as location}
                  <li>
                    {location.name}{location.address ? `, ${location.address}` : ''}
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
            {#if !event.buyable || !event.buyable.filter(el => el.type === 'ticket').length}
              <div class="all-registered-users">
                <span>{_('registered')}</span>
                <span>{event.reservations_count}</span>
              </div>
            {/if}
            {#if event.buyable}
              <div
                class="tickets-block"
                class:showMobile={!event.buyable.filter(el => el.type === 'ticket').length}>
                <h4 class="ticket-name-head">{_('name2')}</h4>
                <h4 class="ticket-booked-head">{_('booked')}</h4>
                <h4 class="ticket-paid-head">{_('paid3')}</h4>
                <h4 class="ticket-price-head">{_('price')}</h4>
                <h4 class="ticket-amount-head">
                  {_('amount')}
                  <span>{_('paid_tickets')}</span>
                </h4>
                {#if event.buyable.filter(el => el.type === 'ticket').length}
                  <h5 class="category-ticket">{_('tickets')}</h5>
                  <div class="ticket-block">
                    {#each event.buyable.filter(el => el.type === 'ticket') as ticket}
                      <span class="ticket-name">{ticket.name}</span>
                      <span class="ticket-booked">
                        {getCount(ticket, false)}
                      </span>
                      <span class="ticket-paid">{getCount(ticket, true)}</span>
                      <span class="ticket-price">{ticket.price}{_('rub')}</span>
                      <span class="ticket-amount">{getAmount(ticket)}</span>
                    {/each}
                  </div>
                {/if}
              </div>
              {#if event.buyable.filter(el => el.type === 'additional').length}
                <div
                  class="additions-block"
                  class:onlyAdditions={!event.buyable.filter(el => el.type === 'ticket').length}>
                  <h4 class="ticket-name-head">{_('name2')}</h4>
                  <h4 class="ticket-booked-head">{_('booked')}</h4>
                  <h4 class="ticket-paid-head">{_('paid3')}</h4>
                  <h4 class="ticket-price-head">{_('price')}</h4>
                  <h4 class="ticket-amount-head">
                    {_('amount')}
                    <span>{_('paid_tickets')}</span>
                  </h4>
                  <h5 class="category-ticket">{_('short_additional')}</h5>
                  <div class="ticket-block">
                    {#each event.buyable.filter(el => el.type === 'additional') as ticket}
                      <span class="ticket-name">{ticket.name}</span>
                      <span class="ticket-booked">
                        {getCount(ticket, false)}
                      </span>
                      <span class="ticket-paid">{getCount(ticket, true)}</span>
                      <span class="ticket-price">{ticket.price}{_('rub')}</span>
                      <span class="ticket-amount">{getAmount(ticket)}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            {/if}
            <hr />
            <div class="payed" class:rightElements={!event.buyable}>
              {#if event.buyable}
                <ul class="paid-info">
                  <li>
                    {_('paid2')}
                    <span>{getAllAmount(event.buyable)}{_('rub')}</span>
                  </li>
                  <li>
                    {_('balance')}:
                    <span>{event.balance}{_('rub')}</span>
                  </li>
                </ul>
              {/if}
              <div class="download-info-block">
                <button on:click={() => downloadFile(event.id)}>
                  <img src="/img/excel.svg" alt="excel" />
                  {_('download_registered_users')}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
