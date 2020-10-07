import { setDataToCK } from "/helpers/edit.js";

export default index;

async function index(fetcher, page, session) {
    const locale = session.locale;

    let startedSlug = page.params.slug,
        actionId,
        actionData = {
            price_min: 0,
            price_max: 0,
            organizer_ids: null,
            site_payment: false,
            organizer_payment: null,
            emails: null,
            phones: null,
            websites: null,
            vk_link: null,
            facebook_link: null,
            instagram_link: null,
            twitter_link: null,
            status: "hidden",
            is_favorite: false,
            organizer_email: null,
            organizer_phone: null,
            title: "",
            name: "",
            short_description: "",
            full_description: "",
            organizer_name: "",
            contact_faces: null,
            images: [],
            dates: null,
            locations: null,
            transfers: null,
            subjects: null,
            companions: null,
            partners: [],
            tours: [],
            excursions: [],
            buyable: [],
            locations2: [],
            slug: "",
            id: null,
            alt: "",
            instagram_widget_is_show: false,
            instagram_widget_title: ""
        };

    let result_filters = await fetcher.get("/api/dataForFilters", {
        credentials: "same-origin"
    });

    let result_users = await fetcher.get("/api/users", {
        credentials: "same-origin"
    });

    let allExcursions = (await fetcher.get("/api/excursions", {
        credentials: "same-origin"
    })).data;

    let allTours = (await fetcher.get("/api/tours", {
        credentials: "same-origin"
    })).data;

    let allHotels = (await fetcher.get("/api/hotels", {
        credentials: "same-origin",
        query: {
            offset: 0,
            count: 8
        }
    }));

    let newLocations = (await fetcher.get(`/api/locations2`, {
        credentials: "same-origin"
    })).data;

    let hotelsCount = allHotels.count;
    allHotels = allHotels.hotels;

    result_filters = result_filters.data;
    result_users = result_users.data;

    if (startedSlug !== undefined) {
        actionData = await fetcher.get("/api/actions/" + startedSlug, {
            credentials: "same-origin"
        });

        actionId = actionData.data.id;

        if (actionData.ok)
            actionData.data.dates = setDataToCK(actionData.data.dates);
    }

    if (startedSlug === undefined || actionData.ok) {
        if (startedSlug !== undefined) {
            actionData = actionData.data;
            startedSlug = Number(startedSlug)
        }
        return {
            ok: true,
            data: {
                ...actionData,
                actionData,
                startedSlug,
                result_filters,
                result_users,
                locale,
                allExcursions,
                allTours,
                allHotels,
                hotelsCount,
                newLocations,
                actionId
            }
        };
    }

    return { ok: false }
}