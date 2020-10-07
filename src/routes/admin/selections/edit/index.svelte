<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let locale = session.locale;
    let compiliationUrl = page.query.url;
    let compiliationId = undefined;
    let compiliationData;

    let isSuccess = false;

    let result_filters = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data;

    let result_actions = (await fetcher.get("/api/actions", {
      credentials: "same-origin",
      query: {
        allStatuses: ""
      }
    })).actions;

    let allLocations = (await fetcher.get(`/api/locations2`, {
      credentials: "same-origin"
    })).data;

    if (compiliationUrl) {
      compiliationData = await fetcher.get(
        `/api/compiliations/${compiliationUrl}`,
        {
          credentials: "same-origin"
        }
      );

      if (compiliationData.ok) {
        compiliationData = compiliationData.data;
        compiliationId = compiliationData.id;
        isSuccess = true;
      }
    } else {
      compiliationData = {
        url: "",
        name: "",
        title: "",
        tagline: "",
        description: "",
        actions: [],
        dates: null,
        subject_ids: null,
        location_ids: null,
        image_url: null
      };
      isSuccess = true;
    }

    if (isSuccess)
      return {
        locale,
        compiliationId,
        result_filters,
        result_actions,
        ...compiliationData,
        compiliationData,
        allLocations
      };

    this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "../../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import * as edit from "/helpers/edit.js";
  import { parseDate } from "/helpers/parsers.js";
  import EventsBlock from "./_events_block.svelte";
  import tr from "transliteration";
  import ClickOutside from "/components/clickOutside.svelte";
  import Loading from "/components/adminLoadingWindow.svelte";
  import dateToString from "/helpers/dateToString.js";

  export let locale,
    compiliationId,
    compiliationData,
    result_actions,
    result_filters,
    url,
    name,
    tagline,
    title,
    description,
    actions,
    dates,
    location_ids,
    subject_ids,
    image_url,
    allLocations;

  const _ = i18n(locale);
  const fetcher = new Fetcher();
  const { slugify } = tr;

  let newData = {},
    datesData = {},
    eventsData = {},
    subjectsNames = [],
    locationsNames = [],
    uploadImg,
    showEvents = false,
    save,
    newImage = image_url === null,
    message;

  dates = edit.cloneArray(compiliationData.dates);
  subject_ids = edit.cloneArray(compiliationData.subject_ids);
  location_ids = edit.cloneArray(compiliationData.location_ids);
  actions = edit.cloneArray(compiliationData.actions);

  if (dates && compiliationId) {
    dates = edit.setDataToCK(dates);
    compiliationData.dates = edit.setDataToCK(compiliationData.dates);

    let d = dates;
    for (let date of d) {
      if (date.dateStart !== null)
        date.dateStart = parseDate(new Date(date.dateStart));
      if (date.dateEnd !== null)
        date.dateEnd = parseDate(new Date(date.dateEnd));
    }
    dates = d;
  }

  //Загаловок
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(name, locale, compiliationId),
      compiliationData.name,
      "name",
      newData
    );
  }

  //title
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(title, locale, compiliationId),
      compiliationData.title,
      "title",
      newData
    );
  }

  //tagline
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(tagline, locale, compiliationId),
      compiliationData.tagline,
      "tagline",
      newData
    );
  }

  //URL
  $: {
    newData = edit.validateNewData(
      slugify(url),
      compiliationData.url,
      "url",
      newData
    );
  }

  //Описание
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(description, locale, compiliationId),
      compiliationData.description,
      "description",
      newData
    );
  }

  //Даты
  $: {
    if (dates !== null && dates.length === 0) dates = null;

    if (dates === null) {
      dates = [];
      addDate();
    }

    let data = edit.validateEditData(
      edit.formatDates(dates, compiliationData),
      "dates",
      datesData
    );

    if (data.dates && Object.keys(data.dates).length) datesData = data.dates;
    else datesData = {};
  }

  //Тематики
  $: {
    if (subject_ids === null) {
      subject_ids = [];
    }

    subjectsNames = edit.getNamesById(result_filters.subjects, subject_ids);

    newData = edit.validateEditArray(
      subject_ids,
      compiliationData.subject_ids,
      "subjectIds",
      newData
    );
  }

  //Локации
  $: {
    if (location_ids === null) {
      location_ids = [];
    }

    locationsNames = edit.getNamesById(allLocations, location_ids);

    newData = edit.validateEditArray(
      location_ids,
      compiliationData.location_ids,
      "locationIds",
      newData
    );
  }

  //События
  $: {
    if (actions === null) {
      actions = [];
    }

    let actionsData = [];
    for (let action of actions)
      actionsData.push({
        actionId: action.id,
        description: edit.setTextTranslation(
          action.description,
          locale,
          compiliationId
        )
      });

    let data = edit.validateEditData(
      edit.validateActionData(actionsData, compiliationData.actions),
      "actions",
      eventsData
    );

    if (data.actions && Object.keys(data.actions).length)
      eventsData = data.actions;
    else eventsData = {};
  }

  let options = [];

  for (let i = 0; i < 2; i++)
    options.push({
      isVisible: false,
      option: null,
      btn: null
    });

  function addDate() {
    dates.push({
      dateStart: null,
      dateEnd: null,
      timeStart: null,
      timeEnd: null,
      days: null
    });

    dates = dates;
  }

  async function changeImage() {
    let img = uploadImg.files;

    if (img.length !== 0) {
      let fileFormat = img[0].name.split(".").pop();
      if (fileFormat !== "jpg" && fileFormat !== "jpeg" && fileFormat !== "png")
        alert(_("images_types_message").replace(/{img}/g, img.name));
      else if (img[0].size / 1024 / 1024 <= 1) {
        image_url = img[0];
        newImage = true;
      } else alert(_("image_not_load").replace(/{img}/g, img[0].name));
    }
  }

  async function deleteImg() {
    image_url = null;
  }

  async function changeAction(e) {
    let action = e.detail.action;
     (action)
    action.description = (await fetcher.get(`/api/actions/${action.slug}`)).data.short_description;

     (action)

    actions.push({ ...action });
    actions = actions;
  }

  async function saveCompiliation() {
    let result;

    let requiredFields = [
      {
        field: title,
        name: "title"
      },
      {
        field: tagline,
        name: "tagline"
      },
      {
        field: url,
        name: "url"
      },
      {
        field: name,
        name: "title_of_collection"
      },
      {
        field: description,
        name: "description_of_compiliation"
      }
    ];

    for (let field of requiredFields)
      if (field.field === "" || field.field === null) {
        alert(_("required_field_message").replace(/{field}/g, _(field.name)));
        return null;
      }

    if (actions.length > 0) {
      for (let i = 0; i < actions.length; i++)
        if (actions[i].description === "" || actions[i].description === null) {
          alert(
            _("required_description").replace(/{action}/g, actions[i].name)
          );
          return null;
        }
    } else {
      alert(_("none_actions"));
      return null;
    }

    if (!image_url) {
      alert(_("none_compiliation_image"));
      return null;
    }

    if (compiliationId === undefined)
      compiliationId = (await fetcher.post(`/api/compiliations`, newData)).data;
    else await fetcher.put(`/api/compiliations/${compiliationId}`, newData);

    if (eventsData.create)
      for (let event of eventsData.create)
        await fetcher.post(
          `/api/compiliations/${compiliationId}/actions`,
          event
        );

    if (eventsData.edit)
      for (let event of eventsData.edit)
        await fetcher.put(
          `/api/compiliations/${compiliationId}/actions/${event.actionId}`,
          { description: event.description }
        );

    if (eventsData.del)
      for (let event of eventsData.del)
        await fetcher.delete(
          `/api/compiliations/${compiliationId}/actions/${event}`
        );

    if (datesData.create)
      for (let date of datesData.create)
        await fetcher.post(`/api/compiliations/${compiliationId}/dates`, date);

    if (datesData.edit)
      for (let date of datesData.edit)
        await fetcher.put(
          `/api/compiliations/${compiliationId}/dates/${date.id}`,
          date
        );

    if (datesData.del)
      for (let date of datesData.del)
        await fetcher.delete(
          `/api/compiliations/${compiliationId}/dates/${date}`
        );

    if (image_url !== compiliationData.image_url && compiliationData.image_url)
      await fetcher.put(
        `/api/compiliations/${compiliationId}/image`,
        { image: image_url },
        { bodyType: "formData" }
      );
    else if (
      image_url !== compiliationData.image_url &&
      !compiliationData.image_url
    )
      await fetcher.post(
        `/api/compiliations/${compiliationId}/image`,
        { image: image_url },
        { bodyType: "formData" }
      );
    
    if(!newData.url) document.location.href = `/admin/selections/${url}`;
    else document.location.href = `/admin/selections/${newData.url}`;
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .option_top{
    bottom: 27px;
    top: auto;
  }

  .head-line {
    display: flex;
    align-items: center;
    margin-top: 20px;

    & > button {
      margin-left: 25px;
    }
  }

  .big-label {
    font-size: $LowBig_Font_Size;
    margin: 20px 0 10px;
    display: block;

    &:first-child {
      margin-top: 0;
    }
  }

  input[type="text"],
  textarea,
  input[type="date"],
  input[type="time"],
  select {
    margin-top: 8px;
    width: 100%;
    padding: 3px;
    border: 1px solid $Gray;
    box-sizing: border-box;
    height: 24px;
  }

  textarea {
    resize: none;
    min-height: 200px;
  }

  .delete {
    font-size: 30px;
    height: 30px;
    width: 20px;
  }

  .img {
    width: 300px;
    height: 200px;
    margin: auto;

    & > img {
      margin-top: 20px;
      max-width: 100%;
      max-height: calc(100% - 30px);
    }

    & > button {
      position: absolute;
      top: 0px;
      right: 0px;
      font-size: 20px;
      z-index: 2;
      color: black;
    }
  }

  .action-block {
    display: flex;
    margin-top: 10px;
    align-items: flex-start;

    & > * {
      width: 350px;
    }

    & > textarea {
      margin-left: 20px;
      margin-top: 0;
    }

    & > .delete {
      width: 40px;
      margin-left: 20px;
    }
  }

  .action {
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 10px;
    cursor: pointer;

    & > h2 {
      margin: 0;
    }

    & > div {
      display: flex;
      margin-top: 10px;
      justify-content: space-between;

      & > span,
      ul {
        width: calc(100% / 3 - 20px);
      }
    }

    &:not(:first-child) {
      margin-top: 20px;
    }
  }

  .add-action {
    margin-top: 20px;
    padding: 10px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    font-weight: bold;
  }

  .actions-block {
    margin-top: 20px;
  }

  .secondLocation{
    padding-left: 15px !important;
  }

  .thridLocation{
    padding-left: 30px !important;
  }
</style>

<svelte:head>
  <title>
    {compiliationId === undefined ? _('creating_compiliation') : _('editing_compiliation')}
  </title>
</svelte:head>

<AdminPage page={6} {fetcher} {locale} {_}>
  <div class="head-line">
    <h1>
      {compiliationId === undefined ? _('creating_compiliation') : _('editing_compiliation')}
    </h1>
    <button class="save" on:click={() => {save = saveCompiliation(); message = _('saving_compiliation')}}>
      {_('save')}
    </button>
  </div>
  <div class="edit-block">
    <label for="name" class="big-label">
      <h4>{_('title_of_collection')}</h4>
      <input type="text" name="name" bind:value={name} />
    </label>
    <label for="URL" class="big-label">
      <h4>URL</h4>
      <input type="text" name="URL" bind:value={url} />
    </label>
    <label for="title" class="big-label">
      <h4>title</h4>
      <input type="text" name="title" bind:value={title} />
    </label>
    <label for="tagline" class="big-label">
      <h4>tagline</h4>
      <input type="text" name="tagline" bind:value={tagline} />
    </label>
    <label for="description">
      <h4>{_('description_of_compiliation')}</h4>
      <textarea name="description" bind:value={description} />
    </label>

    <div class="image-block">
      <h4>{_('compiliation_photo')}</h4>
      {#if !image_url}
        <button class="upload-image-block">
          {_('upload_images')}
          <input
            type="file"
            class="upload-image"
            accept=".jpg, .jpeg, .png"
            bind:this={uploadImg}
            on:change={changeImage}
            name="uploadImg" />
        </button>
      {:else}
        <div class="img">
          <button on:click={() => deleteImg()}>×</button>
          <img
            src={newImage ? URL.createObjectURL(image_url) : image_url}
            alt="compiliation image" />
        </div>
      {/if}
    </div>

    <div class="dates-block">
      {#each dates as date, i}
        <div class="date-block">
          <div>
            <label for="dateStart" class:hide-label={i !== 0}>
              {_('date_start')}
            </label>
            <input type="date" name="dateStart" bind:value={date.dateStart} />
          </div>

          <div>
            <label for="timeStart" class:hide-label={i !== 0}>
              {_('time_start')}
            </label>
            <input type="time" name="timeStart" bind:value={date.timeStart} />
          </div>

          <div class="days-block">
            <label class:hide-label={i !== 0}>{_('periodicity')}</label>
            <div class="dates-line">
              <div>
                {_('monday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(0) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 0))} />
              </div>
              <div>
                {_('tuesday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(1) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 1))} />
              </div>
              <div>
                {_('wednesday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(2) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 2))} />
              </div>
              <div>
                {_('thursday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(3) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 3))} />
              </div>
              <div>
                {_('friday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(4) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 4))} />
              </div>
              <div>
                {_('saturday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(5) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 5))} />
              </div>
              <div>
                {_('sunday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(6) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 6))} />
              </div>
            </div>
          </div>

          <div>
            <label for="dateEnd" class:hide-label={i !== 0}>
              {_('date_end')}
            </label>
            <input type="date" name="dateEnd" bind:value={date.dateEnd} />
          </div>

          <div>
            <label for="timeEnd" class:hide-label={i !== 0}>
              {_('time_end')}
            </label>
            <input type="time" name="timeEnd" bind:value={date.timeEnd} />
          </div>

          <button
            class="delete"
            on:click={() => {
              dates.splice(i, 1);
              dates = dates;
            }}>
            ×
          </button>

          {#if i === dates.length - 1}
            <button class="add-date" on:click={addDate}>
              +{_('add_date')}
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="others-block">

      <div>
        <label for="subjects">{_('subjects')}</label>
        <div class="select-block">
          <button
            class="select"
            bind:this={options[0].btn}
            on:click={() => {
              options[0].isVisible = true;
            }}>
            {subjectsNames.join('; ')}
          </button>
          <ClickOutside
            on:clickoutside={() => (options[0].isVisible = false)}
            exclude={[options[0].btn]}>
            {#if options[0].isVisible}
              <div
                class="option option_top"
                bind:this={options[0].option}>
                {#each result_filters.subjects as subject}
                  <div
                    on:click={() => (subject_ids = edit.parseDataToIds(subject_ids, subject.id))}>
                    <label>{subject.name}</label>
                    <input
                      type="checkbox"
                      checked={subject_ids.indexOf(subject.id) !== -1} />
                  </div>
                {/each}
              </div>
            {/if}
          </ClickOutside>
        </div>
      </div>

      <div>
        <label for="locations">{_('locations')}</label>
        <div class="select-block">
          <button
            class="select"
            bind:this={options[1].btn}
            on:click={() => {
              options[1].isVisible = true;
            }}>
            {locationsNames.join('; ')}
          </button>
          <ClickOutside
            on:clickoutside={() => (options[1].isVisible = false)}
            exclude={[options[1].btn]}>
            {#if options[1].isVisible}
              <div
                class="option option_top"
                bind:this={options[1].option}>
                {#each allLocations as location}
                  <div
                    class:secondLocation={location.n1 && !location.n2} 
                    class:thridLocation={location.n1 && location.n2}
                    on:click={() => (location_ids = edit.parseDataToIds(location_ids, location.id))}>
                    <label>{location.name}</label>
                    <input
                      type="checkbox"
                      checked={location_ids.indexOf(location.id) !== -1} />
                  </div>
                {/each}
              </div>
            {/if}
          </ClickOutside>
        </div>
      </div>

    </div>

    <div class="actions-block">
      <h4>{_('compiliation_events')}</h4>
      {#each actions as action, i}
        <div class="action-block">
          <div class="action">
            <h2>{action.name}</h2>
            <div>
              {#if action.locations}
                <ul>
                  {#each action.locations as location}
                    <li>
                      {location.address ? `${location.name}, ${location.address}` : location.name}
                    </li>
                  {/each}
                </ul>
              {/if}
              {#if action.dates}
                <ul>
                  {#each action.dates as date}
                    <li>{dateToString(date, _)}</li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
          <textarea bind:value={action.description} />
          <button
            class="delete"
            on:click={() => {
              actions.splice(i, 1);
              actions = actions;
            }}>
            ×
          </button>
        </div>
      {/each}
      <button class="add-action" on:click={() => (showEvents = true)}>
        {_('add_action')}
      </button>
    </div>
  </div>
</AdminPage>

<EventsBlock
  {_}
  {result_actions}
  {result_filters}
  {showEvents}
  {actions}
  {fetcher}
  on:changeAction={(e) => {save = changeAction(e); message = _('pasting_event')}}
  on:hideActionWindow={e => (showEvents = false)} />

<Loading promice={save} message={message} />
