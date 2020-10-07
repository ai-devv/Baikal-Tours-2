<script>
  import { validatePhone, validateMail } from "/helpers/validators";
  import { validateNewData, validateEditArray, formatIdsArrays } from "/helpers/edit.js";
  import Fetcher from "/helpers/fetcher.js";
  import { stores } from "@sapper/app";

  export let userInfo, name, surname, phone, email, subjectsInfo, _, digest_period, digest_subjects;

  let userName = [name, surname].filter(el => el !== null).join(" ");
  let newEditData = {},
    newPasswordData = {},
    newDigestData = {},
    oldPassword = null,
    newPassword = null,
    confirmNewPassword = "";

  const fetcher = new Fetcher();
  const { session } = stores();

  $: newEditData = validateNewData(name, userInfo.name, "name", newEditData);

  $: newEditData = validateNewData(
    surname,
    userInfo.surname,
    "surname",
    newEditData
  );

  $: {
    phone = phone === "" ? null : phone;
    newEditData = validateNewData(phone, userInfo.phone, "phone", newEditData);
  }

  $: {
    email = email === "" ? null : email;
    newEditData = validateNewData(email, userInfo.email, "email", newEditData);
  }

  $: {
    oldPassword = oldPassword === "" ? null : oldPassword;
    newPasswordData = validateNewData(
      oldPassword,
      null,
      "oldPassword",
      newPasswordData
    );
  }

  $: {
    newPassword = newPassword === "" ? null : newPassword;
    newPasswordData = validateNewData(
      newPassword,
      null,
      "newPassword",
      newPasswordData
    );
  }

  $: {
    newDigestData = validateNewData(
      digest_period,
      userInfo.digest_period,
      "digestPeriod",
      newDigestData
    )
  }

  $: {
    if(digest_subjects === null)
      digest_subjects = [];

    newDigestData = validateEditArray(
      digest_subjects,
      userInfo.digest_subjects,
      "digestSubjects",
      newDigestData
    );
  }

  async function saveEditData() {
    if (email !== null && !validateMail(email)) {
      alert(_("uncorrect_mail"));
      return null;
    }

    let result = await fetcher.put(
      `/api/users/${$session.userId}`,
      newEditData
    );

    if (result.ok) {
      let keys = Object.keys(newEditData);
      for (let key of keys) {
        userInfo[key] = newEditData[key];
        if (key !== "phone") $session[key] = newEditData[key];
      }

      alert(_("data_change_successful"));
      newEditData = {};
    } else alert(result.error);
  }

  async function savePasswordData() {
    if (newPassword !== confirmNewPassword) {
      alert(_("uncorrect_passwords"));
      return null;
    }

    let result = await fetcher.put(
      `/api/users/${$session.userId}`,
      newPasswordData
    );

    if (result.ok) {
      alert(_("password_change_successful"));
      newPasswordData = {};
      oldPassword = null;
      newPassword = null;
      confirmNewPassword = "";
    } else alert(result.error);
  }

  async function saveDigest(){
    let result = await fetcher.put(
      `/api/users/${$session.userId}`,
      newDigestData
    );

    if(result.ok)
      alert(_("success_digest_edit"));
  }
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  * {
    color: #434343;
  }

  .contacts-data {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;

    & > div {
      background: #f5f7fa;
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      border-radius: 10px;
      width: 580px;
      padding: 40px 120px;
      box-sizing: border-box;

      & > *:not(h3) {
        margin-top: 30px;
      }

      & > h3 {
        margin-top: 0;
        font-family: $Playfair;
        font-size: 24px;
      }

      & > div {
        position: relative;

        &:first-child {
          margin-top: 20px;
        }

        & > input {
          width: 100%;
          padding: 15px 60px 15px 30px;
          box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
          border-radius: 100px;
          background: white;
          font-size: 18px;
          box-sizing: border-box;

          &::placeholder {
            color: #c4c4c4;
          }
        }

        & > div {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 100px;
          background: $Orange_Gradient;
          box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
            inset 0px 0px 50px rgba(255, 255, 255, 0.45);
          width: 30px;
          height: 30px;

          & > img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 15px;
          }
        }
      }

      & > button {
        width: 100%;
      }
    }
  }

  .digest-block {
    width: 100px;
    margin: 100px auto 0;
    width: 1000px;

    & > h2 {
      font-family: $Playfair;
      margin: 0;
      text-align: center;
      font-size: $UltraBig_Font_Size;
    }

    & > .digest-text {
      text-align: center;
      font-size: 20px;
      width: 610px;
      display: block;
      margin: 10px auto 0;
    }
  }

  .edit-digest-block {
    padding: 80px 100px 110px;
    background: white;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    margin-top: 30px;

    & > h3 {
      font-size: 24px;
      font-family: $Playfair;
      text-align: center;
      margin: 0;
      letter-spacing: 0.1em;

      & > span{
        color: $Blue;
        font-family: inherit;
      }

      &:not(:first-child) {
        margin-top: 80px;
      }
    }

    & > button {
      width: 250px;
      margin: 80px auto 0;
    }
  }

  .subjects-block,
  .periodicity-block {
    display: grid;
    grid-template-columns: repeat(2, minmax(180px, max-content));
    grid-column-gap: 20px;
    grid-row-gap: 25px;
    margin-top: 40px;
    justify-content: center;

    & > label {
      display: flex;
      align-items: center;
    }
  }

  .periodicity-block {
    grid-column-gap: 60px;
  }

  .question-text {
    margin-top: 25px;
  }

  .input-block {
    position: relative;
    border-radius: 100px;
    width: 30px;
    height: 30px;
    background: #f5f5f5;
    margin-right: 30px;

    & > input {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      z-index: 1;
      cursor: pointer;

      &:checked + div {
        opacity: 1 !important;
      }
    }

    & > div {
      position: absolute;
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      background: $Orange_Gradient;
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.45);
      opacity: 0;
      z-index: 0;
      border-radius: 100px;
      transition: 0.2s;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 15px;
      }
    }
  }

  @media only screen and (max-width: 768px){
    .contacts-data{
      margin-top: 40px;
      flex-direction: column;
      justify-content: flex-start;

      & > div{
        padding: 40px 10px;
        width: 100%;

        & > div{
          margin-top: 20px;
        }

        & input{
          font-size: $Medium_Font_Size;
        }

        & > button{
          font-size: $Medium_Font_Size;
          margin-top: 30px;
        }
      }

      & > div:last-child{
        margin-top: 40px;
      }
    }

    .digest-block{
      width: 100%;
      margin-top: 60px;

      & > h2{
        font-size: $Big_Font_Size;
        width: 100%;
      }

      & > .digest-text{
        font-size: $Medium_Font_Size;
        width: 100%;
      }
    }

    .edit-digest-block{
      padding: 40px 10px;

      & > h3{
        font-size: $LowBig_Font_Size;
      }

      & > .subjects-block, .periodicity-block{
        grid-template-columns: repeat(1, auto);
      }
    }

    .blue-button{
      font-size: $Medium_Font_Size;
      padding: 10px 0;
      width: 100% !important;
      margin-top: 30px !important;
    }
  }
