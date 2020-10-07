import {
    parseFilterData,
    setFilterData,
    setFilterFromUrl,
    setNewLocationsData,
    setFilterBySlug
} from "/helpers/filter.js";
import { isMobile } from "/helpers/validators.js";
import { parseStringToWords } from "/helpers/parsers.js";

export default index;

async function index(fetcher, page, session) {
    let params = page.query,
        filter = {
            date: {
                dateStart: {
                    value: "",
                    active: false
                },
                dateEnd: {
                    value: "",
                    active: false
                }
            },
            price: {
                priceMin: {
                    value: "",
                    active: false
                },
                priceMax: {
                    value: "",
                    active: false
                }
            }
        },
        result_cards,
        showFilter = false;

    let result_filters = await fetcher.get("/api/dataForFilters", {
        credentials: "same-origin"
    }),
        result_compiliations,
        result_favorites;

    filter.locations = setNewLocationsData(result_filters.data.locations);
    filter.companions = setFilterData(result_filters.data.companions);
    filter.subjects = setFilterData(result_filters.data.subjects);

    let intersection = await fetcher.get(`/api/filterCrosses/${page.params.slug}`, {
        credentials: "same-origin"
    });

    if(page.params.slug)
        filter = setFilterBySlug(filter, page.params.slug);

    let paramsKeys = Object.keys(params);

    if (paramsKeys.length > 1 && paramsKeys[0] === "filter" || page.params.slug) {
        if (paramsKeys.filter(el => el !== "filter" && el !== "search").length || page.params.slug)
            showFilter = true;

        if (params.dateStart !== undefined) {
            filter.date.dateStart.active = true;
            filter.date.dateStart.value = params.dateStart;
        }
        if (params.dateEnd !== undefined) {
            filter.date.dateEnd.active = true;
            filter.date.dateEnd.value = params.dateEnd;
        }

        for(let key of ["locations", "companions", "subjects"])
            if(params[key])
                filter[key] = setFilterFromUrl(params[key].split(","), filter[key])
        
        if (params.priceMin !== undefined) {
            filter.price.priceMin.active = true;
            filter.price.priceMin.value = params.priceMin;
        }
        if (params.priceMax !== undefined) {
            filter.price.priceMax.active = true;
            filter.price.priceMax.value = params.priceMax;
        }

        let {params: query, compiliationsParams: compiliationQuery} = parseFilterData(filter);

        if (params.search) query.search = parseStringToWords(params.search);

        result_compiliations = (await fetcher.get("/api/compiliations", {
            credentials: "same-origin",
            query: compiliationQuery
        })).data;

        result_cards = (await fetcher.get("api/actions", {
            credentials: "same-origin",
            query
        })).actions;
    } else {
        result_cards = (await fetcher.get("api/actions", {
            credentials: "same-origin"
        })).actions;
        result_compiliations = (await fetcher.get("/api/compiliations", {
            credentials: "same-origin"
        })).data;
    }

    const subjectIds = filter.subjects.reduce((sec, cur) => {
        if(cur.active) sec.push(cur.id);
        return sec;
    }, []);

    if (subjectIds.length) {

        let data = (await fetcher.get("/api/favorites/", {
            credentials: "same-origin",
            query: {
                filter: "",
                favoritesOnly: "",
                subjectIds
            }
        })).data;

        if (subjectIds.length === 1) {
            result_favorites = data;
        } else if (subjectIds.length === 2) {
            let newData = [];
            for (let subject of subjectIds) {
                let i = 0;
                for (let favorite of data) {
                    if (favorite.subject_id === subject) {
                        i++;
                        newData.push(favorite);
                        if (i === 2) break;
                    }
                }
            }
            result_favorites = newData;
        } else if (subjectIds.length === 3) {
            let newData = [];
            let twoFavorites = true;
            for (let subject of subjectIds) {
                let i = 0;
                for (let favorite of data) {
                    if (favorite.subject_id === subject) {
                        i++;
                        newData.push(favorite);
                        if (i === 2 && twoFavorites) {
                            twoFavorites = false;
                            break;
                        } else if (i === 1 && !twoFavorites) break;
                    }
                }
            }
            result_favorites = newData;
        } else {
            let newData = [];
            for (let subject of subjectIds) {
                for (let favorite of data) {
                    if (favorite.subject_id === subject) {
                        newData.push(favorite);
                        break;
                    }
                }
            }
            result_favorites = newData;
        }
    } else {
        result_favorites = (await fetcher.get("/api/favorites/main", {
            credentials: "same-origin"
        })).data;
    }

    for (let favorite of result_favorites)
        favorite.id = favorite.action_id;

    let locale = session.locale;
    let mobile = isMobile(session["user-agent"]);

    return {
        result_cards,
        result_filters,
        locale,
        filter,
        showFilter,
        result_compiliations,
        result_favorites,
        mobile,
        intersection
    };
}