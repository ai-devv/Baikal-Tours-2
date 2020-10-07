<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import { parseDate, reverseDate } from "/helpers/parsers.js";
  import { isMobile } from "/helpers/validators.js";
  import { getRundomObjects } from "/helpers/edit.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let actionId = null;
    let locale = session.locale;
    let userId = session.userId;

    const slug = page.params.slug;

    let result_action = await fetcher.get(`/api/actions/${slug}`, {
      credentials: "same-origin"
    });

    if (result_action.ok){
      result_action = result_action.data;
      let locationIds = [];
      actionId = result_action.id;

      if(result_action.excursions.length < 3 || result_action.excursions.length < 3 || result_action.tours.length < 3){
        let findedLocations = [];
        for(let { location_id } of result_action.locations)
          if(findedLocations[location_id] === undefined){
            locationIds.push(location_id);
            findedLocations[location_id] = location_id;
          }
      }

      if(result_action.excursions.length < 3){
        let excursions;
        
        if(locationIds.length){
          excursions = (await fetcher.get(`/api/excursions`, {
            credentials: "same-origin",
            query: {
              filter: "",
              locationIds,
            }
          })).data.filter(el => result_action.excursions.length ? result_action.excursions.some(ex => el.id !== ex.id) : true);
        }
        else
          excursions = (await fetcher.get(`api/excursions`, {
            credentials: "same-origin"
          }))

        result_action.excursions = [...result_action.excursions, ...getRundomObjects(result_action.excursions.length, 3, excursions)];
      }

      if(result_action.tours.length < 3){
        let tours;

        if(locationIds.length){
          tours = (await fetcher.get(`/api/tours`, {
            credentials: "same-origin",
            query: {
              filter: "",
              locationIds,
            }
          })).data.filter(el => result_action.tours.length ? result_action.tours.some(ex => el.id !== ex.id) : true);
        }
        else
          tours = (await fetcher.get(`api/tours`, {
            credentials: "same-origin"
          }))

        result_action.tours = [...result_action.tours, ...getRundomObjects(result_action.tours.length, 3, tours)];
      }

      if(result_action.hotels.length < 3){
        let hotels;

        if(locationIds && locationIds.length){
          hotels = (await fetcher.get(`/api/hotels`, {
            credentials: "same-origin",
            query: {
              filter: "",
              locationIds,
            }
          })).hotels.filter(el => result_action.hotels.length ? result_action.hotels.some(ex => el.id !== ex.id) : true);
        }
        else
          hotels = (await fetcher.get(`api/hotels`, {
            credentials: "same-origin"
          }))

        result_action.hotels = [...result_action.hotels, ...getRundomObjects(result_action.hotels.length, 3, hotels)];
      }

      let firstSimilarDate;
      if(result_action.dates.length) firstSimilarDate = new Date(result_action.dates[0].date_start);
      else firstSimilarDate = new Date();
      firstSimilarDate.setDate(firstSimilarDate.getDate() + 1);
      firstSimilarDate = parseDate(firstSimilarDate);

      let similar_events = (await fetcher.get("/api/actions/", {
        credentials: "same-origin",
        query: {
          filter: "",
          dateStart: firstSimilarDate,
          subjects: [result_action.subjects[0].id],
          count: 2
        }
      })).actions;

      let mobile = isMobile(session["user-agent"]);

      return { result_action, actionId, userId, locale, similar_events, mobile};
    } 

    this.error(404, "page not found");
  }
</script>

