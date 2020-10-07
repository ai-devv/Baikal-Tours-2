<script>
  import AdminPage from "../../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { parseDate } from "/helpers/parsers.js";
  import { onMount } from "svelte";
  import * as edit from "/helpers/edit.js";
  import SortableList from "/components/sortableList.svelte";
  import BannerBlock from "/components/bannerBlock.svelte";
  import AdminCard from "/components/admin_card.svelte";
  import Image from "/components/imageCenter.svelte";
  import ClickOutside from "/components/clickOutside.svelte";
  import Loading from "/components/adminLoadingWindow.svelte";
  import YandexMap from "/components/yandexMap/index.svelte";
  import HotelsWindow from "./_hotels_window.svelte";
  import UsersBlock from "./_users_window.svelte";
  import LocationsList from "/components/adminLocations.svelte";
  import Fetcher from "/helpers/fetcher.js";
  import tr from "transliteration";

  export let actionId,
    result_filters,
    result_users,
    actionData,
    price_min = 0,
    price_max = 0,
    organizer_ids = null,
    site_payment = false,
    organizer_payment = null,
    emails = null,
    phones = null,
    websites = null,
    vk_link = null,
    facebook_link = null,
    instagram_link = null,
    twitter_link = null,
    status = "hidden",
    is_favorite = false,
    organizer_email = null,
    organizer_phone = null,
    title = "",
    name = "",
    short_description = "",
    full_description = "",
    organizer_name = "",
    contact_faces = null,
    images = [],
    dates = null,
    locations = null,
    transfers = null,
    subjects = null,
    companions = null,
    hotels = [],
    partners = [],
    tours = [],
    excursions = [],
    allExcursions,
    allTours,
    allHotels,
    locale,
    buyable = [],
    hotelsCount,
    locations2 = [],
    newLocations,
    slug,
    alt = "",
    instagram_widget_is_show = false,
    instagram_widget_title = "";
  
  const fetcher = new Fetcher();
  const _ = i18n(locale);
  const customIcon = {
    iconImageHref: "/img/placeholder-map.svg",
    iconImageSize: [ 30, 42 ],
    iconImageOffset: [ -14, -36 ]
  };
  const center = [ 52.285725130459866, 104.28156685575135 ];
  const apiKey = "c7b75af8-80f3-4ff2-afb6-a05da8ecdeec";
  const { slugify } = tr;

  emails = edit.cloneArray(actionData.emails);
  phones = edit.cloneArray(actionData.phones);
  websites = edit.cloneArray(actionData.websites);
  contact_faces = edit.cloneArray(actionData.contact_faces);
  images = edit.cloneArray(actionData.images);
  dates = edit.cloneArray(actionData.dates);
  locations = edit.cloneArray(actionData.locations);
  transfers = edit.cloneArray(actionData.transfers);
  subjects = edit.cloneArray(actionData.subjects);
  companions = edit.cloneArray(actionData.companions);
  buyable = edit.cloneArray(actionData.buyable);
  organizer_ids = edit.cloneArray(actionData.organizer_ids);
  locations2 = edit.cloneArray(actionData.locations2);

  if(actionData.dates)
    for(let i = 0; i < actionData.dates.length; i++)
      if(actionData.dates[i].days)
        dates[i].days = Object.assign([], actionData.dates[i].days)

  for(let location of locations2){
    location.button = null;
    location.isShow = false;
  }
    
  subjects = edit.getIds(subjects);
  transfers = edit.getIds(transfers);
  companions = edit.getIds(companions);

  if (locations) 
    for (let location of locations) 
      delete location.name;

  let price = "",
    transfersNames = [],
    subjectsNames = [],
    companionsNames = [],
    participation,
    uploadImg,
    uploadPartners,
    newImages = [],
    newPartners = [],
    mainImg = null,
    newData = {},
    newPartnerName = "",
    editorBlock,
    showHotels = false,
    showTours = false,
    showExcursions = false,
    save,
    hideMap = true,
    activeLocation = null,
    mapIsLoad = false,
    newLocationsData = [];
  
  if (organizer_payment !== null) participation = "organizer";
  else if (site_payment === true) participation = "site";

  if (price_min === 0 && price_max === 0) price = "";
  else if (price_min === 0 && price_max !== 0) price = price_max;
  else if (price_min !== 0 && price_max === 0) price = price_min;
  else if (price_min !== null && price_max !== null)
    price = price_min + "-" + price_max;
  
  if (dates !== null) {
    let d = dates;
    for (let date of d) {
      if (date.dateStart !== null)
        date.dateStart = parseDate(new Date(date.dateStart));
      if (date.dateEnd !== null)
        date.dateEnd = parseDate(new Date(date.dateEnd));
    }
    dates = d;
  }
  if((!actionData.title || !actionData.title.length) && actionId)
    title = actionData.name;
  
  //Title
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(title, locale, actionId),
      actionData.title,
      "title",
      newData
    );
  }

  //Короткое описание события
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(short_description, locale, actionId),
      actionData.short_description,
      "short_description",
      newData
    );
  }

  //Название события
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(name, locale, actionId),
      actionData.name,
      "name",
      newData
    );
  }

  //alt
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(alt, locale, actionId),
      actionData.alt,
      "alt",
      newData
    );
  }
  
  //Описание события
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(full_description, locale, actionId),
      actionData.full_description,
      "full_description",
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
    newData = edit.validateEditData(
      edit.formatDates(dates, actionData),
      "dates",
      newData
    );
  }

  //Локации
  $: {
    if (locations !== null && locations.length === 0) locations = null;
    if (locations === null) {
      locations = [];
      addLocation();
    }
    newData = edit.validateEditData(
      edit.formatLocations(locations, actionData),
      "locations",
      newData
    );
  }

  //Тематики
  $: {
    if (subjects === null) {
      subjects = [];
    }
    subjectsNames = edit.getNamesById(result_filters.subjects, subjects);
    newData = edit.validateEditData(
      edit.formatIdsArrays(subjects, actionData.subjects),
      "subjects",
      newData
    );
  }

  //Трансферы
  $: {
    if (transfers === null) {
      transfers = [];
    }
    transfersNames = edit.getNamesById(result_filters.transfers, transfers);
    newData = edit.validateEditData(
      edit.formatIdsArrays(transfers, actionData.transfers),
      "transfers",
      newData
    );
  }
  //Компаньены
  $: {
    if (companions === null) {
      companions = [];
    }
    companionsNames = edit.getNamesById(result_filters.companions, companions);
    newData = edit.validateEditData(
      edit.formatIdsArrays(companions, actionData.companions),
      "companions",
      newData
    );
  }
  
  //Организатор
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(organizer_name, locale, actionId),
      actionData.organizer_name,
      "organizer_name",
      newData
    );
  }

  //Организатор из пользователей
  $: {
    if(organizer_ids === null || organizer_ids.length === 0)
      organizer_ids = [{id: null, isVisible: false}];
    for(let i = 0; i <  organizer_ids.length; i++)
      if(typeof organizer_ids[i] !== "object")
        organizer_ids[i] = {
          id: organizer_ids[i],
          isVisible: false
        }
    
    let ids = [];
    for(let { id } of organizer_ids)
      if(id)
        ids.push(id)
    newData = edit.validateEditArray(
      ids,
      actionData.organizer_ids,
      "organizer_ids",
      newData
    );
  }

  //Контактные лица
  $: {
    if (contact_faces !== null && contact_faces.length === 0)
      contact_faces = null;
    if (contact_faces === null) contact_faces = [""];
    let fContact_faces = [];
    for (let i = 0; i < contact_faces.length; i++)
      fContact_faces.push(contact_faces[i]);
    fContact_faces = edit.setTextTranslation(fContact_faces, locale, actionId);
    newData = edit.validateEditArray(
      fContact_faces,
      actionData.contact_faces,
      "contact_faces",
      newData
    );
  }

  //Телефоны
  $: {
    if (phones !== null && phones.length === 0) phones = null;
    if (phones === null) phones = [""];
    newData = edit.validateEditArray(
      phones,
      actionData.phones,
      "phones",
      newData
    );
  }

  //Электронные почты
  $: {
    if (emails !== null && emails.length === 0) emails = null;
    if (emails === null) emails = [""];
    newData = edit.validateEditArray(
      emails,
      actionData.emails,
      "emails",
      newData
    );
  }

  //Сайты
  $: {
    if (websites !== null && websites.length === 0) websites = null;
    if (websites === null) websites = [""];
    newData = edit.validateEditArray(
      websites,
      actionData.websites,
      "websites",
      newData
    );
  }

  //Вконтакте
  $: {
    if (vk_link === "") vk_link = null;
    newData = edit.validateNewData(
      vk_link,
      actionData.vk_link,
      "vk_link",
      newData
    );
  }

  //Фейсбук
  $: {
    if (facebook_link === "") facebook_link = null;
    newData = edit.validateNewData(
      facebook_link,
      actionData.facebook_link,
      "facebook_link",
      newData
    );
  }

  //Инстаграм
  $: {
    if (instagram_link === "") instagram_link = null;
    newData = edit.validateNewData(
      instagram_link,
      actionData.instagram_link,
      "instagram_link",
      newData
    );
  }

  //Твиттер
  $: {
    if (twitter_link === "") twitter_link = null;
    newData = edit.validateNewData(
      twitter_link,
      actionData.twitter_link,
      "twitter_link",
      newData
    );
  }

  //Вариант участия
  $: if (participation === "organizer") {
      setOrganizerPayment( actionData.organizer_payment )
      site_payment = false;
    } else {
      site_payment = true;
      setOrganizerPayment( null )
  }

  //Оплата через организатора
  $: {
    newData = edit.validateNewData(
      organizer_payment,
      actionData.organizer_payment,
      "organizer_payment",
      newData
    );
  }

  //Оплата на сайте
  $: {
    newData = edit.validateNewData(
      site_payment,
      actionData.site_payment,
      "site_payment",
      newData
    );
  }

  //Билеты
  $: {
    let tickets = buyable.filter(el => el.type === "ticket");
    let additions = buyable.filter(el => el.type === "additional")  
    if(!tickets.length)
      addBuyable("ticket")
    
    if(!additions.length)
      addBuyable("additional")
  }

  //URL
  $: {
    newData = edit.validateNewData(
      slugify(slug),
      actionData.url,
      "slug",
      newData
    );
  }

  //Заголовок instagram
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(instagram_widget_title, locale, actionId),
      actionData.instagram_widget_title,
      "instagram_widget_title",
      newData
    );
  }

  //Показать блок инстаграма
  $: {
    newData = edit.validateNewData(
      instagram_widget_is_show,
      actionData.instagram_widget_is_show,
      "instagram_widget_is_show",
      newData
    );
  }


  let options = [];
  for (let i = 0; i < 3; i++)
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

  function addLocation() {
    locations.push({
      id: null,
      address: null,
      location_id: null,
      coords: null
    });
    locations = locations;
  }

  function setOrganizerPayment(fl){
    organizer_payment = fl;
  }

  async function changeImages() {
    let newSecondImages = [],
      result;
    let saveNewImage = !images.length && !newImages.length;
    for (let img of uploadImg.files) {
      let fileFormat = img.name.split(".").pop();
      if (fileFormat !== "jpg" && fileFormat !== "jpeg" && fileFormat !== "png")
        alert(_("images_types_message").replace(/{img}/g, img.name));
      else if (img.size / 1024 / 1024 <= 1) {
        newSecondImages.push(img);
      } else alert(_("image_not_load").replace(/{img}/g, img.name));
    }
    if (actionId !== undefined && newSecondImages.length !== 0) {
      result = (await fetcher.post(
        "/api/actionImages",
        {
          actionId: Number(actionId),
          images: newSecondImages
        },
        { bodyType: "formData" }
      )).data;
    }
    for (let i = 0; i < newSecondImages.length; i++) {
      newImages.push({
        src: newSecondImages[i],
        id: actionId === undefined ? null : result[i]
      });
    }
    newImages = newImages;
    if(newImages.length && saveNewImage){
      changeNewActiveImg(0, newImages[0].id);
    }
      
  }

  async function changeActiveImg(main_img, id) {
    mainImg = null;
    for (let img of images)
      if (img.is_main === true) {
        img.is_main = false;
        break;
      }
    images[main_img].is_main = true;
    let saveImage = await fetcher.put(`/api/actionImages/${id}`, {
      isMain: true
    });
  }

  async function changeNewActiveImg(main_img, id) {
    for (let i = 0; i < images.length; i++)
      if (images[i].is_main) {
        images[i].is_main = false;
        break;
      }
    mainImg = main_img;
    if (actionId !== undefined) {
      let saveImage = await fetcher.put(`/api/actionImages/${id}`, {
        isMain: true
      });
    }
  }

  async function deleteImg(delete_img, id) {
    if (images[delete_img].is_main && images.length > 1) {
      if (delete_img !== 0) images[delete_img - 1].is_main = true;
      else images[delete_img + 1].is_main = true;
    } else if (
      images[delete_img].is_main &&
      images.length === 1 &&
      newImages.length !== 0
    )
      mainImg = 0;
    images.splice(delete_img, 1);
    images = images;
    let newI = false, i = 0;
    for(let image of images){
      if(image.is_main){
        changeActiveImg(i, image.id)
        newI = true;
        break;
      }
      i++;
    }
    if(!newI && newImages[mainImg])
      changeNewActiveImg(mainImg, newImages[mainImg].id)
    await fetcher.delete(`/api/actionImages/${id}`);
  }

  async function deleteNewImg(delete_img, id) {
    if (
      (delete_img === 0 && newImages.length === 1) ||
      (delete_img === 0 && mainImg === delete_img && images.length !== 0)
    ) {
      mainImg = null;
      if (images.length !== 0) images[images.length - 1].is_main = true;
    } else if (newImages.length > 1 && delete_img === mainImg)
      if (delete_img !== 0) mainImg = delete_img - 1;
      else mainImg = delete_img;
    else if (delete_img < mainImg) mainImg--;
    newImages.splice(delete_img, 1);
    newImages = newImages;
    if(mainImg){
      changeNewActiveImg(mainImg, newImages[mainImg].id)
    }
    else{
      let i = 0;
      for(let image of images){
        if(image.is_main){
          changeActiveImg(i, image.id)
          break;
        }
        i++;
      }
    }
    if (actionId !== undefined) await fetcher.delete(`/api/actionImages/${id}`);
  }

  async function saveAction() {
    let result;
    let requiredFields = [
      {
        field: short_description,
        name: "short_event_description"
      },
      {
        field: name,
        name: "event_name"
      },
      {
        field: full_description,
        name: "event_description"
      },
      {
        field: organizer_name,
        name: "organizer"
      }
    ];
    for (let field of requiredFields)
      if (field.field === "" || field.field === null) {
        alert(_("required_field_message").replace(/{field}/g, _(field.name)));
        return null;
      }
    if (participation === "organizer" && organizer_payment === "") {
      alert(_("required_payment_message"));
      return null;
    }
    if(!subjects || !subjects.length){
      alert(_("required_subjects"));
      return null;
    }
    if(!companions || !companions.length){
      alert(_("required_companion"));
      return null;
    }
    let bl = false;
    for(let location of locations)
      if(location.location_id){
        bl = true;
        break;
      }
    if(!bl){
      alert(_("required_locations"))
      return null;
    } 

    if (actionId === undefined) {
      actionId = Number((await fetcher.post("/api/actions")).data);
      if (newImages.length !== 0) {
        let fileImages = [];
        for (let img of newImages) fileImages.push(img.src);
        result = (await fetcher.post(
          "/api/actionImages",
          {
            actionId: actionId,
            images: fileImages
          },
          { bodyType: "formData" }
        )).data;
        if (mainImg !== null) {
          let saveImage = await fetcher.put(`/api/actionImages/${result[mainImg]}`, {
            isMain: true
          });
        }
      }
      if (newPartners.length !== 0) {
        for (let partner of newPartners) {
          result = await fetcher.post(
            `/api/actionPartners`,
            {
              actionId: actionId,
              name: partner.name,
              image: partner.image_url
            },
            { bodyType: "formData" }
          );
        }
      }
      if(excursions.length !== 0)
        for(let excursion of excursions)
          result = await fetcher.post("/api/actionsExcursions", {
            actionId,
            excursionId: excursion.id
          })
      
      if(tours.length !== 0)
        for(let tour of tours)
          result = await fetcher.post("/api/actionsTours", {
            actionId,
            tourId: tour.id
          })
      if(hotels.length){
        for(let hotel of hotels)
          result = await fetcher.post(`/api/actions/${actionId}/hotels`, {
            hotelId: hotel.id
          })
      }
    }
    let newTickets = edit.parseTickets(actionData.buyable, buyable, actionId, locale);
    if(newTickets.del !== undefined)
      for(let ticket of newTickets.del)
        await fetcher.delete(`/api/actionBuyable/${ticket}`)
    
    if(newTickets.create !== undefined)
      for(let ticket of newTickets.create)
        await fetcher.post(`/api/actionBuyable`, {
          actionId,
          ...ticket
        })
    
    if(newTickets.edit !== undefined)
      for(let ticket of newTickets.edit)
        await fetcher.put(`/api/actionBuyable/${ticket.id}`, {
          name: ticket.name,
          price: ticket.price
        })
    
    if(newLocationsData.location2Ids){
      let data = newLocationsData.location2Ids;
      if(data.create)
        for(let id of data.create)
          await fetcher.post(`/api/actions/${actionId}/locations2`, {
            location2Id: id
          });
          
      if(data.del)
        for(let id of data.del){
          let result = await fetcher.delete(`/api/actions/${actionId}/locations2/${id}`);
        }
    }

    let url;

    if(!slug)
      newData.slug = slugify(name);

    url = newData.slug;

    result = await fetcher.put(`/api/actions/${actionId}`, newData);

    

    if(!url) document.location.href = `/admin/event/${actionData.slug}`;
    else document.location.href = `/admin/event/${url}`;
  }

  async function changePartners() {
    let img = uploadPartners.files,
      newPartner = {},
      result;
    if (img.length !== 0) {
      let fileFormat = img[0].name.split(".").pop();
      if (fileFormat !== "jpg" && fileFormat !== "jpeg" && fileFormat !== "png")
        alert(_("images_types_message").replace(/{img}/g, img.name));
      else if (img[0].size / 1024 / 1024 <= 1) {
        newPartner = {
          image_url: img[0],
          name: newPartnerName
        };
      } else alert(_("image_not_load").replace(/{img}/g, img[0].name));
    }
    if (actionId !== undefined && Object.keys(newPartner).length !== 0) {
      result = (await fetcher.post(
        `/api/actionPartners`,
        {
          actionId: Number(actionId),
          name: newPartner.name,
          image: newPartner.image_url
        },
        { bodyType: "formData" }
      )).data;
      newPartner.id = result;
    }
    newPartners.push(newPartner);
    newPartners = newPartners;
    newPartnerName = "";
  }

  async function renamePartner(id, name) {
    if (actionId !== undefined)
      await fetcher.put(`/api/actionPartners/${id}`, { name });
  }

  async function deletePartner(partnerId) {
    if (actionId !== undefined)
      await fetcher.delete(`/api/actionPartners/${partnerId}`);
  }

  let initEditor = false;
  let start = false;

  onMount(() => {
    start = true;
    if(initEditor)
      startEditor()
  })

  function startEditor(){
    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{'header': 1}, {'header': 2}],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'script': 'sub'}, {'script': 'super'}],
      [{'indent': '-1'}, {'indent': '+1'}],
      [{'direction': 'rtl'}],
      [{'size': ['small', false, 'large', 'huge']}],
      ['link'],
      [{'color': []}, {'background': []}],
      [{'align': []}]
      ];

    var options = {
      modules: {
        toolbar: toolbarOptions
      },
      theme: 'snow'
    };

    var editor = new Quill('#editor', options);
    editor.setContents(editor.clipboard.convert(full_description.replace(/\n/g, "</br>")));
    full_description = document.querySelector(".ql-editor").innerHTML;
    editor.on('text-change', function(delta, oldDelta, source){
      full_description = document.querySelector(".ql-editor").innerHTML;
    })
  }

  async function sortTours(e){
    let newTours = e.detail, i = 0;
    if(actionId !== undefined){
      for (let tour of tours) {
        if (tour.id !== newTours[i].id) {
          let j = 0;
          for(let newTour of newTours){
            if(newTour.id === tour.id)
              break;
            j++;
          }
          let result = await fetcher.put(`/api/actionsTours/`, {
            actionId,
            tourId: tour.id,
            number: j + 1,
            action: "swipe"
          });
          if (result.ok) tours = newTours;
          break;
        }
        i++;
      }
    }
    else
      tours = newTours;
  }

  async function sortExcursions(e){
    let newExcursions = e.detail, i = 0;
    if(actionId !== undefined){
      for (let excursion of excursions) {
        if (excursion.id !== newExcursions[i].id) {
          let j = 0;
          for(let newExcursion of newExcursions){
            if(newExcursion.id === excursion.id)
              break;
            j++;
          }
            
          let result = await fetcher.put(`/api/actionsExcursions/`, {
            actionId,
            excursionId: excursion.id,
            number: j + 1,
            action: "swipe"
          });
          if (result.ok) excursions = newExcursions;
          break;
        }
        i++;
      }
    }
    else
      excursions = newExcursions;
  }

  async function sortHotels(e){
    let newHotels = e.detail, i = 0;
    if(actionId !== undefined){
      for (let hotel of hotels) {
        if (hotel.id !== newHotels[i].id) {
          let j = 0;
          for(let newHotel of newHotels){
            if(newHotel.id === hotel.id)
              break;
            j++;
          }
            
          let result = await fetcher.put(`/api/actions/${actionId}/hotels/${hotel.id} `, {
            number: j + 1,
            action: "swipe"
          });
          if (result.ok) hotels = newHotels;
          break;
        }
        i++;
      }
    }
    else
      hotels = newHotels;
  } 

  async function addTour(e){
    let newTour = e.detail;
    for(let tour of tours)
      if(tour.id === newTour.id){
        alert(_("already_added_tour"))
        return null;
      }
      
    if(actionId !== undefined){
      let result = await fetcher.post("/api/actionsTours", {
        actionId,
        tourId: newTour.id
      })
    }
    tours.push(newTour);
    tours = tours;
    showTours = false;
  }
  
  async function addExcursion(e){
    let newExcursion = e.detail;
    for(let excursion of excursions)
      if(excursion.id === newExcursion.id){
        alert(_("already_added_tour"))
        return null;
      }
      
    if(actionId !== undefined){
      let result = await fetcher.post("/api/actionsExcursions", {
        actionId,
        excursionId: newExcursion.id
      })
    }
    excursions.push(newExcursion);
    excursions = excursions;
    showExcursions = false;
  }

  async function addHotel(e){
    let newHotel = e.detail;
    for(let hotel of hotels)
      if(hotel.id === newHotel.id){
        alert(_("already_added_tour"))
        return null;
      }
      
    if(actionId !== undefined){
      let result = await fetcher.post(`/api/actions/${actionId}/hotels`, {
        hotelId: newHotel.id
      })
    }
    hotels.push(newHotel);
    hotels = hotels;
    showHotels = false;
  }

  async function deleteTour(id, i){
    if(actionId !== undefined){
      let result = await fetcher.delete("/api/actionsTours", {
        query: {
          actionId,
          tourId: id
        }
      })
    }
    tours.splice(i, 1);
    tours = tours;
  }

  async function deleteExcursion(id, i){
    if(actionId !== undefined){
      let result = await fetcher.delete("/api/actionsExcursions", {
        query: {
          actionId,
          excursionId: id
        }
      })
    }
    excursions.splice(i, 1);
    excursions = excursions;
  }

  async function deleteHotel(id, i){
    if(actionId)
      await fetcher.delete(`/api/actions/${actionId}/hotels/${id}`)
    
    hotels.splice(i, 1);
    hotels = hotels;
  }

  function addBuyable(type){
    buyable.push({
        type,
        name: "",
        price: ""
    })
    buyable = buyable;
  }

  function savePlacemark(data){
    let locationIndex = locations.indexOf(activeLocation);
    locations[locationIndex].address = data.address;
    locations[locationIndex].coords = data.coords;
  }

  function showMap(location){
    activeLocation = location;
    hideMap = false;
  }

  function closeMap(){
    activeLocation = null;
    hideMap = true;
  }

  function deletePlaceholder(){
    let locationIndex = locations.indexOf(activeLocation);
    activeLocation.coords = null;
    locations[locationIndex].address = null;
    locations[locationIndex].coords = null;
  }

  function getOrganizerNameById(id){
    for(let organizer of result_users){
      if(organizer.id === id){
        let name = "";
        if(organizer.name && organizer.surname)
          name = `${organizer.name} ${organizer.surname}`
        else name = organizer.email;
        return name;
      }
    }
    return "";
  }

  function add2Location(){
    locations2.push({
      name: null,
      id: null,
      n0: 0,
      n1: 0,
      n2: 0
    })
    locations2 = locations2;
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";
  .title-h1 {
    font-size: 18px;
  }
  .save {
    margin-left: 18px;
    padding: 10px 15px;
    color: white;
    font-size: 18px;
    background: $Green;
    border-radius: 5px;
  }
  .line-center {
    display: flex;
    align-items: center;
  }
  label {
    margin-top: 10px;
    font-weight: bold;
    display: block;
  }
  input[type="text"],
  textarea,
  input[type="number"],
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
  .img > button {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 2;
    background: white;
    border-radius: 100px;
    width: 20px;
    height: 20px;
    overflow: hidden;
    & > img{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
    }
  }
  .block-name {
    font-size: $Big_Font_Size;
    margin-bottom: 15px;
    font-weight: bold;
  }
  .locations-block {
    margin-top: 35px;
  }
  .location-block {
    display: flex;
    align-items: flex-end;
    margin-top: 15px;
    & > .location-select {
      width: auto;
      & > select {
        width: 165px;
      }
    }
    & > .location-name {
      width: auto;
      margin-left: 7px;
      & > input {
        width: 525px;
      }
    }
    & > button:not(.delete) {
      margin-left: 15px;
      width: 24px;
      height: 24px;
    }
    & > .delete {
      height: 30px;
      margin-left: 15px;
    }
  }
  .organisators-block {
    display: flex;
    margin-top: 35px;
    & > div {
      & select,
      input {
        width: 400px;
      }
    }
    & > div:last-child{
      margin-left: 40px;
    }
  }
  .contacts-block {
    display: flex;
    margin-top: 35px;
    & label {
      font-weight: normal;
      font-size: $LowMedium_Font_Size;
      margin: 0 5px 0 0;
      width: 70px;
    }
    & .block-name {
      font-size: $Medium_Font_Size;
      font-weight: bold;
      margin-bottom: 10px;
    }
    & input {
      width: 170px;
      margin-top: 0;
    }
    & > .contacts-block-info {
      & > div {
        display: flex;
        align-items: flex-start;
        & > div {
          & > div {
            display: flex;
            align-items: center;
            & > button {
              margin-left: 10px;
            }
            & > .delete {
              margin-left: 5px;
              font-size: 25px;
              width: 25px;
            }
          }
        }
      }
    }
    & > .messengers-block-info {
      margin-left: 50px;
      & > div {
        display: flex;
        align-items: center;
      }
    }
    & > div {
      & > div:not(:first-child) {
        margin-top: 10px;
      }
    }
  }
  .pay-block {
    margin-top: 35px;
    & label {
      font-size: $Medium_Font_Size;
      margin: 0;
      font-weight: normal;
    }
    & > div {
      display: flex;
      align-items: center;
      & > *:not(:first-child) {
        margin-left: 10px;
      }
      & > input[type="text"] {
        width: 320px;
      }
    }
    & > div:not(:first-child) {
      margin-top: 10px;
    }
  }
  .partner {
    display: grid;
    grid-template-columns: repeat(4, 150px);
    justify-content: space-between;
    grid-row-gap: 20px;
    margin-top: 15px;
  }
  .partners-block {
    margin-top: 35px;
  }
  .empty {
    position: relative;
    width: 150px;
    height: 100px;
    background: $Gray;
    & > div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 100%;
      width: 36px;
      height: 36px;
      & > div {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: $Gray;
        font-size: 50px;
      }
    }
    & > input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
  }
  .hide-label {
    height: 0;
    overflow: hidden;
    margin: 0;
  }
  :global(.edit-block .ql-editor){
    min-height: 300px;
    max-height: 300px;
  }
  :global(#editor){
    min-height: 300px;
    max-height: 300px;
  }
  :global(.ql-toolbar){
    margin-top: 10px;
  }
  .all-tours-block{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 2;
    & > button{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #00000088;
      z-index: 1;
    }
    & > div{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      & > h4{
        font-size: 20px;
        color: white;
      }
      
      & > div{
        width: 1050px;
        height: 800px;
        background: white;
        margin-top: 30px;
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(4, 225px);
        justify-content: space-between;
        grid-row-gap: 20px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        align-items: start;
        overflow: auto;
      }
    }
  }
  .windows-block{
    margin-top: 35px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    & > div{
      width: 250px;
    }
  }
  .banner-block{
    width: 225px;
    height: 150px;
    position: relative;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    & > :global(img){
      pointer-events: none;
    }
    & > .banner-data{
      position: absolute;
      bottom: 0px;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 20px;
      background: linear-gradient(
        180deg,
      rgba(59, 57, 74, 0) 10%,
      #3b394a 100%
      );
      box-sizing: border-box;
      & > *{
        color: white;
      }
    }
  }
  .add{
    margin-top: 20px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    padding: 20px;
  }
  .tours, .excursions, .hotels {
    & :global(li){
      width: 225px;
    }
    & .delete{
      position: absolute;
      top: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 100px;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      & > img{
        width: 12px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
  .tickets-block{
    display: flex;
    align-items: flex-start;
    margin-top: 35px;
    & > div:last-child{
      margin-left: 40px;
    }
  }
  .all-tickets{
    & > div{
      display: grid;
      grid-template-columns: 150px 150px 20px 25px;
      grid-column-gap: 15px;
      margin-top: 10px;
      & > input, label{
        width: 150px;
      }
      & > .add-ticket{
        font-size: 25px;
        width: 25px;
      }
      & > .delete{
        font-size: 30px;
        width: 20px;
      }
    }
  }
  .organizer-line{
    display: flex;
    align-items: center;
    margin-top: 8px;
    height: 24px;
    position: relative;
    & > .add-оrganizer{
      font-size: 25px;
    }
    & > button:not(.organizer-user){
      margin-left: 10px;
    }
    & > .organizer-user{
      margin-top: 0;
      border: 1px solid $Gray;
      padding: 3px;
      width: 400px;
      text-align: left;
      height: 24px;
      position: relative;
      &:before{
        position: absolute;
        top: 50%;
        right: 5px;
        transform: translateY(-50%) rotate(90deg);
        width: 17px;
        height: 8px;
        background-image: url("../img/next.svg");
        background-size: 100% 100%;
        content: "";
        display: block;
      }
    }
  }
  .map-block{
    position: fixed;
    width: 90%;
    height: 90%;
    top: 5%;
    left: 5%;
    z-index: 5;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    background: white;
    & > .hide-map-button{
      position: absolute;
      right: 30px;
      top: 30px;
      z-index: 1;
      & > img{
        width: 40px;
      }
    }
    & > .delete-placeholder{
      position: absolute;
      left: 30px;
      top: 30px;
      font-size: 24px;
      padding: 20px;
      background: white;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      z-index: 1;
    }
    & > span{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      display: block;
      padding: 20px;
      background: white;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      z-index: 1;
    }
  }
  .hideMap{
    display: none;
  }
  .editor-load-block{
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    & > span{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: bold;
    }
  }
  .description-block{
    height: 350px;
    position: relative;
  }
  .new-locations{
    margin-top: 20px;
    > .new-location-block{
      position: relative;
      display: flex;
      align-items: center;
      margin-top: 10px;
      > .new-location-button{
        width: 250px;
        height: 30px;
        text-align: left;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background: white;
        border: 1px solid $Gray;
        box-sizing: border-box;
        
        padding-left: 10px;
      }
      ul{
        position: absolute;
        top: 35px;
        left: 0;
        background: white;
        width: 250px;
        border: 1px solid $Gray;
        padding: 10px;
        max-height: 400px;
        z-index: 1;
        overflow: auto;
        > li{
          margin-left: 0;
          font-weight: bold;
          &.secondLocation{margin-left: 15px;}
          &.thridLocation{
            margin-left: 30px;
            font-weight: normal;
          }
          & > button{
            font-weight: inherit;
            text-align: left;
          }
          &:not(:first-child) > button{
            padding-top: 10px;
          }
        }
      }
      > *:not(:first-child){
        margin-left: 20px;
      }
      > .add-location2{
        width: 20px;
        height: 20px;
        font-size: 20px;
        overflow: hidden;
      }
      > .delete-location2 > img{
        width: 10px;
      }
    }
  }

  .instagram-params{
    padding-left: 20px;
    display: block !important;

    label{
      width: auto !important;
      display: inline !important;
    }

    > div{
      display: flex;
      align-items: center;

      &:not(:first-child){
        margin-top: 5px;
      }
    }
  }
</style>

<svelte:head>
  <title>
    {actionId === undefined ? _("creating_event") : _("editing_event")}
  </title>

  <script src="//cdn.quilljs.com/1.3.6/quill.js" on:load={() => {
    initEditor = true;
    if(start)
      startEditor()
  }}></script>
  <link href="//cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">

</svelte:head>

<AdminPage page={0} {fetcher} {locale} {_}>
  <div class="line-center">
    <h2 class="title-h1">
      {#if actionId === undefined}
        {_('creating_event')}
      {:else}{_('editing_event')}{/if}
    </h2>
    <button class="save" on:click={() => save = saveAction()}>{_('save')}</button>
  </div>
  <div class="edit-block">
    <label for="title">Title</label>
    <input type="text" name="title" bind:value={title} />

    <label for="short-description">{_('short_event_description')}</label>
    <input
      type="text"
      name="short-description"
      bind:value={short_description} />

    <label for="name">{_('event_name')}</label>
    <input type="text" name="name" bind:value={name} />

    <label for="URL">URL</label>
    <input type="text" name="URL" bind:value={slug} />

    <label for="description">{_('event_description')}</label>
    <div class="description-block">
      <div id="editor"></div>
      {#if !initEditor && !start}
        <div class="editor-load-block">
          <span class="editorLoad">{_("loading_editor")}</span>
        </div>
      {/if}
    </div>
    
    <label>{_('event_photos')}</label>
    <div class="images-block">

      {#each images as img, i}
        <div class="img-block">
          <div class="img" class:imp={img.is_main}>
            <button on:click={() => deleteImg(i, img.id)}> <img src="/img/cross.svg" alt="delete"> </button>
            <img
              src={img.image_url}
              alt="image"
              on:click={() => changeActiveImg(i, img.id)} />
          </div>
          {#if img.is_main}
            <div class="imp-text">{_('main')}</div>
          {/if}
        </div>
      {/each}

      {#each newImages as img, i}
        <div class="img-block">
          <div class="img" class:imp={i === mainImg}>
            <button on:click={() => deleteNewImg(i, img.id)}> <img src="/img/cross.svg" alt="delete"> </button>
            <img
              src={URL.createObjectURL(img.src)}
              alt="image"
              on:click={() => changeNewActiveImg(i, img.id)} />
          </div>
          {#if i === mainImg}
            <div class="imp-text">{_('main')}</div>
          {/if}
        </div>
      {/each}

    </div>
    <button class="upload-image-block">
      {_('upload_images')}
      <input
        type="file"
        class="upload-image"
        accept=".jpg, .jpeg, .png"
        multiple
        bind:this={uploadImg}
        on:change={changeImages}
        name="uploadImg" />
    </button>

    <label for="alt">ALT</label>
    <input type="text" name="alt" bind:value={alt} />

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

    <div class="locations-block">
      {#each locations as location, i}
        <div class="location-block">
          <div class="location-select">
            <label for="location" class:hide-label={i !== 0}>
              {_('location')}
            </label>
            <LocationsList 
              allLocations={newLocations}
              changedLocation={location.location_id}
              on:change={({detail}) => {
                
                location.location_id = detail.id;
              }}
            />
          </div>

          <div class="location-name">
            <label for="location-name" class:hide-label={i !== 0}>
              {_('venue')}
            </label>
            <input type="text" bind:value={location.address} />
          </div>

          <button on:click={() => showMap(location)}>
            <img src="/img/admin-placeholder.png" alt="place" />
          </button>

          <button
            class="delete"
            on:click={() => {
              locations.splice(i, 1);
              locations = locations;
            }}>
            ×
          </button>

          {#if i === locations.length - 1}
            <button on:click={addLocation}>+</button>
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
          <ClickOutside on:clickoutside={() => options[0].isVisible = false} exclude={[options[0].btn]}>
          {#if options[0].isVisible}
            <div
              class="option"
              bind:this={options[0].option}>
              {#each result_filters.subjects as subject}
                <div
                  on:click={() => (subjects = edit.parseDataToIds(subjects, subject.id))}>
                  <label>{subject.name}</label>
                  <input
                    type="checkbox"
                    checked={subjects.indexOf(subject.id) !== -1} />
                </div>
              {/each}
            </div>
          {/if}
          </ClickOutside>
        </div>
      </div>

      <div>
        <label for="transfer">{_('transfer')}</label>
        <div class="select-block">
          <button
            class="select"
            bind:this={options[1].btn}
            on:click={() => {
              options[1].isVisible = true;
            }}>
            {transfersNames.join('; ')}
          </button>
          <ClickOutside on:clickoutside={() => options[1].isVisible = false} exclude={[options[1].btn]}>
          {#if options[1].isVisible}
            <div
              class="option"
              bind:this={options[1].option}>
              {#each result_filters.transfers as transfer}
                <div
                  on:click={() => (transfers = edit.parseDataToIds(transfers, transfer.id))}>
                  <label>{transfer.name}</label>
                  <input
                    type="checkbox"
                    checked={transfers.indexOf(transfer.id) !== -1} />
                </div>
              {/each}
            </div>
          {/if}
          </ClickOutside>
        </div>
      </div>

      <div>
        <label for="companions">{_('who_can_i_go_with')}</label>
        <div class="select-block">
          <button
            class="select"
            bind:this={options[2].btn}
            on:click={() => {
              options[2].isVisible = true;
            }}>
            {companionsNames.join('; ')}
          </button>
          <ClickOutside on:clickoutside={() => options[2].isVisible = false} exclude={[options[2].btn]}>
          {#if options[2].isVisible}
            <div
              class="option"
              bind:this={options[2].option}>
              {#each result_filters.companions as companion}
                <div
                  on:click={() => (companions = edit.parseDataToIds(companions, companion.id))}>
                  <label>{companion.name}</label>
                  <input
                    type="checkbox"
                    checked={companions.indexOf(companion.id) !== -1} />
                </div>
              {/each}
            </div>
          {/if}
          </ClickOutside>
        </div>
      </div>

    </div>

    <div class="organisators-block">

      <div>
        <label for="organisator">{_('organizer')}</label>
        <input type="text" name="organisator" bind:value={organizer_name} />
      </div>

      <div>
        <label for="organisator-user">{_('organizer_from_user')}</label>
          {#each organizer_ids as organizer, i}
            <div class="organizer-line">
              <button class="organizer-user" bind:this={organizer.btn} on:click={() => organizer.isVisible = true}>{getOrganizerNameById(organizer.id)}</button>
              <ClickOutside on:clickoutside={() => organizer.isVisible = false} exclude={[organizer.btn]}>
                {#if organizer.isVisible}
                  <UsersBlock {result_users} {_} {fetcher} id={organizer.id} {organizer_ids} on:changeUser={(e) => {
                    organizer.id = e.detail.id;
                    organizer.isVisible = false;
                  }}/>
                {/if}
              </ClickOutside>
              <button class="delete" on:click={() => {organizer_ids.splice(i, 1); organizer_ids = organizer_ids}}>×</button>
              {#if i === organizer_ids.length - 1}
                <button class="add-оrganizer" on:click={() => {organizer_ids.push({id: null, isVisible: false}); organizer_ids = organizer_ids}}>+</button>
              {/if}
            </div>
          {/each}
      </div>

    </div>

    <div class="contacts-block">

      <div class="contacts-block-info">
        <div class="block-name">{_('contacts')}</div>

        <div>
          <label for="contact_face">{_('contact_face')}</label>
          <div>
            {#each contact_faces as contact_face, i}
              <div>
                <input
                  type="text"
                  name="contact_face"
                  bind:value={contact_face} />
                <button
                  class="delete"
                  on:click={() => {
                    contact_faces.splice(i, 1);
                    contact_faces = contact_faces;
                  }}>
                  ×
                </button>
                {#if i === contact_faces.length - 1}
                  <button
                    on:click={() => {
                      contact_faces.push('');
                      contact_faces = contact_faces;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>

        </div>

        <div>
          <label for="phone">{_('phone')}</label>
          <div>
            {#each phones as phone, i}
              <div>
                <input type="text" name="phone" bind:value={phone} />
                <button
                  class="delete"
                  on:click={() => {
                    phones.splice(i, 1);
                    phones = phones;
                  }}>
                  ×
                </button>
                {#if i === phones.length - 1}
                  <button
                    on:click={() => {
                      phones.push('');
                      phones = phones;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>

        </div>

        <div>
          <label for="email">E-mail</label>
          <div>
            {#each emails as email, i}
              <div>
                <input type="text" name="email" bind:value={email} />
                <button
                  class="delete"
                  on:click={() => {
                    emails.splice(i, 1);
                    emails = emails;
                  }}>
                  ×
                </button>
                {#if i === emails.length - 1}
                  <button
                    on:click={() => {
                      emails.push('');
                      emails = emails;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <div>
          <label for="site">{_('site')}</label>
          <div>
            {#each websites as website, i}
              <div>
                <input type="text" name="site" bind:value={website} />
                <button
                  class="delete"
                  on:click={() => {
                    websites.splice(i, 1);
                    websites = websites;
                  }}>
                  ×
                </button>
                {#if i === websites.length - 1}
                  <button
                    on:click={() => {
                      websites.push('');
                      websites = websites;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="messengers-block-info">
        <div class="block-name">{_('messangers')}</div>

        <div>
          <label for="vk">{_('VK')}</label>
          <input type="text" name="vk" bind:value={vk_link} />
        </div>

        <div>
          <label for="fb">{_('facebook')}</label>
          <input type="text" name="fb" bind:value={facebook_link} />
        </div>

        <div>
          <label for="in">{_('instagram')}</label>
          <input type="text" name="in" bind:value={instagram_link} />
        </div>

        <div class="instagram-params">
          <div>
            <label for="in_header">{_("instagram_header")}</label>
            <input type="text" name="in_header" bind:value={instagram_widget_title} />
          </div>
          <div>
            <label for="in_show">{_("show_instagram_block")}</label>
            <input type="checkbox" name="in_show" bind:checked={instagram_widget_is_show} />
          </div>
        </div>

        <div>
          <label for="tw">{_('twitter')}</label>
          <input type="text" name="tw" bind:value={twitter_link} />
        </div>
      </div>

    </div>

    <div class="tickets-block">
      <div>
        <div class="block-name">{_("tickets")}</div>
        <div class="all-tickets">
          <div>
            <label for="ticket-name">{_("ticket_name")}</label>
            <label for="ticket-price">{_("ticket_price")}</label>
          </div>
          {#each buyable.filter(el => el.type === "ticket") as ticket, i}
            <div>
              <input type="text" bind:value={ticket.name}>
              <input type="number" bind:value={ticket.price}>
              <button class="delete" on:click={() => {
                buyable.splice(buyable.indexOf(ticket), 1);
                buyable = buyable;
                }}>×</button>
              {#if i === buyable.filter(el => el.type === "ticket").length - 1}
                <button class="add-ticket" on:click={() => addBuyable("ticket")}>+</button>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div>
        <div class="block-name">{_("additionally_services")}</div>
        <div class="all-tickets">
          <div>
            <label for="ticket-name">{_("service_name")}</label>
            <label for="ticket-price">{_("service_price")}</label>
          </div>
          {#each buyable.filter(el => el.type === "additional") as ticket, i}
            <div>
              <input type="text" bind:value={ticket.name}>
              <input type="number" bind:value={ticket.price}>
              <button class="delete" on:click={() => {
                buyable.splice(buyable.indexOf(ticket), 1);
                buyable = buyable;
                }}>×</button>
              {#if i === buyable.filter(el => el.type === "additional").length - 1}
                <button class="add-ticket" on:click={() => addBuyable("additional")}>+</button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="pay-block">

      <div class="block-name">{_('participations_options')}</div>

      <div>
        <input
          type="radio"
          name="participation"
          bind:group={participation}
          value={'organizer'} />
        <label for="participation">{_('pay_via_organizer')}</label>
        <input
          type="text"
          placeholder={_('organizer_site_href')}
          bind:value={organizer_payment}
          disabled={participation !== 'organizer'} />
      </div>

      <div>
        <input
          type="radio"
          name="participation"
          bind:group={participation}
          value={'site'} />
        <label for="participation">{_('pay_in_site')}</label>
      </div>

    </div>

    <div class="partners-block">

      <div class="block-name">{_('action_partners')}</div>

      <div class="partner">

        {#each partners as partner, i}
          <div class="img-block">
            <div class="img">
              <button
                on:click={() => {
                  partners.splice(i, 1);
                  partners = partners;
                  deletePartner(partner.id);
                }}>
                ×
              </button>
              <img src={partner.image_url} alt="image" />
            </div>
            <input
              type="text"
              bind:value={partner.name}
              placeholder={_('partner_name')}
              on:blur={() => renamePartner(partner.id, partner.name)} />
          </div>
        {/each}

        {#each newPartners as partner, i}
          <div class="img-block">
            <div class="img">
              <button
                on:click={() => {
                  newPartners.splice(i, 1);
                  newPartners = newPartners;
                  deletePartner(partner.id);
                }}>
                ×
              </button>
              <img src={URL.createObjectURL(partner.image_url)} alt="image" />
            </div>
            <input
              type="text"
              bind:value={partner.name}
              placeholder={_('partner_name')}
              on:blur={() => renamePartner(partner.id, partner.name)} />
          </div>
        {/each}

        <div>
          <button class="empty">
            <div>
              <div>+</div>
            </div>
            <input
              type="file"
              class="upload-image"
              accept=".jpg, .jpeg, .png"
              bind:this={uploadPartners}
              on:change={changePartners}
              name="uploadImg" />
          </button>
          <input
            type="text"
            placeholder={_('partner_name')}
            bind:value={newPartnerName} />
        </div>

      </div>

    </div>

    <div class="windows-block">
      <div class="tours-block">
        <div class="block-name">{_('tours_nearby')}</div>
        <div class="tours">
          <SortableList
            list={tours}
            key="id"
            on:sort={sortTours}
            let:item
            let:index>
            <div class="banner-block">
              <Image src={item.image_url} alt={item.name} />
              <div class="banner-data">
                <h4>{item.name}</h4>
                <span class="price">{item.price} {_("rub")}</span>
              </div>
              <button class="delete" on:click={() => deleteTour(item.id, index)}> <img src="/img/cross.svg" alt="delete"> </button>
            </div>
          </SortableList>
          {#if tours.length < 3}
            <button class="add" on:click={() => showTours = true}>{_("add_tour")}</button>
          {/if}
        </div>
      </div>

      <div class="excursions-block">
        <div class="block-name">{_('excursions_nearby')}</div>
        <div class="excursions">
          <SortableList
            list={excursions}
            key="id"
            on:sort={sortExcursions}
            let:item
            let:index>
            <div class="banner-block">
              <Image src={item.image_url} alt={item.name} />
              <div class="banner-data">
                <h4>{item.name}</h4>
                <span class="price">{item.price} {_("rub")}</span>
              </div>
              <button class="delete" on:click={() => deleteExcursion(item.id, index)}> <img src="/img/cross.svg" alt="delete"> </button>
            </div>
          </SortableList>
          {#if excursions.length < 3}
            <button class="add" on:click={() => showExcursions = true}>{_("add_excursion")}</button>
          {/if}
        </div>
      </div>

      <div class="hotels-block">
        <div class="block-name">{_("hotels_nearby")}</div>
        <div class="hotels">
          <SortableList
            list={hotels}
            key="id"
            on:sort={sortHotels}
            let:item
            let:index>
            <div class="banner-block">
              <Image src={item.image_url} alt={item.name} />
              <div class="banner-data">
                <h4>{item.name}</h4>
                <span class="price">{item.price} {_("rub")}</span>
              </div>
              <button class="delete" on:click={() => deleteHotel(item.id, index)}> <img src="/img/cross.svg" alt="delete"> </button>
            </div>
          </SortableList>
          {#if hotels.length < 3}
            <button class="add" on:click={() => showHotels = true}>{_("add_hotel")}</button>
          {/if}
        </div>
      </div>
    </div>

  </div>
</AdminPage>

<Loading promice={save} message={_("saving_event")}/>

<div class="map-block" class:hideMap={hideMap}>
  <button on:click={closeMap} class="hide-map-button"><img src="/img/cross.svg" alt="close"></button>
  {#if activeLocation && activeLocation.coords}
    <button class="delete-placeholder" on:click={deletePlaceholder}>{_("delete_placeholder")}</button>
  {/if}
  {#if !mapIsLoad}
    <span>{_("loading_map")}</span>
  {/if}
  <YandexMap
    {apiKey}
    center={activeLocation && activeLocation.coords ? activeLocation.coords : center}
    editablePlacemark={activeLocation && activeLocation.coords ? activeLocation.coords : null}
    {customIcon}
    editable = true
    on:newPlacemark={(e) => savePlacemark(e.detail)}
    on:load={() => mapIsLoad = true}
  />
</div>

{#if showTours}
  <div class="all-tours-block">
    <button on:click={() => showTours = false}/>
    <div class="all-tours">
      <h4>{_("tours")}</h4>
      <div class="tours">
        {#each allTours as tour}
          <AdminCard {...tour} {_} on:change={addTour} isChange={true}/>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showExcursions}
  <div class="all-tours-block">
    <button on:click={() => showExcursions = false}/>
    <div class="all-tours">
      <h4>{_("excursions")}</h4>
      <div class="tours">
        {#each allExcursions as excursion}
          <AdminCard {...excursion} {_} on:change={addExcursion} isChange={true}/>
        {/each}
      </div>
    </div>
  </div>
{/if}

<HotelsWindow 
  {showHotels} 
  {allHotels} 
  {fetcher} 
  {hotelsCount} 
  locations={newLocations} 
  on:change={addHotel}
  {_}
  on:closeWindow={() => showHotels = false}
/>