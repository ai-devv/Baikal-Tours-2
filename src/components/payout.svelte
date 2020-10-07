<script>
  import Fetcher from "/helpers/fetcher.js";

  export let _;
  export let account_number;
  export let bank;
  export let fail_message;
  export let bik;
  export let id;
  export let inn;
  export let kpp;
  export let recipient;
  export let status;
  export let sum;
  export let user_id;

  const fetcher = new Fetcher();

  let isReject = false;

  async function confirmPayout() {
    if (confirm(_("payout_confirm_message"))) {
      const payoutResult = await fetcher.get(`/api/withdraws/${id}/accept`);

      if (payoutResult.ok) status = "accepted";
      else alert(_("payout_error"));
    }
  }

  async function rejectPayout() {
    if (fail_message && fail_message.length) {
      if (confirm(_("payout_reject_message"))) {
          const payoutResult = await fetcher.post(`/api/withdraws/${id}/reject`, {
            failMessage: fail_message
          });

          if (payoutResult.ok) status = "rejected";
          else alert(_("payout_error"));
        }
      }
    else alert(_("payout_required_message"))
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .payout {
    background: white;
    display: grid;
    grid-template-areas:
      "left   left   left   left   right"
      "bottom bottom bottom bottom bottom";

    &__left,
    &__right,
    &__bottom {
      padding: 20px;
      box-sizing: border-box;
    }

    &__left {
      grid-area: left;
    }

    &__right {
      grid-area: right;
      border-left: 1px solid $Gray;
    }

    &__bottom {
      grid-area: bottom;
      border-top: 1px solid $Gray;

      &__price {
        font-size: $Big_Font_Size;
      }

      &__status-text {
        display: block;
        margin-top: 15px;
        font-size: $LowBig_Font_Size;

        &_rejected {
          color: red;
          font-size: inherit;
        }
      }

      &__reject-block__textarea {
        width: 100%;
        height: 150px;
        resize: none;
        border: 1px solid $Gray;
        box-sizing: border-box;
      }
    }
  }

  .payout-list__item:not(:first-clild) {
    margin-top: 5px;
  }

  .payout-buttons {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-around;

    &__button {
      border-radius: 100px;
      background: white;
      width: 150px;
      padding: 10px;
      box-sizing: border-box;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

      &_reject {
        background: $Light_Gray;
      }
    }
  }
</style>

<div class="payout">
  <div class="payout__left">
    <ul class="payout-list">
      <li class="payout-list__item">{_('recipient')}: {recipient}</li>
      <li class="payout-list__item">{_('recipient_bank')}: {bank}</li>
      <li class="payout-list__item">{_('account_number')}: {account_number}</li>
    </ul>
  </div>
  <div class="payout__right">
    <ul class="payout-list">
      <li class="payout-list__item">{_('bik')}: {bik}</li>
      <li class="payout-list__item">{_('inn')}: {inn}</li>
      <li class="payout-list__item">{_('kpp')}: {kpp}</li>
    </ul>
  </div>
  <div class="payout__bottom">
    <span class="payout__bottom__price">
      <b>{sum}</b>
      {_('rub')}
    </span>
    {#if status === 'process'}
      {#if !isReject}
        <div class="payout-buttons">
          <button
            class="payout-buttons__button payout-buttons__button_reject"
            on:click={() => (isReject = true)}>
            {_('reject')}
          </button>
          <button class="payout-buttons__button" on:click={confirmPayout}>
            {_('approve')}
          </button>
        </div>
      {:else}
        <div class="payout__bottom__reject-block">
          <textarea
            class="payout__bottom__reject-block__textarea"
            bind:value={fail_message} />
          <div class="payout-buttons">
            <button
              class="payout-buttons__button"
              on:click={() => (isReject = false)}>
              {_('cansel')}
            </button>
            <button
              class="payout-buttons__button payout-buttons__button_reject"
              on:click={rejectPayout}>
              {_('send')}
            </button>
          </div>
        </div>
      {/if}
    {:else if status === 'accepted'}
      <span class="payout__bottom__status-text">{_('payout_accepted')}</span>
    {:else}
      <span class="payout__bottom__status-text">
        {_('payout_rejected')}
        <span class="payout__bottom__status-text_rejected">{fail_message}</span>
      </span>
    {/if}
  </div>
</div>