<script>
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import { onMount } from "svelte";
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import { parsePrice } from "/helpers/parsers.js";
  import { validateMail, validatePhone } from "/helpers/validators.js";
  import dateToString from "/helpers/dateToString.js";
  import i18n from "/helpers/i18n/index.js";
  import { stores } from "@sapper/app";
  import SimilarEvent from "/components/similar_event.svelte";
  import * as animateScroll from "svelte-scrollto";
  import Carousel from "/components/carousel.svelte";
  import Image from "/components/imageCenter.svelte";
  import BannerBlock from "/components/bannerBlock.svelte";
  import { slide } from "svelte/transition";
  import { fade } from "svelte/transition";
  import isValidActionDate from "/helpers/isValidActionDate.js";
  import YandexMap from "/components/yandexMap/index.svelte";
  import imask from "/helpers/svelte-imask.js";
  import ClickOutside from "/components/clickOutside.svelte";
  import Swiper from "swiper";
  import LoginNotification from "/components/modalWindow.svelte";
  import { goto } from "@sapper/app";
  import InstaCards from "/components/instacards.svelte";

  export let result_action, actionId, userId, locale, similar_events, mobile;

  const fetcher = new Fetcher();
  const { session, page } = stores();
  const _ = i18n(locale);
  const customIcon = {
    iconImageHref: "/img/placeholder-map.svg",
    iconImageSize: [ 30, 42 ],
    iconImageOffset: [ -14, -36 ]
  };
  const apiKey = "c7b75af8-80f3-4ff2-afb6-a05da8ecdeec";

  let response,
    resp,
    second_price,
    userName = "",
    surname = "",
    userPhone = "",
    userMail = "",
    actionsParams,
    start = false,
    vkHref,
    twitterHref = "",
    facebookHref = "",
    initEditor = false,
    registerBlock,
    transfers,
    total,
    initVk = false,
    tickets = [],
    additionals = [],
    ticketsWithCount = [],
    additionalsWithCount = [],
    showBuyWindow = false,
    userDate = "",
    showDateChange = true,
    dates = result_action.dates,
    coords = [],
    requiredField = false,
    visibleDates,
    showDatePicker = false,
    dateInput,
    fullWindowGallary = null,
    fullWindowGallaryBlock,
    showGallary = false,
    priceMin = null,
    priceMax = null,
    reservationId = null,
    mask,
    showNotificationWindow = false,
    showRegisterNotification = false,
    visitCounter = 0,
    instagramName = "";

  $: {
    total = 0;

    for(let ticket of [...ticketsWithCount, ...additionalsWithCount])
      total += ticket.count * ticket.price;
  }

  $: {
    coords = [];
    for(let location of result_action.locations)
      if(location.coords)
        coords.push({
          coords: location.coords
        });
    
    coords = coords;
  } 

  $: {
    result_action;
    changeAllData();
  }

  $: ticketsWithCount = tickets.filter(el => el.count);
  $: additionalsWithCount = additionals.filter(el => el.count);

  $: {
    if(start && !($page.query.window) && !($session.isLogged) && visitCounter >= 3) showNotificationWindow = true;
  }
  
  function checkUserDate() {
    let splitDate = userDate.split(".");
    if((userDate.length !== 10 || splitDate[0] > 31 || splitDate[1] > 12 || splitDate.length < 3) && userDate !== ""){
      alert(_("uncorrect_date_form"))
      return false;
    }

    if(!userDate.length){
      alert(_("required_fields_message"))
      requiredField = true;
      return false;
    }

    let date;

    for(let {date: secondDate, shortDate} of visibleDates){
      if(shortDate === userDate){
        date = secondDate;
        break;
      }
    }

    if( showDateChange){
      
      if( !dates.some(el => isValidActionDate(el, date))){
        alert(_("date_not_correct"))
        return false;
      }
      else{
        showDatePicker = false;
        return true
      }
    }

    return true;
  }

  function changeAllData(){
    userName = $session.name;
    surname = $session.surname;
    userPhone = $session.phone;
    userMail = $session.email;
    tickets = [];
    additionals = [];
    ticketsWithCount = [];
    additionalsWithCount = [];
    showBuyWindow = false;
    userDate = "";
    total = 0;
    showDateChange = true;
    requiredField = false;
    instagramName = "";

    if(result_action.instagram_link){

      if(!result_action.instagram_link.endsWith("/"))
        result_action.instagram_link += "/"

      instagramName = result_action.instagram_link.match(/\.com\/(.*)\/$/)[1];
    }

    transfers = [];
    for(let transfer of result_action.transfers)
      transfers.push(transfer.name);

    for(let ticket of result_action.buyable){
      if(ticket.type === "ticket" && ticket.price < priceMin || !priceMin)
        priceMin = ticket.price;
      if(ticket.type === "ticket" && ticket.price > priceMax || !priceMax)
        priceMax = ticket.price;
    }

    second_price = parsePrice(priceMin, priceMax, _);

    tickets = result_action.buyable.filter(el => el.type === "ticket");
    additionals = result_action.buyable.filter(el => el.type === "additional");

    for(let ticket of result_action.buyable)
      ticket.count = 0;

    if(fullWindowGallary){
      fullWindowGallary.update();
      fullWindowGallary.slideTo(0, 0);
    }

    setRegisterDates();

    if(start){
      setShare();
      startEditor();
    }
    
  }

  onMount(() => {
    actionsParams = localStorage.getItem("actionsParams");
    if (actionsParams === null) actionsParams = "./events";

    fullWindowGallary = new Swiper(fullWindowGallaryBlock, {
      slidesPerView: "auto",
      autoHeight: true,
      centeredSlides: true,
      spaceBetween: 10,
      speed: 750,
      navigation: { 
        nextEl: '.swiper-button-next', 
        prevEl: '.swiper-button-prev' 
      }
    })

    if(!($session.isLogged)){
      if(!localStorage.visitCounter)
        visitCounter = localStorage.visitCounter = 1;
      else
        visitCounter = localStorage.visitCounter++;
    }
    else localStorage.visitCounter = 0;

    start = true;
    if(initEditor)
      startEditor();

    if(initVk)
      startVkShare();

    setShare();
  });

  function setShare(){
    twitterHref = encodeURI(result_action.name + "\n\n" + document.location.href);
    facebookHref = document.location.href;
  }

  function startVkShare(){
    vkHref = VK.Share.button(false, {
      type: "custom",
      text: '<img src="/img/vk-grey.svg"/>'
    });
  }
  
  async function subscribeUser() {

    if(!($session.isLogged)){
      showRegisterNotification = true;
      return;
    }

    requiredField = false;

    let required = [userName, surname, userPhone, userMail];
    for(let req of required)
      if(!req.length){
        alert(_("required_fields_message"))
        requiredField = true;
        return;
      }

    if(result_action.dates.length && !checkUserDate())
      return;
    
    if(!validateMail(userMail)){
      alert(_("uncorrect_mail"))
      requiredField = true;
      return;
    }

    if(tickets.length && !ticketsWithCount.length){
      alert(_("change_one_ticket"))
      return;
    }

    let date;

    for(let {date: secondDate, shortDate} of visibleDates){
      if(shortDate === userDate){
        date = secondDate;
        break;
      }
    }

     (date)

    let reservationData = {
      userId: Number(userId),
      actionId: Number(actionId),
      surname,
      name: userName,
      phone: userPhone,
      email: userMail,
      date: new Date(date)
    }

    let countedTickets = [];
    for(let ticket of [...ticketsWithCount, ...additionalsWithCount])
      countedTickets.push({
        actionBuyableId: ticket.id,
        count: ticket.count
      })

    if(countedTickets.length)
      reservationData.buyable = countedTickets;

    let reservationResult = await fetcher.post(`/api/actionReservations`, reservationData);

    if(reservationResult.ok){
      reservationId = reservationResult.data;
      if(additionalsWithCount.length || ticketsWithCount.length)
        showBuyWindow = true;
      else
        alert(_("action_register_success"))
    }
    else
      alert(reservationResult.message)
  }

  function startEditor(){
    var editorText = new Quill("#description-block",{
      readOnly: true
    })
    
    editorText.setContents(editorText.clipboard.convert(result_action.full_description.replace(/\n/g, "</br>")))
  }

  async function setRegisterDates(){
    let dates = result_action.dates;
    visibleDates = [];

    if(dates && dates.length){
      let dateNow = new Date();
      for(let date of dates){
        let dateStart;
        let dateEnd;
        let dates = date.days;

        if(date.date_start){
          dateStart = new Date(date.date_start);
          dateStart.setHours(date.time_start ? date.time_start.split(":")[0] : 23)
          dateStart.setMinutes(date.time_start ? date.time_start.split(":")[1] : 59)
          dateStart.setSeconds(date.time_start ? date.time_start.split(":")[2] : 59)
        }
        if(date.date_end){
          dateEnd = new Date(date.date_end);
          dateEnd.setHours(date.time_end ? date.time_end.split(":")[0] : 23)
          dateEnd.setMinutes(date.time_end ? date.time_end.split(":")[1] : 59)
          dateEnd.setSeconds(date.time_end ? date.time_end.split(":")[2] : 59)
        }
        
        if(dateStart && dateEnd && dateStart === dateEnd){
          if(visibleDates.indexOf(dateStart) === -1)
            visibleDates.push(dateStart)
        }
        else if(dateStart !== dateEnd && dateStart && dateEnd && dateEnd > dateNow){
  
          let fullStartDate = new Date(dateStart);
          let fullEndDate = new Date(dateEnd);
  
          if(fullStartDate < new Date())
            fullStartDate = dateNow;
          let i = 0;
          
          while(fullStartDate <= fullEndDate && i <= 100){
            
            if(checkDateByDay(fullStartDate, dates, visibleDates)){
              visibleDates.push({
                date: fullStartDate.toISOString(),
                shortDate: reverseDate(parseDate(fullStartDate))
              });
              i++;
            }
            
            fullStartDate.setDate(fullStartDate.getDate() + 1);
          }
        }
        else if(dateStart && !dateEnd){
          let fullStartDate = new Date(dateStart);
          if(fullStartDate < dateNow)
            fullStartDate = new Date(dateNow);
  
          let i = 0;
          while(i <= 100){
            if(checkDateByDay(fullStartDate, dates, visibleDates)){
              visibleDates.push({
                date: fullStartDate.toISOString(),
                shortDate: reverseDate(parseDate(fullStartDate))
              });
              i++;
            }
              
            fullStartDate.setDate(fullStartDate.getDate() + 1);
          }
        }
        else if(!dateStart && dateEnd && dateEnd >= dateNow){
          let secondDate = new Date(dateNow);
          let i = 0;
  
          while(i <= 100 && dateEnd > secondDate){
  
            if(checkDateByDay(secondDate, dates, visibleDates)){
              visibleDates.push({
                date: secondDate.toISOString(),
                shortDate: reverseDate(parseDate(secondDate))
              });
              i++;
            }
            
            secondDate.setDate(secondDate.getDate() + 1);
          }
        }
        else if(!dateStart && !dateEnd && dates){
          let secondDate = new Date(dateNow);
          let i = 0;
  
          while(i <= 100){
            if(checkDateByDay(secondDate, dates, visibleDates)){
              visibleDates.push({
                date: secondDate.toISOString(),
                shortDate: reverseDate(parseDate(secondDate))
              });
              i++;
            }
              
            secondDate.setDate(secondDate.getDate() + 1);
          }
        }
      }
    }

    visibleDates = visibleDates.sort((a, b) => {
      if(a.shortDate < b.shortDate)       return 0;
      else if(a.shortDate > b.shortDate)  return 1;

      return 0;
    });

    if(visibleDates.length <= 1 || !result_action.buyable.length){
      userDate = visibleDates.length ? visibleDates[0].shortDate : new Date();
      showDateChange = false;
    }
  }

  function checkDateByDay(date, dates, allDates){
    let bl = dates ? false : true;
    if(dates)
      for(let day of dates){
        let dateDay = date.getDay();
        if(dateDay === 0) dateDay = 6
        else dateDay--;
        if(dateDay === day){
          bl = true;
          break;
        }
      }

    
    if(bl){
      if(allDates.indexOf(date.toISOString()) === -1)
        return true;
    }
    return false;
  }

  function showGallaryWindow(el){
    fullWindowGallary.update();
    fullWindowGallary.slideTo(el, 0);
    showGallary = true;
  }

  async function payTickets(){
    const payHref = await fetcher.post(`/api/actionReservations/${reservationId}/pay`, {
      userId
    })

    if(payHref.ok)
      document.location.href = payHref.data;
    else
      alert(_("transaction_error"))
  }

  function showLoginForm(){
    goto(`${$page.path}?window=login`)
    showNotificationWindow =    false;
    showRegisterNotification =  false;
  }

  function showRegisterForm(){
    goto(`${$page.path}?window=register`)
    showNotificationWindow =    false;
    showRegisterNotification =  false;
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .insta-block{
    margin: 80px auto 0;
    width: 1060px;

    @media only screen and (max-width: 768px){
      width: 100%;
      margin: 60px auto 0;
    }
  }

  .head-price{
    margin-top: 40px;
    font-size: 24px;
    color: white;

    > span{
      color: inherit;
      font-weight: 600;
    }
  }

  .form-width {
    margin: 15px auto 15px;
    font-size: $Medium_Font_Size;
  }

  h1 {
    font-weight: bold;
    font-size: $UltraBig_Font_Size;
  }

  .italic-bold {
    font-weight: bold;
    font-style: italic;
    font-size: $LowBig_Font_Size;
    margin-top: 32px;
  }

  .italic {
    margin-top: 20px;
    font-style: italic;
  }

  #description-block {
    margin-top: 35px;
  }

  .register-center{
    display: flex;
    justify-content: center;
  }

  .register-form {
    margin-top: 100px;
    background: #F5F7FA;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 20px;
    box-sizing: border-box;
    display: inline-block;
    position: relative;

    & > hr{
      border-color: #E7E7E7;
      margin: 0;
    }

    & > .register-info-blocks {
      display: inline-flex;
      padding: 85px 50px 30px;

      & > .inputs-block {
        width: 340px;

        & > .input-block:not(:first-child) {
          margin-top: 30px;
        }

        & > .input-block{
          position: relative;

          & > :global(input) {
            background: white;
            box-sizing: border-box;
            box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
            border-radius: 100px;
            width: 100%;
            padding: 15px 50px 15px 20px; 
            box-sizing: border-box;
            width: 100%;
            font-size: $Big_Font_Size;
          }

          & > .img-block{
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            border-radius: 100px;
            background: $Orange_Gradient;
            box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.45);

            & > img{
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              height: 15px;
            }
          }
        }
      }

      & > .register-categoty-block {
        padding-left: 20px;
        margin-left: 20px;
        width: 360px;
        box-sizing: border-box;

        & > h2 {
          margin: 0 0 38px 0;
          font-size: 24px;
          font-family: $Playfair;
          text-align: center;
        }

        & .ticket-block {
          display: flex;
          justify-content: space-between;
          align-items: center;

          & > *{
            font-size: 24px;
          }

          &:not(:first-child){
            margin-top: 25px;
          }

          & .ticket-price {
            color: $Blue;
          }

          & > .counter {
            display: flex;
            align-items: center;

            & > button {
              width: 30px;
              height: 30px;
              border-radius: 100px;
              font-size: $Big_Font_Size;

              &:first-child{
                background: linear-gradient(193.13deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
              }

              &:last-child{
                background: $Orange_Gradient;
                box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
              }
            }

            & > *:not(:first-child) {
              margin-left: 20px;
            }
          }
        }
      }
    }
  }

  label {
    font-weight: bold;
  }

  .register-button {
    display: block;
    background: #117BCD;
    box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.15);
    border-radius: 100px;
    padding: 15px 50px;
    color: white;
    font-size: $LowBig_Font_Size;
    transition: 0.3s;

    &:hover{
      background: #0052B4;
    }
  }

  ul {
    list-style-type: none;
  }

  .main-carousel {
    margin-top: 90px;
  }

  .carousel-cell {
    height: 350px;
    width: 500px !important;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .contact-ul {
    margin-top: 10px;

    & > li {
      margin-top: 5px;
    }
  }

  .main-block {
    min-height: 650px;
    position: relative;
    background: linear-gradient(360deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
    overflow: hidden;

    & > .form-width {
      padding-top: 0px;
      padding-right: 480px;
      box-sizing: border-box;
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);

      & > h1 {
        font-size: 36px;
        font-family: $Playfair;
        margin-top: 20px;
        color: white;
      }

      & > button{
        margin-top: 20px;
      }
    }

    & > :global(img) {
      z-index: -1;
    }
  }

  h2 {
    margin: 20px 0 25px;
  }

  .total-price {
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #4D5062;

    & > span{
      color: $Blue;
      font-size: 26px;
    }
  }

  ul.italic > li:not(:first-child) {
    margin-top: 15px;
  }

  .partners-block{
    margin-top: 100px;

    & > h3{
      font-family: $Playfair;
      margin: 0;
      font-size: $UltraBig_Font_Size;
      color: #34353F;
    }
  }

  .partners-carousel {
    margin-top: 40px;

    & :global(.flickity-viewport){
      overflow: visible;
    }

    & .partner-container > span{
      color: #C1C1C1;
      font-size: $LowBig_Font_Size;
    }

    & .partner-block {
      text-align: center;
      width: 280px;
      height: 180px;
      background: white;
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      position: relative;
      margin-bottom: 15px;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 80%;
        max-height: 80%;
      }

      &:not(:first-child){
        margin-left: 25px;
      }
    }
  }

  .contacts-and-place {
    display: flex;
    margin-top: 45px;
    justify-content: space-between;

    & > .contacts-block {
      padding-left: 20px;
      box-sizing: border-box;
      width: calc(100% - 800px - 50px);
      padding: 0;
      margin-top: 0;

      & h2 {
        font-family: $Playfair;
        margin: 0;
        margin-top: -10px;
        color: #34353F;
        font-size: $UltraBig_Font_Size;
      }

      & li {
        margin: 0 !important;
      }
    }

    & > .map-block {

      & > .map {
        width: 800px;
        height: 350px;
        background: $Gray;
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }
    }
  }

  .share {
    display: flex;
    align-items: center;
    font-family: $Playfair;
    font-size: $Big_Font_Size;
    margin-top: 35px;
    font-weight: bold;
    
    & :global(img) {
      margin-left: 20px;
      height: 20px;
    }

    & :global(img:first-child){
      margin-left: 30px;
    }
  }

  .banners-block {
    margin-top: 100px;

    & > .banners-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      & > h2 {
        font-size: $UltraBig_Font_Size;
        color: #34353F;
        font-family: $Playfair;
        margin: 0;
      }

      & > a{
        font-size: $Big_Font_Size;
        color: #34353F;
        text-decoration: underline;
      }
    }

    & > .banners {
      display: grid;
      grid-template-columns: repeat(3, 390px);
      justify-content: space-between;
      margin-top: 40px;
    }
  }

  hr {
    border-top: 1px solid black;
    margin: 50px 0 30px;
  }

  .auto-height {
    min-height: auto !important;
  }

  .similar-events-block {
    margin-top: 100px;
    margin-bottom: 100px;

    & > h2 {
      margin: 0;
      font-size: $UltraBig_Font_Size;
      font-family: $Playfair;
    }

    & > .similar-events {
      margin-top: 45px;
      display: grid;
      grid-template-columns: repeat(2, auto);
      justify-content: space-between;
    }
  }

  .footer-banners {
    background: $Light_Gray;
  }

  .form-width.banners-block {
    text-align: left;
    margin: auto;
    padding: 25px 0 20px;

    & .banners {
      & > div {
        text-align: left;
        font-style: italic;
        font-size: $LowBig_Font_Size;
      }
    }
  }

  .little-margin {
    margin: 25px 0 0 0;
  }

  :global(.ql-editor){
    padding: 0 !important;
  }

  .subjects-block{
    display: flex;
    align-items: center;

    & > li{
      display: flex;
      align-items: center;
      color: white;
      font-size: $Big_Font_Size;
    }

    & .point{
      width: 7px;
      height: 7px;
      border-radius: 10px;
      border: 1px solid white;
      box-sizing: border-box;
      margin: 0 15px;
    }
  }

  .locations-block{
    margin-top: 20px;

    & li{
      color: white;
      font-weight: bold;
      font-size: $Big_Font_Size;

      &:not(:first-child){
        margin-top: 5px;
      }
    }
  }

  .short-description{
    width: 65%;
    font-size: 20px;
    font-weight: bold;
    margin-top: 50px;
    color: #5A5C6B;
  }

  #description-block{
    width: 800px;
    margin: 140px auto 0;
    font-size: 20px;
  }

  .contacts-block{
    background: #F5F5F5;
    padding: 100px 0;
    margin-top: 100px;

    & > .form-width{
      min-height: auto;
    }
  }

  .line {
    display: flex;
    align-items: flex-start;
    margin-top: 30px;

    & > .img-block {
      margin-right: 15px;
      min-width: 30px;
      max-width: 30px;
      height: 30px;
      background: linear-gradient(315deg, #F8A822 26.87%, #FCD41F 91.87%);
      position: relative;
      border-radius: 100px;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 15px;
      }

      &.vk{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.facebook{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.twitter{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.instagram{
        background: linear-gradient(315deg, #D33D93 26.87%, #FFCA52 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }
    }

    & li{
      font-size: $Big_Font_Size;
      color: #34353F;
      width: 300px;

      & > a{
        color: #348EE0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 300px;
        display: block;
      }
    }

    &.contacts-flex{
      align-items: center;
    }
  }

  .final-price-block{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 30px 50px 60px;

    & > *{
      width: 340px;
    }

    & > button{
      margin-top: 30px;
    }
  }

  .only-inputs{
    padding-top: 0px !important;
  }

  .already-tickets-block{
    position: fixed;
    min-height: 100vh;
    top: 0;
    left: 0;
    z-index: 5;
    box-sizing: border-box;
    width: 100%;
    overflow-y: scroll;

    & > button{
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 0;
      background: #00000088;
    }
  }

  .already-tickets{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    z-index: 1;

    & > div{
      padding: 50px;
      background: #F8F9FB;
      border-radius: 10px;
      max-height: 800px;
      overflow: auto;
      box-sizing: border-box;
      -ms-overflow-style: none;
      scrollbar-width: none;

      & *{
      font-size: 18px;
      }

      & > h3{
        font-size: 24px;
        color: #4D5062;
        text-align: center;
        width: 75%;
        margin: 0 auto;
      }

      & > hr{
        width: calc(100% + 100px);
        margin-left: -50px;
        border: 1px solid #E7E7E7;
        margin: 40px 0 30px -50px;
      }

      & > .user-data-block{
        margin-top: 20px;

        & > .user-data{

          & > h5{
            font-size: $Big_Font_Size;
            color: #4f4f4f;
            font-weight: normal;
          }

          & > span{
            margin-top: 20px;
            display: block;
            font-weight: 600;
          }

          &:not(:first-child){
            margin-top: 30px;
          }
        }
      }

      & > .user-tickets-block{
        & > h4{
          font-family: $Playfair;
          font-size: 20px;
          color: #4f4f4f;
        }

        & > .additional-header{
          margin-top: 30px;
        }

        & > table{
          margin-top: 10px;
          width: 100%;

          & > tr{

            & > td:first-child{
              color: #4f4f4f;
            }

            & > td:last-child{
              text-align: right;
              color: $Blue;
              font-weight: 600;
            }

            & > td{
              padding-top: 20px;
            }
          }
        }
      }

      & > .user-total{
        display: flex;
        align-items: center;
        justify-content: space-between;

        & > .user-total-text{
          font-weight: 600;
          font-size: 24px;
          color: #4f4f4f;
        }

        & > .blue{
          color: $Blue;
          font-size: 20px;
          font-weight: 600;
        }
      }

      & > .buttons-block > button{
        display: block;
        border-radius: 100px;
        font-size: $LowBig_Font_Size;
        width: 100%;
        padding: 18px 0;
        font-weight: 600;

        &.blue-button{
          background: $Blue_Gradient;
          color: white;
          box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
          margin-top: 30px;
        }

        &.back{
          background: linear-gradient(181.91deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
          box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;

          & > img{
            width: 20px;
            transform: rotate(180deg);
            margin-right: 10px;
          }
        }
      }
    }
  }

  .already-tickets > div::-webkit-scrollbar{
    display: none;
  }

  .close-window{
    position: absolute;
    width: 45px;
    height: 45px;
    right: calc(45px / 2 * -1);
    top: calc(45px / 2 * -1);
    background: #F5F5F5;
    border-radius: 100px;
  
    & > img{
      width: 15px;
    }
  }

  .organizer-payment{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #F5F7FA;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 10px;
    padding: 50px 140px 50px 50px;
    margin-top: 100px;
    box-sizing: border-box;

    & > span{
      font-size: 24px;
      font-weight: bold;
      font-family: $Playfair;
      display: block;
      width: 565px;
    }

    & > .organizer-site{
      display: flex;
      align-items: center;

      & > .image{
        width: 30px;
        height: 30px;
        border-radius: 100px;
        background: $Orange_Gradient;
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.45);
        position: relative;

        & > img{
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 15px;
        }
      }

      & > a{
        color: $Blue;
        margin-left: 15px;
        display: block;
        max-width: 250px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .hideMap{
    flex-direction: column;
    width: 400px;
    margin: 0 auto;

    & > .contacts-block{
      width: 100%;
    }
  }

  .map-without-coords{
    margin-left: -10px;

    & > h3{
      position: static !important;
      margin-top: 7px;
      border-radius: 10px !important;
      max-width: none !important;
      box-sizing: border-box;
      display: inline-block;
    }
  }

  .location-block {
    
    & > h3{
    position: absolute;
    top: 30px;
    left: 0;
    background: linear-gradient(182.54deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
    border-radius: 0px 10px 10px 0px;
    padding: 15px 20px;
    max-width: 425px;
    z-index: 2;
    font-size: $Big_Font_Size;
    font-family: $Playfair;
    }
  }

  .requiredField{
    
    & > input{
      border: 1px solid #ED2D33aa;
      box-sizing: border-box;
    }

    &:before{
      display: block;
      content: "*";
      color: #ED2D33aa;
      position: absolute;
      top: 50%;
      left: -30px;
      transform: translateY(-50%);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  }

  .date-picker{

    & > input{
      position: relative;
      z-index: 2;
      background: transparent !important;
      box-shadow: none !important;
    }

    & > .img-block{
      z-index: 3;
    }

    & > .all-dates{
      position: absolute;
      top: 0;
      left: 0;
      background: white;
      border-radius: 25px;
      padding-top: 51px;
      z-index: 1;
      width: 100%;
      box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
    }
  }

  .date-list{
      max-height: 120px;
      overflow: auto;

      & button{
        padding: 7px 20px;
        font-size: $Big_Font_Size;
        color: #434343;

        &:first-child{
          padding-top: 0;
        }

        &:last-child{
          padding-bottom: 15px;
        }
      }
  }

  .dates-block{
    margin-top: 20px;

    li{
      color: white;
      font-size: $Big_Font_Size;
      font-weight: 600;

      > time{
        color: inherit;
      }

      &:not(:first-child){
        margin-top: 5px;
      }
    }
  }

  .gallary-window{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #ffffff99;
    z-index: 5;
    visibility: hidden;
    opacity: 0;
    transition: 0.3s;

    > button:not(.gallary-cross){
      width: 100%;
      height: 100vh;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }

    > .gallary-block{
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      max-height: 80vh;
      width: 100%;
      display: flex;
      align-items: center;
      z-index: 2;

      > .swiper-wrapper{
        align-items: center !important;
      }

      img{
        max-width: 70%;
        height: 80vh;
        width: auto !important;
      }
    }
  }

  .showGallary{
    visibility: visible;
    opacity: 1;
  }

  .gallary-cross{
    position: absolute;
    top: 30px;
    right: 30px;
    z-index: 2;

    > img{
      width: 40px;
    }
  }

  .register-header{
    margin-top: 90px;
    font-size: $UltraBig_Font_Size;
    font-family: $Playfair;
  }

  @media only screen and (max-width: 768px) {
    h1 {
      font-size: $Big_Font_Size;
    }

    .gallary-block img{
      width: 80% !important;
      max-width: auto !important;
      height: auto !important;
      max-height: 80vh !important;
    }

    .gallary-cross{
      top: 10px;
      right: 10px;

      > img{
        width: 20px;
      }
    }

    .info-block {
      flex-direction: column-reverse;
    }

    #description-block {
      padding: 0;
    }

    .left-side {
      margin-top: 30px;
    }

    .register-form {
      width: 100%;
      padding: 30px 50px;
    }

    .main-block > .form-width{
      width: 100%;
      padding: 190px 15px 85px;

      & > h1{
        font-size: 24px;
      }

      & li{
        font-size: $LowBig_Font_Size;

        & > .point{
          width: 5px;
          height: 5px;
        }
      }

      & > button{
        width: 100%;
      }
    }

    .short-description{
      width: 100%;
      font-size: $Big_Font_Size;
    }

    .carousel-cell{
      width: 245px !important;
      height: 190px;
    }

    .main-carousel{
      margin-top: 40px;
    }

    #description-block{
      width: 100%;
      margin: 50px 0 0 0;
      font-size: $Medium_Font_Size;
    }

    .partners-block{
      margin-top: 60px;

      & > h3{
        font-size: 24px;
      }
    }

    .partner-block{
      width: 145px !important;
      height: 90px !important;
      margin-left: 0 !important;
    }

    .register-header{
      margin-top: 30px;
      font-size: 24px;
      font-family: $Playfair;
    }

    .contacts-block{
      padding-top: 40px;
      width: 100%;
      padding-bottom: 30px;

      & > .contacts-and-place{
        flex-direction: column;
        justify-content: flex-start;
        padding: 0 15px;
        margin-top: 0;
        width: 100%;

        & > .contacts-block{
          padding-top: 0;
          padding-bottom: 0;
          width: 100%;
          margin-top: 0;

          & h2{
            font-size: 24px;
            margin: 0;
          }

          & .line{
            & > div{
              min-width: 25px;
              max-width: 25px;
              height: 25px;

              & > img{
                width: 12px;
              }
            }

            & li{
              font-size: $Medium_Font_Size;

              & > a{
                width: 240px;
              }
            }
          }
        }

        & > .map-block{
          width: 100%;
          margin-top: 30px;

          & > .map{
            width: 100%;
            height: 210px;

            & h3{
              font-size: $Medium_Font_Size;
              padding: 10px 15px;
            }
          }

          & > .share{
            font-size: $Medium_Font_Size;
          }
        }
      }
    }

    .register-form{
      margin-top: 30px;
      padding: 35px 15px;

      & > .register-info-blocks{
        flex-direction: column;
        padding: 0;
        width: 100%;

        & > div{
          padding: 0 !important;
          min-width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          
          &:not(:first-child){
            margin-top: 40px;
          }
        }

        & input{
          font-size: $Medium_Font_Size;
        }
        
        & h2{
          font-size: $Big_Font_Size;
        }

        & .ticket-block > *{
          font-size: $Big_Font_Size !important;
        }

      }

      & > hr{
        margin-top: 30px;
      }

      & > .final-price-block{
        padding: 0;
        margin-top: 30px;

        & > button{
          width: 100%;
          font-size: $Big_Font_Size;
        }

        & > .total-price{
          width: 100%;
          font-size: 20px;

          & > span{
            font-size: inherit;
          }
        }
      }
    }

    .banners-block{
      margin-top: 60px;

      & > .banners-info{
        flex-direction: column;

        & > *{
          width: 100%;
        }

        & > a{
          margin-top: 10px;
          font-size: $Medium_Font_Size;
        }

        & > h2{
          font-size: 24px;
        }
      }

      & > .banners{
        overflow-x: scroll;
        grid-column-gap: 10px;
        justify-content: left;
        grid-template-columns: repeat(3, 210px);
      }
    }

    .similar-events-block{
      margin-top: 60px;

      & > h2{
        font-size: 24px;
      }

      & > .similar-events{
        margin-top: 20px;
        grid-template-columns: repeat(1, 100%);
        grid-row-gap: 20px;
      }
    }

    .form-width{
      overflow: hidden;
    }

    .already-tickets{
      width: calc(100% - 30px) !important;

      & > div{
        padding: 40px 20px !important;
        max-height: calc(100vh - 80px) !important;

        & > h3{
          width: 100% !important;
        }

        & > hr{
          width: calc(100% + 40px) !important;
          margin-left: -20px !important;
        }
      }
    }

    .organizer-payment{
    padding: 30px 15px;
    margin-top: 60px;
    box-sizing: border-box;
    flex-direction: column;
    width: 100%;
    align-items: flex-start;

    & > span{
      font-size: $Big_Font_Size;
      width: 100%;
    }

    & > .organizer-site{
      margin-top: 30px;

      & > .image{
        width: 25px;
        height: 25px;

        & > img{
          width: 12px;
        }
      }

      & > a{
        margin-left: 20px;
        max-width: calc(100% - 45px);
      }
    }
  }

  .map-without-coords {
    margin-left: 0;

    & > h3{
      margin-top: 20px !important;
    }
  }

  .hideMap > .map-block{
    margin-top: 0 !important;
  }

  .requiredField{
    &:before{
      content: "*";
      left: -20px;
    }
  }
  }
</style>

<svelte:head>
  <title>{result_action.title === null ? result_action.name : result_action.title} | {_("full_site_name")}</title>

  <script
    type="text/javascript"
    src="https://vk.com/js/api/share.js?95"
    charset="windows-1251" on:load={() => {
      initVk = true;
      if(start)
        startVkShare();
    }} />

  <script src="//cdn.quilljs.com/1.3.6/quill.js" on:load={() => {
    initEditor = true;
    if(start)
      startEditor()
  }} />
  <link href="//cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
  <meta name="description" content={result_action.short_description}>
</svelte:head>

<Header {locale} transp={true}/>
<!-- <BreadCrumbs
  path={[{ name: _('event_catalog'), url: actionsParams }, { name: result_action.name, url: './action?id=' + actionId }]} /> -->
<div itemscope itemtype="http://schema.org/Event">
  <div
    class="main-block">
    {#if result_action.images.length && result_action.images.filter(el => el.is_main)[0]}
      <Image
        src={result_action.images.filter(el => el.is_main)[0].image_url}
        alt={result_action.alt || result_action.name} />
    {/if}
    <div class="form-width">
      {#if result_action.subjects.length > 0}
        <ul class="subjects-block">
          {#each result_action.subjects as subjects, i}
            <li>{subjects.name}
              {#if result_action.subjects.length !== i + 1}
                <div class="point" />
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
      <h1 itemprop="name">{result_action.name}</h1>
      <div class="locations-block">
        {#if result_action.locations && result_action.locations.length > 0}
          <ul>
            {#each result_action.locations as location}
              <li>
                {location.name + (location.address === null ? '' : ', ' + location.address)}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      {#if result_action.dates}
        <div class="dates-block">
          <ul>
            {#each result_action.dates as date}
              <li>
                <time itemprop="startDate" datetime={parseDate(new Date(date.date_start ? date.date_start : (date.date_end ? date_end : "")))}>{dateToString(date, _)}</time>
              </li>
            {/each} 
          </ul>
        </div>
      {/if}
      <div class="head-price" itemscope itemprop="offers" itemtype="http://schema.org/Offer">
        <span>{second_price === _("free") ? second_price : `${second_price}${_("rub")}`}</span>
        <meta itemprop="price" content={priceMin}>
        {#if priceMin}
          <meta itemprop="priceCurrency" content="RUB">
        {/if}
      </div>
      <button class="register-button" on:click={() => {
        animateScroll.scrollTo({offset: registerBlock.offsetTop - 150, duration: 1500})
      }}>{_("register")}</button>
    </div>

  </div>
  <div class="form-width">
    <!-- <p class="italic-bold">{result_action.tagline}</p> -->
    <p class="short-description" itemprop="description">{result_action.short_description}</p>

    {#if result_action.images.length}
      <div class="main-carousel">
        <Carousel data={{slidesPerView: 'auto', preloadImages: "false", centeredSlides: true, spaceBetween: 25, speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, initialSlide: 1}}
        mainSlide={1}
        carouselData={result_action.images}>
          {#each result_action.images as img, i}
            <button class="carousel-cell swiper-slide" on:click={() => showGallaryWindow(i)}>
              <Image src={img.image_url} alt={"img"}/>
            </button>
          {/each}       
        </Carousel>
      </div>
    {/if}

    <div id="description-block"></div>

    {#if result_action.instagram_widget_is_show && instagramName && $page.query.iwis === "true"}
      <div class="insta-block">
        <InstaCards
          header      ={result_action.instagram_widget_title}
          userName    ={instagramName}
        />
      </div>
    {/if}

    {#if result_action.partners.length > 0}
      <div class="partners-block">
        <h3>{_('action_partners')}</h3>

        <div class="partners-carousel">
          <Carousel data={{slidesPerView: 'auto', spaceBetween: (mobile ? 10 : 25), speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}}
          carouselData={result_action.partners}>
            {#each result_action.partners as partner}
            <div class="partner-container swiper-slide">
              <div class="partner-block">
                <img
                  src={partner.image_url}
                  alt={partner.name === null ? 'partner' : partner.name} />
              </div>
              <span>{partner.name}</span>
            </div>

            {/each}
          </Carousel>
        </div>
      </div>
    {/if}
  </div>

  <div class="contacts-block">
    <div class="form-width contacts-and-place" class:hideMap={!coords.length}>
      <div class="contacts-block">
        <div class="contacts">
          <h2>{_('contacts')}</h2>

            <div class="line">
              <div class="img-block">
                <img src="/img/pancil.png" alt="phone">
              </div>
              <ul> 
                <li>
                  {result_action.organizer_name}
                </li>
              </ul>
            </div>

            {#if result_action.locations && result_action.locations.length && !coords.length}
              <div class="location-block map-without-coords">
                <h3>{_('venue')}: 
                {#each result_action.locations as location}
                  <span>
                    {location.name + (location.address === null ? '' : ', ' + location.address) + "\n"}
                  </span>
                {/each}
                </h3>
              </div>
            {/if}
            <div class="organizationInfo">
            {#if result_action.emails !== null}
            <div class="line" class:contacts-flex={result_action.emails.length > 0}>
              <div class="img-block">
                <img src="/img/mail.svg" alt="email">
              </div>
              <ul> 
                {#each result_action.emails as email}
                  <li>
                    {email}
                  </li>
                {/each}
              </ul>
            </div>
            {/if}

            {#if result_action.phones !== null}
            <div class="line" class:contacts-flex={result_action.phones.length > 0}>
              <div class="img-block">
                <img src="/img/phone-call.svg" alt="phone">
              </div>
              <ul> 
                {#each result_action.phones as phone}
                  <li>
                    {phone}
                  </li>
                {/each}
              </ul>
            </div>
            {/if}

            {#if result_action.websites !== null}
            <div class="line contacts-flex">
              <div class="img-block">
                <img src="/img/internet.svg" alt="site">
              </div>
              <ul>
                <li>
                  <a href={result_action.websites[0]} target="_blank">
                    {result_action.websites[0]}
                  </a>
                </li>
              </ul>
            </div>
            {/if}

            {#if result_action.vk_link !== null}
              <div class="line contacts-flex">
                <div class="img-block vk">
                  <img src="/img/vk-white.svg" alt="vk">
                </div>
                <ul>
                  <li>
                    <a href={result_action.vk_link} target="_blank">{result_action.vk_link}</a>
                  </li>
                </ul>
              </div>
            {/if}

            {#if result_action.instagram_link !== null}
              <div class="line contacts-flex">
                <div class="img-block instagram">
                  <img src="/img/insta-white.svg" alt="instagram">
                </div>
                <ul>
                  <li>
                    <a href={result_action.instagram_link} target="_blank">{result_action.instagram_link}</a>
                  </li>
                </ul>
              </div>
            {/if}

            {#if result_action.facebook_link !== null}
              <div class="line contacts-flex">
                <div class="img-block facebook">
                  <img src="/img/facebook-white.svg" alt="facebook">
                </div>
                <ul>
                  <li>
                    <a href={result_action.facebook_link} target="_blank">{result_action.facebook_link}</a>
                  </li>
                </ul>
              </div>
            {/if}

            {#if result_action.twitter_link !== null}
              <div class="line contacts-flex">
                <div class="img-block twitter">
                  <img src="/img/twitter.svg" alt="twitter">
                </div>
                <ul>
                  <li>
                    <a href={result_action.twitter_link} target="_blank">{result_action.twitter_link}</a>
                  </li>
                </ul>
              </div>
            {/if}
            </div>
        </div>
      </div>
      <div class="map-block">
        {#if coords.length}
          <div class="map">
            {#if result_action.locations}
              <div class="location-block">
                <h3>{_('venue')}: 
                {#each result_action.locations as location}
                  <span>
                    {location.name + (location.address === null ? '' : ', ' + location.address)}
                  </span>
                {/each}
                </h3>
              </div>
            {/if}
            <YandexMap
              {apiKey}
              {customIcon}
              center={[ 52.285725130459866, 104.28156685575135 ]}
              staticPlacemarks={coords}
            />
          </div>
        {/if}
        <div class="share">
          {_('share')}
          <div>
            <a
              class="twitter-share-button"
              href="https://twitter.com/intent/tweet?text={twitterHref}"
              target="_blank">
              <img src="/img/twitter-grey.svg" alt="twitter" />
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u={facebookHref}"
              target="_blank">
              <img src="/img/facebook-grey.svg" alt="facebook" />
            </a>
          </div>

          {@html vkHref}
        </div>
      </div>
    </div>
  </div>

  <div class="form-width" bind:this={registerBlock}>
    <h2 class="register-header">{_('email.subscribe.subject')}</h2>
    {#if result_action.organizer_payment && result_action.organizer_payment.length}
      <div class="organizer-payment">
        <span>{_("organizer_payment_message")}</span>
        <div class="organizer-site">
          <div class="image">
            <img src="/img/internet.svg" alt="organizer site">
          </div>
          <a href={result_action.organizer_payment}>{result_action.organizer_payment}</a>
        </div>
      </div>
    {:else}
      <div class="register-center">
        <div class="register-form">
          <div class="register-info-blocks">
            <div class="inputs-block" class:only-inputs={result_action.buyable.length === 0}>
              <div class="input-block" class:requiredField={requiredField && !userName.length}>
                <input type="text" bind:value={userName} placeholder={_("name")}/>
                <div class="img-block">
                  <img src="/img/user-black.svg" alt="user">
                </div>
              </div>
              <div class="input-block" class:requiredField={requiredField && !surname.length}>
                <input type="text" bind:value={surname} placeholder={_("surname")}/>
                <div class="img-block">
                  <img src="/img/user-black.svg" alt="user">
                </div>
              </div>
              <div class="input-block" class:requiredField={requiredField && !userPhone.length}>
                <input
                  type="text"
                  bind:value={userPhone}
                  on:keydown={validatePhone} 
                  placeholder={_("phone")}/>
                <div class="img-block">
                  <img src="/img/phone-call.svg" alt="phone">
                </div>
              </div>
              <div class="input-block" class:requiredField={requiredField && ( !validateMail(userMail) || !userMail.length)}>
                <input type="text" bind:value={userMail} placeholder="e-mail"/>
                <div class="img-block">
                  <img src="/img/mail.svg" alt="e-mail">
                </div>
              </div>
              {#if showDateChange && (tickets.length || additionals.length)}
                <div class="input-block date-picker" class:requiredField={requiredField && !userDate.length}>
                  <input 
                    use:imask={{mask: "00.00.0000" }} 
                    bind:value={userDate} 
                    placeholder="ДД.ММ.ГГГГ" 
                    bind:this={dateInput}
                    on:focus={() => showDatePicker = true}
                    on:init={({detail: mask2}) => mask = mask2}
                    />
                  <div class="img-block">
                    <img src="/img/calendar.png" alt="date">
                  </div>
                  <div class="all-dates">
                    <ClickOutside on:clickoutside={() => showDatePicker = false} exclude={[dateInput]} hideByExclude={false}>
                      {#if showDatePicker}
                        <ul class="date-list" transition:slide>
                          {#each userDate.length === 10 ? visibleDates : visibleDates.filter(({shortDate}) => userDate.length ? shortDate.startsWith(userDate) : true) as {shortDate}}
                            <li>
                              <button on:click={() => {
                                userDate = shortDate;
                                mask.typedValue = userDate;
                                mask.updateValue();
                                showDatePicker = false;
                              }}>
                                {shortDate}
                              </button>
                            </li>
                          {/each}
                        </ul>
                      {/if}
                    </ClickOutside>
                  </div>
                </div>
              {/if}
            </div>
            {#if tickets.length > 0}
              <div class="register-categoty-block">
                <h2>{_('ticket_categories')}</h2>
                <div class="tickets-block">
                  {#each tickets as ticket}
                    <div class="ticket-block">
                      <div>
                        <div>{ticket.name}</div>
                        <div class="ticket-price">{ticket.price} {_('rub')}</div>
                      </div>
                      <div class="counter">
                        <button on:click={() => ticket.count = ticket.count - 1 < 0 ? 0 : ticket.count - 1 }>-</button>
                        <div class="couter-value">{ticket.count}</div>
                        <button on:click={() => ticket.count++}>+</button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
            {#if additionals.length > 0}
              <div class="register-categoty-block">
                <h2>{_('additionally')}</h2>
                <div class="tickets-block">
                  {#each additionals as ticket}
                    <div class="ticket-block">
                      <div>
                        <div>{ticket.name}</div>
                        <div class="ticket-price">{ticket.price} {_('rub')}</div>
                      </div>
                      <div class="counter">
                        <button on:click={() => ticket.count = ticket.count - 1 < 0 ? 0 : ticket.count - 1}>-</button>
                        <div class="couter-value">{ticket.count}</div>
                        <button on:click={() => ticket.count++}>+</button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
          <hr />
          <div class="final-price-block">
            {#if tickets.length || additionalsWithCount.length}
              <div class="total-price">{_("total")}<span>{total} {_('rub')}</span></div>
            {/if}
            <button class="register-button" on:click={subscribeUser}>
              {!tickets.length && !additionalsWithCount.length ? _('register') : _("buy_tickets")}
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if result_action.excursions.length > 0}
    <div class="banners-block">
      <div class="banners-info">
        <h2>{_('excursions')}</h2>
        <a href="https://fanatbaikala.ru/excursions" target="_blank">{_('more_excursions')}</a>
      </div>
      <div class="banners">
        {#each result_action.excursions as excursion}
          <BannerBlock {...excursion} {_} />
        {/each}
      </div>
    </div>
    {/if}

    {#if result_action.tours.length > 0}
    <div class="banners-block">
      <div class="banners-info">
        <h2>{_('tours')}</h2>
        <a href="https://fanatbaikala.ru/tours" target="_blank">{_('more_excursions')}</a>
      </div>
      <div class="banners">
        {#each result_action.tours as tour}
          <BannerBlock {...tour} {_} />
        {/each}
      </div>
    </div>
    {/if}

    {#if result_action.hotels.length}
      <div class="banners-block">
        <div class="banners-info">
          <h2>{_('hotels_nearby')}</h2>
          <a href="https://www.booking.com/discover/region/ru/irkutsk.ru.html" rel="nofollow" target="_blank">{_('more_hotels')}</a>
        </div>
        <div class="banners">
          {#each result_action.hotels as hotel}
            <BannerBlock {...hotel} {_} site={hotel.booking_url} noFollow={true}/>
          {/each}
        </div>
      </div>
    {/if}

    {#if similar_events.length}
      <div class="similar-events-block">
        <h2>{_('similar_events')}</h2>
        <div class="similar-events" itemscope itemtype="http://schema.org/ItemList">
          {#each similar_events as favorite}
            <SimilarEvent {_} {favorite}/>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
<Footer {locale} />

{#if showBuyWindow}
  <div class="already-tickets-block" transition:fade={{duration: 300}}>
    <button on:click={() => showBuyWindow = false}></button>
      <div class="already-tickets">
        <button class="close-window" on:click={() => showBuyWindow = false}><img src="/img/cross.svg" alt="cross" /></button>
        <div>
          <h3>{_("check_intered_data")}</h3>
          <hr>
          <div class="user-data-block">
            <div class="user-data">
              <h5>{_("name")} {_("surname")}</h5>
              <span>{userName} {surname}</span>
            </div>
            <div class="user-data">
              <h5>{_("phone")}</h5>
              <span>{userPhone}</span>
            </div>
            <div class="user-data">
              <h5>E-mail</h5>
              <span>{userMail}</span>
            </div>
          </div>
          <hr />
          {#if ticketsWithCount.length || additionalsWithCount.length}
            <div class="user-tickets-block">
              {#if ticketsWithCount.length}
                <h4>{_("tickets")}</h4>
                <table>
                  {#each ticketsWithCount as ticket}
                    <tr>
                      <td>{ticket.name} - {ticket.count} {_("piece_short")}</td>
                      <td class="blue">{ticket.count * ticket.price} {_("rub")}</td>
                    </tr>
                  {/each}
                </table>
              {/if}
              {#if additionalsWithCount.length}
                <h4 class="additional-header">{_("additionally")}</h4>
                <table>
                  {#each additionalsWithCount as ticket}
                    <tr>
                      <td>{ticket.name} - {ticket.count} {_("piece_short")}</td>
                      <td class="blue">{ticket.count * ticket.price} {_("rub")}</td>
                    </tr>
                  {/each}
                </table>
              {/if}
            </div>
            <hr />
          {/if}
          <div class="user-total">
            <span class="user-total-text">{_("total")}</span>
            <span class="blue">{total} {_("rub")}.</span>
          </div>
          <div class="buttons-block">
            <button class="blue-button" on:click={payTickets}>{_("pay").toUpperCase()}</button>
            <button class="back" on:click={() => showBuyWindow = false}><img src="/img/right-arrow.svg" alt="back">{_("back")}</button>
          </div>
        </div>
    </div>
  </div>
{/if}

<div class="gallary-window" class:showGallary>
  <button on:click={() => showGallary = false}></button>
  <button class="gallary-cross" on:click={() => showGallary = false}> <img src="/img/cross.svg" alt="close"> </button>
  <div class="gallary-block" bind:this={fullWindowGallaryBlock}>
    <div class="swiper-wrapper">
      {#each result_action.images as img}
        <img src={img.image_url} alt="event image" class="swiper-slide">
      {/each}
    </div>
    <div class="swiper-button-prev">
      <img src="/img/next.svg" alt="prev" class="prev">
    </div>
    <div class="swiper-button-next">
      <img src="/img/next.svg" alt="prev" class="next">
    </div>
  </div>
</div>

<LoginNotification 
  header={_("login_or_register")}
  message={_("three_events_message")}
  firstButtonText={_("enter")}
  secondButtonText={_("registration")}
  closable={false}
  {_}
  showWindow={showNotificationWindow}
  on:firstClick={showLoginForm}
  on:secondClick={showRegisterForm}
/>

<LoginNotification
  header={_("login_or_register")}
  message={_("login_to_register_event")}
  firstButtonText={_("enter")}
  secondButtonText={_("registration")}
  {_}
  showWindow={showRegisterNotification}
  on:firstClick={showLoginForm}
  on:secondClick={showRegisterForm}
  on:close={() => showRegisterNotification = false}
/>