</style>

<div>
  <div class="contacts-data">
    <div>
      <h3>{_('contact_details')}</h3>
      <div>
        <input type="text" bind:value={name} placeholder={_('name')} />
        <div>
          <img src="/img/user-black.svg" alt="user" />
        </div>
      </div>
      <div>
        <input type="text" bind:value={surname} placeholder={_('surname')} />
        <div>
          <img src="/img/user-black.svg" alt="user" />
        </div>
      </div>
      <div>
        <input
          type="text"
          on:keydown={validatePhone}
          bind:value={phone}
          placeholder={_('phone')} />
        <div>
          <img src="/img/phone-call.svg" alt="user" />
        </div>
      </div>
      <div>
        <input type="text" bind:value={email} placeholder="E-mail" />
        <div>
          <img src="/img/mail.svg" alt="user" />
        </div>
      </div>
      <button
        class="blue-button"
        disabled={Object.keys(newEditData).length === 0}
        on:click={saveEditData}>
        {_('update')}
      </button>
    </div>
    <div>
      <h3>{_('password_change')}</h3>
      <div>
        <input
          type="password"
          bind:value={oldPassword}
          placeholder={_('current_password')} />
      </div>
      <div>
        <input
          type="password"
          bind:value={newPassword}
          placeholder={_('new_password')} />
      </div>
      <div>
        <input
          type="password"
          bind:value={confirmNewPassword}
          placeholder={_('confirm_new_password')} />
      </div>
      <button
        class="blue-button"
        disabled={Object.keys(newPasswordData).length !== 2 || confirmNewPassword === ''}
        on:click={savePasswordData}>
        {_('update')}
      </button>
    </div>
  </div>

  <div class="digest-block">
    <h2>{_('event_digest')}</h2>
    <p class="digest-text">{_('digest_info')}</p>
    <div class="edit-digest-block">
      <h3 class="question-text"><span>{_("intresting_subjects_blue")}</span><br />{_('intresting_subjects')}</h3>
      <div class="subjects-block">
        {#each subjectsInfo as subject}
          <label for="sport">
            <div class="input-block">
              <input type="checkbox" name="sport" bind:group={digest_subjects} value={subject.id}/>
              <div class="changed-input-block">
                <img src="/img/tick.svg" alt="tick" />
              </div>
            </div>
            {subject.name}
          </label>
        {/each}
      </div>
      <h3 class="question-text"><span>{_('digest_interval')}</span><br />{_("event_digest_question")}</h3>
      <div class="periodicity-block">
        <label for="periodicity">
          <div class="input-block">
            <input type="radio" name="periodicity" bind:group={digest_period} value={"month"}/>
            <div class="changed-input-block">
              <img src="/img/tick.svg" alt="tick" />
            </div>
          </div>
          {_('one_per_mounth')}
        </label>
        <label for="periodicity">
          <div class="input-block">
            <input type="radio" name="periodicity" bind:group={digest_period} value={"2months"}/>
            <div class="changed-input-block">
              <img src="/img/tick.svg" alt="tick" />
            </div>
          </div>
          {_('two_per_mounth')}
        </label>
        <label for="periodicity">
          <div class="input-block">
            <input type="radio" name="periodicity" bind:group={digest_period} value={"halfYear"}/>
            <div class="changed-input-block">
              <img src="/img/tick.svg" alt="tick" />
            </div>
          </div>
          {_('one_per_half_a_year')}
        </label>
        <label for="periodicity">
          <div class="input-block">
            <input type="radio" name="periodicity" bind:group={digest_period} value={null}/>
            <div class="changed-input-block">
              <img src="/img/tick.svg" alt="tick" />
            </div>
          </div>
          {_('cancel_digest')}
        </label>
      </div>
      <button class="blue-button" on:click={saveDigest} disabled={!(Object.keys(newDigestData).length)}>{_('save').toUpperCase()}</button>
    </div>
  </div>
</div>
