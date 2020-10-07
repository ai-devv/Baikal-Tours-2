<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;
    let id = page.query.id;
    let hotelData = {
      booking_url: "",
      booking_location_id: null,
      name: "",
      price: null,
      rating: null,
      image_url: null
    };
    let locations = (await fetcher.get("/api/bookingLocations", {
      credentials: "same-origin"
    })).data;

    if (id !== undefined) {
      hotelData = (await fetcher.get(`/api/hotels/${id}`, {
        credentials: "same-origin"
      })).data;
    }

    if (hotelData !== undefined)
      return {
        locale,
        id,
        hotelData,
        ...hotelData,
        locations
      };
    else this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import * as edit from "/helpers/edit.js";
  import Loading from "/components/adminLoadingWindow.svelte";
  import { validateNewData } from "/helpers/edit.js";

  export let locale,
    id,
    hotelData,
    booking_url,
    booking_location_id,
    name,
    price,
    rating,
    image_url,
    locations;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  let newData = {},
    save,
    uploadImg,
    newImage = image_url === null;

  //Название отеля
  $: newData = validateNewData(name, hotelData.name, "name", newData);

  //Страница отеля на booking
  $: newData = validateNewData(
    booking_url,
    hotelData.booking_url,
    "bookingUrl",
    newData
  );

  //Цена отеля
  $: newData = validateNewData(price, hotelData.price, "price", newData);

  //Рейтинг отеля
  $: newData = validateNewData(rating, hotelData.rating, "rating", newData);

  //Локация отеля из справочника
  $: newData = validateNewData(
    booking_location_id,
    hotelData.booking_location_id,
    "bookingLocationId",
    newData
  );

  async function saveData() {
    let result;

    for (let key of Object.keys(newData))
      if (newData[key] === "" || newData[key] === undefined)
        newData[key] = null;

    if (newData.name === null) {
      alert(_("required_field_message").replace(/{field}/g, _("hotel_name")));
      return null;
    }

    if (id === undefined) {
      result = await fetcher.post(`/api/hotels/`, { ...newData });
      id = result.data;

      if (image_url) {
        result = await fetcher.post(
          `/api/hotels/${id}/image`,
          { image: image_url },
          { bodyType: "formData" }
        );
      }
    } else {
      result = await fetcher.put(`/api/hotels/${id}`, { ...newData });

      if(image_url !== hotelData.image_url && !image_url)
        result = await fetcher.delete(`/api/hotels/${id}/image`);
      else if (image_url !== hotelData.image_url && !hotelData.image_url)
        result = await fetcher.post(
          `/api/hotels/${id}/image`,
          { image: image_url },
          { bodyType: "formData" }
        );
      else if(image_url !== hotelData.image_url)
        result = await fetcher.put(
          `/api/hotels/${id}/image`,
          { image: image_url },
          { bodyType: "formData" }
        );

    } 

    document.location.href = "./admin/hotels";
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
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .image {
    width: 350px;
    height: 200px;
    margin: 20px auto 0;
    position: relative;

    & > img {
      max-width: 100%;
      max-height: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .edit-line {
    margin-top: 20px;
    display: flex;

    & > *:not(:first-child) {
      margin-left: 50px;
    }

    & input,
    select {
      width: 250px;
    }
  }

  input,
  select {
    border: 1px solid $Gray;
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
  }

  .line {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  label {
    margin-top: 20px;
    display: block;
  }

  .img-block{
    margin-top: 20px;
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
</style>

<AdminPage {_} {locale} {fetcher} page={4}>
  <div class="line">
    <h1>{id === undefined ? _('creating_hotel') : _('editing_hotel')}</h1>
    <button class="green-button" on:click={() => (save = saveData())}>
      {_('hotel_save')}
    </button>
  </div>
  <div class="edit-block">
    <label for="name">
      <h3>{_('hotel_name')}</h3>
      <input type="text" name="name" bind:value={name} />
    </label>
    <label for="booking_url">
      <h3>{_('hotel_url')}</h3>
      <input type="text" name="booking_url" bind:value={booking_url} />
    </label>
    <div class="img-block">
      <h3>{_('hotel_image')}</h3>
      {#if image_url}
        <div class="img">
          <button on:click={() => (image_url = null)}>×</button>
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
    <div class="edit-line">
      <label for="price">
        <h3>{_('hotel_price')}</h3>
        <input type="number" name="price" bind:value={price} />
      </label>
      <label for="rating">
        <h3>{_('hotel_rating')}</h3>
        <input type="number" name="rating" bind:value={rating} />
      </label>
      <label for="location">
        <h3>{_('location_from_booking')}</h3>
        <select name="location" bind:value={booking_location_id}>
          <option value={null} />
          {#each locations as location}
            <option value={location.id}>{location.name}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>
</AdminPage>

<Loading promice={save} message={_('saving_hotel')} />
