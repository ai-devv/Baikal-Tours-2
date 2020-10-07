export {
    parseDate,
    parsePrice,
    parseDateForActiveFilter,
    parsePriceForActiveFilter,
    parseDateForCards,
    parseUrlByPage,
    parseStringToWords,
    reverseDate
}

function parseDate(date) {
    return date.getFullYear() + "-" + dateFormat(parseInt(date.getMonth() + 1) + "") + "-" + dateFormat(date.getDate() + "");
}

function reverseDate(date, changePoints = true){
    date = date.split(changePoints ? "-" : ".").reverse();
    if(changePoints) return date.join(".")
    else return date.join("-")
}

function dateFormat(date) {
    return date.length === 1 ? "0" + date : date;
}

function parseStringToWords(search){
    let str = search.replace(/[^ \u4e00-\u520fa-zа-яё\d]/giu, "");
    str = str.replace(/\s+/g, ",");
    
    return str;
}

function parsePrice(price_min, price_max, _) {
    var second_price;
    if (!price_min && !price_max) second_price = _("free");
    else if (!price_min && price_max)
        second_price = _("to") + " " + price_max;
    else if(price_min === price_max) second_price = price_min
    else second_price = _("from") + " " + price_min;
    return second_price;
}

function parseDateForActiveFilter(filter) {
    let date;

    if (filter.date.dateStart.active && filter.date.dateEnd.active)
        date = filter.date.dateStart.value + " - " + filter.date.dateEnd.value;
    else if (filter.date.dateStart.active) date = filter.date.dateStart.value;
    else if (filter.date.dateEnd.active) date = filter.date.dateEnd.value;
    else date = "";

    return date;
}

function parsePriceForActiveFilter(filter, _) {
    let price;

    if (filter.price.priceMin.active && filter.price.priceMax.active)
        price =
            _("from") +
            " " +
            filter.price.priceMin.value +
            "₽ " +
            _("to") +
            " " +
            filter.price.priceMax.value +
            "₽";
    else if (filter.price.priceMin.active)
        price = _("from") + " " + filter.price.priceMin.value + "₽";
    else if (filter.price.priceMax.active)
        price = _("to") + " " + filter.price.priceMax.value + "₽";
    else price = "";

    return price;
}

function parseDateForCards(date_starts, date_ends, _) {
    let dates = [];

    if (date_starts[0] !== null || date_ends[0] !== null) {
        for (let i = 0; i < date_starts.length; i++) {
            if (date_starts[i] !== date_ends[i]) {
                if (date_starts[i] === null) {
                    let end = parseDate(new Date(date_ends[i]));
                    dates.push(_("date_to_string.end") + " " + end);
                } else if (date_ends[i] === null) {
                    let start = parseDate(new Date(date_starts[i]));
                    dates.push(_("date_to_string.start") + " " + start);
                } else {
                    let start = parseDate(new Date(date_starts[i]));
                    let end = parseDate(new Date(date_ends[i]));
                    dates.push(_("date_to_string.start") + " " + start + " " + _("date_to_string.end") + " " + end);
                }
            }
            else {
                dates.push(parseDate(new Date(date_starts[i])))
            }
        }
    }

    return dates;
}

function parseUrlByPage(page, removeParams, newParams) {
    let keys = Object.keys(page.query);
    let newKeys = Object.keys(newParams);
    let url = page.path;
    let querys = [];

    if (keys.length > 0) {
        for (let param of keys) {
            let bl = true;
            if (removeParams.length > 0) {
                for (let removeParam of removeParams) {
                    if (removeParam === param)
                        bl = false;
                    break;
                }
            }

            if (bl)            
                querys.push(param + (page.query[param].length > 0 ? "=" + page.query[param] : page.query[param]));
        }
    }

    if(newKeys.length > 0)
        for(let param of newKeys)
            querys.push(param + (newParams[param].length > 0 ? "=" + newParams[param] : newParams[param]));

    url = url + (querys.length > 0 ? "?" : "") + querys.join("&");

    return url;
}