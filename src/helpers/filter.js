import { parseDate } from "./parsers.js";

export {
    parseFilterDataForAdmin,
    parseFilterData,
    setFilterData,
    setFilterFromUrl,
    showActiveFilters,
    parseFilterDataForHotels,
    setNewLocationsData,
    createFilterWithSlug,
    setFilterBySlug,
    createSlugByFilter
}

function setFilterData(res) {
    let data = [];

    for (let i = 0; i < res.length; i++) {
        data.push({
            id: res[i].id,
            value: res[i].name,
            active: false,
            slug: res[i].slug
        });
    }

    return data;
}

function setNewLocationsData(locations){
    let data = [];
    for(let location of Object.assign([], locations)){
        location = Object.assign({}, location);
        location.value = location.name;
        delete location.name;
        data.push({
            ...location,
            active: false
        })
    }
    
    return data;
}

function parseFilterData(filter, isCreate) {
    let params = {
        filter: "",
    },
    compiliationsParams = {
        filter: "",
    },
    arrData;

    const { dateStart, dateEnd } = changeDateByFilter(filter.date);

    if (dateStart) 
        params.dateStart = compiliationsParams.dateStart = dateStart;

    if(dateEnd)
        params.dateEnd = compiliationsParams.dateEnd = dateEnd;


    arrData = getActiveOption(filter.locations);
    if (arrData.length) 
        params.locations = compiliationsParams.locationIds = arrData;
    
    arrData = getActiveOption(filter.companions);
    if (arrData.length)
        params.companions = arrData;

    arrData = getActiveOption(filter.subjects);
    if (arrData.length){
        params.subjects = compiliationsParams.subjectIds = arrData;
    }
        

    if (filter.price.priceMin.active) params.priceMin = parseInt(filter.price.priceMin.value);
    if (filter.price.priceMax.active) params.priceMax = parseInt(filter.price.priceMax.value);

    return { params, compiliationsParams };
}

function changeDateByFilter(date){
    let dateStart;
    let dateEnd;

    if (date.dateStart.active) 
        dateStart = parseDate(new Date(date.dateStart.value));
    

    if (date.dateEnd.sctive) 
        dateEnd = parseDate(new Date(date.dateEnd.value));

    return {dateStart, dateEnd}
}

function changePriceByFilter(price){
    let priceMin;
    let priceMax;

    if (price.priceMin.active) priceMin = parseInt(price.priceMin.value);
    if (price.priceMax.active) priceMax = parseInt(price.priceMax.value);

    return {priceMax, priceMin}
}

function createFilterWithSlug(filter, fetcher, search){
    let params = { filter: "" }

    const { dateStart, dateEnd } = changeDateByFilter(filter.date);
    const { priceMax, priceMin } = changePriceByFilter(filter.price);

    if(dateStart)   params.dateStart = dateStart;
    if(dateEnd)     params.dateEnd = dateEnd;

    if(priceMin)    params.priceMin = priceMin;
    if(priceMax)    params.priceMax = priceMax;

    if(search)      params.search = $page.query.search;

    const slug =    createSlugByFilter(filter);

    const arrData = getActiveOption(filter.companions);
    if (arrData.length)
        params.companions = arrData;

    if(Object.keys(params).length > 1)   return slug + fetcher.makeQuery({ query: params });
    else                                 return slug;
}

function setFilterBySlug(filter, slug){
    const activeFilters = slug.split("_");

    for(let key of ["locations", "subjects"])
        for(let obj of filter[key])
            for(let activeSlug of activeFilters)
                if(obj.slug === activeSlug)
                    obj.active = true;

    return filter;
}

function createSlugByFilter(filter){
    let activeFilters = [];

    for(let key of ["locations", "subjects"])
        for(let obj of filter[key])
            if(obj.active)
                activeFilters.push(obj.slug);

    return activeFilters.length ? "/" + activeFilters.join("_") : "";
}

function parseFilterDataForAdmin(filter) {

    let params = {
        filter: "",
        allStatuses: ""
    }, arrData;

    if (filter.search.active || filter.search.value.length){
        params.search = encodeURIComponent(filter.search.value);
        filter.search.active = true;
    }

    arrData = getActiveOption(filter.subjects)
    if (arrData.length !== 0) params.subjects = arrData;

    arrData = getActiveOption(filter.locations);
    if (arrData.length !== 0) params.locations = arrData;

    return params;
}

function parseFilterDataForHotels(filter) {

    let params = { filter: "" };
    let arrData;

    if (filter.search.active || filter.search.value.length > 0) params.search = encodeURIComponent(filter.search.value);

    arrData = getActiveOption(filter.locationIds );
    if (arrData.length) params.locationIds = arrData;

    if(Object.keys(params).length === 1)
        params = {};

    return params;
}

function getActiveOption(filter) {
    var data = [];
    for (var i = 0; i < filter.length; i++) {
        if (filter[i].active) data.push(filter[i].id);
    }
    return data;
}

function setFilterFromUrl(params, filter) {
    for (let i = 0; i < params.length; i++) {
        for (let j = 0; j < filter.length; j++) {
            if (parseInt(params[i]) === filter[j].id) {
                filter[j].active = true;
                break;
            }
        }
    }

    return filter;
}

function showActiveFilters(filter) {
    let data = filter;
    if (!Array.isArray(filter)) data = Object.keys(filter);

    for (let i = 0; i < data.length; i++) {
        if (!Array.isArray(filter))
            if (data[i].active)
                return true;
            else
                for (let j = 0; j < data[i].length; j++)
                    if (data[i][j].active)
                        return true;
    }

    return false;
}