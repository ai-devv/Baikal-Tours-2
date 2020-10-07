<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let id = page.query.id;
    let locale = session.locale;
    let tour_data = {
      name: "",
      site: "",
      date_start: "",
      date_end: "",
      location_ids: [],
      image_url: null,
      price: null
    };

    let locations = (await fetcher.get("/api/locations2", {
      credentials: "same-origin"
    })).data;

    if (id) {
      tour_data = (await fetcher.get(`/api/tours/${id}`, {
        credentials: "same-origin"
      }))[0];

    }

    return { locale, id, tour_data, ...tour_data, locations };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import * as edit from "/helpers/edit.js";
  import ClickOutside from "/components/clickOutside.svelte";
  import Loading from "/components/adminLoadingWindow.svelte";
  import { parseDate } from "/helpers/parsers.js";

  export let locale,
    id,
    tour_data,
    name,
    site,
    date_start,
    date_end,
    location_ids,
    price,
    image_url,
    locations;

  const _ = i18n(locale);
  const fetcher = new Fetcher();

  let newData = {},
    editData = {},
    deleteData = {},
    uploadImg,
    newImage = image_url === null,
    options = [{ isVisible: false, option: null, btn: null }],
    locationsNames = "",
    save;

  location_ids = edit.cloneArray(tour_data.location_ids);

  //Имя
  $: {
    let data = edit.validateNewtranslateData(
      edit.setTextTranslation(name, locale, id),
      tour_data.name,
      "name",
      {}
    );

    if (id === undefined && data.name !== undefined) newData.name = data.name;
    else if (data.name !== undefined) editData.name = data.name;
    else {
      delete editData.name;
      delete newData.name;
      editData = editData;
      newData = newData;
    }
  }

  //Страница
  $: {
    let data = edit.validateNewData(site, tour_data.site, "site", {});

    if (id === undefined && data.site !== undefined) newData.site = data.site;
    else if (data.site !== undefined) editData.site = data.site;
    else {
      delete editData.site;
      delete newData.site;
      editData = editData;
      newData = newData;
    }
  }

  //Цена
  $: {
    let data = edit.validateNewData(price, tour_data.price, "price", {});

    if (id === undefined && data.price !== undefined)
      newData.price = data.price;
    else if (data.price !== undefined) editData.price = data.price;
    else {
      delete editData.price;
      delete newData.price;
      editData = editData;
      newData = newData;
    }
  }

  //Дата начала
  $: {
    let isoDate = "";
    if (date_start && date_start.length) {
      date_start = parseDate(new Date(date_start));
      isoDate = new Date(date_start).toISOString();
    }

    let data = edit.validateNewData(
      isoDate,
      tour_data.date_start,
      "dateStart",
      {}
    );

    if (id === undefined && data.dateStart !== undefined)
      newData.dateStart = data.dateStart;
    else if (data.dateStart !== undefined) editData.dateStart = data.dateStart;
    else {
      delete editData.dateStart;
      delete newData.dateStart;
      editData = editData;
      newData = newData;
    }
  }

  //Дата окончания
  $: {
    let isoDate = "";
    if (date_end && date_end.length) {
      date_end = parseDate(new Date(date_end));
      isoDate = new Date(date_end).toISOString();
    }

    let data = edit.validateNewData(isoDate, tour_data.date_end, "dateEnd", {});

    if (id === undefined && data.dateEnd !== undefined)
      newData.dateEnd = data.dateEnd;
    else if (data.dateEnd !== undefined) editData.dateEnd = data.dateEnd;
    else {
      delete editData.dateEnd;
      delete newData.dateEnd;
      editData = editData;
      newData = newData;
    }
  }

  //Локации
  $: {
    if (location_ids === null) {
      location_ids = [];
    }
    locationsNames = edit.getNamesById(locations, location_ids);

    let data = edit.validateEditArray(
      location_ids,
      tour_data.location_ids,
      "locationIds",
      {}
    );

    if (Object.keys(data).indexOf("locationIds") !== -1 && id === undefined)
      newData.locationIds = data.locationIds;
    else if (
      Object.keys(data).indexOf("locationIds") !== -1 &&
      id !== undefined
    )
      editData.locationIds = data.locationIds;
    else {
      delete editData.locationIds;
      delete newData.locationIds;
      editData = editData;
      newData = newData;
    }
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

  async function savetour() {
    let result;

    let requiredFields = [
      {
        field: name,
        name: "tour_name"
      },
      {
        field: site,
        name: "tour_site"
      },
      {
        field: date_start,
        name: "date_start"
      },
      {
        field: date_end,
        name: "date_end"
      },
      {
        field: location_ids,
        name: "locations"
      }
    ];

    for (let field of requiredFields)
      if (field.field.length === 0 || field.field === null) {
        alert(_("required_field_message").replace(/{field}/g, _(field.name)));
        return null;
      }

    if (!image_url) {
      alert(_("required_field_message").replace(/{field}/g, _("tour_image")));
      return null;
    }

    if (id === undefined) {
      id = (await fetcher.post(`/api/tours`, newData)).data;

      if (newImage) {
        result = await fetcher.post(
          `/api/tours/${id}/image`,
          { image: image_url },
          { bodyType: "formData" }
        );
      }
    } else {
      if (Object.keys(editData).length)
        await fetcher.put(`/api/tours/${id}`, editData);

      if (image_url !== tour_data.image_url && tour_data.image_url) {
        result = await fetcher.put(
          `api/tours/${id}/image`,
          {
            image: image_url
          },
          { bodyType: "formData" }
        );
      } else if (image_url !== tour_data.image_url && !tour_data.image_url) {
        result = await fetcher.post(
          `api/tours/${id}/image`,
          {
            image: image_url
          },
          { bodyType: "formData" }
        );
      }
    }

    document.location.href = `/admin/tours`;
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .secondLocation{
    padding-left: 15px !important;
  }

  .thridLocation{
    padding-left: 30px !important;
  }

  .edit-block > *:not(:first-child) {
    display: block;
    margin-top: 20px;
  }

  input:not([type="checkbox"]) {
    margin-top: 8px;
    width: 100%;
    padding: 3px;
    border: 1px solid $Gray;
    box-sizing: border-box;
    height: 24px;
  }

  input[type="file"] {
    margin-top: 0;
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

  .line-data,
  .line {
    display: flex !important;
    align-items: flex-start;
    justify-content: space-between;
  }

  .line {
    margin-top: 35px;
  }
</style>

<svelte:head>
  <title>{id === undefined ? _('creating_tour') : _('editing_tour')}</title>
</svelte:head>

<AdminPage {fetcher} {locale} {_} page={3}>
  <div class="line">
    <h2>{id === undefined ? _('creating_tour') : _('editing_tour')}</h2>
    <button class="green-button" on:click={() => (save = savetour())}>
      {_('tour_save')}
    </button>
  </div>

  <div class="edit-block">
    <label for="name">
      <h3>{_('tour_name')}</h3>
      <input type="text" bind:value={name} />
    </label>
    <label for="site">
      <h3>{_('tour_site')}</h3>
      <input type="text" name="site" bind:value={site} />
    </label>
    <div class="img-block">
      <h3>{_('tour_image')}</h3>
      {#if image_url}
        <div class="img">
          <button on:click={() => deleteImg()}>×</button>
          <img
            src={newImage ? URL.createObjectURL(image_url) : image_url}
            alt="tour image" />
        </div>
      {:else}
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
      {/if}
    </div>
    <div class="line-data">
      <label for="price">
        <h4>{_('price')}</h4>
        <input type="number" name="price" bind:value={price} />
      </label>
      <label for="dateStart">
        <h4>{_('date_start')}</h4>
        <input type="date" name="dateStart" bind:value={date_start} />
      </label>
      <label for="dateEnd">
        <h4>{_('date_end')}</h4>
        <input type="date" name="dateEnd" bind:value={date_end} />
      </label>
      <div>
        <label for="locations">
          <h4>{_('locations')}</h4>
        </label>

        <div class="select-block">
          <button
            class="select"
            bind:this={options[0].btn}
            on:click={() => {
              options[0].isVisible = true;
            }}>
            {locationsNames.join('; ')}
          </button>
          <ClickOutside
            on:clickoutside={() => (options[0].isVisible = false)}
            exclude={[options[0].btn]}>
            {#if options[0].isVisible}
              <div class="option" bind:this={options[0].option}>
                {#each locations as location}
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
  </div>
</AdminPage>

<Loading promice={save} message={_('saving_tour')} />
