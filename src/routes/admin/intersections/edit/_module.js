export default index;

async function index(fetcher, page, session){
    const locale = session.locale;

    let startedSlug = page.params.slug;
    let intersectionData = {
        id:             null,
        slug:           "",
        description:    "",
        intro:          "",
        h1:             "",
        title:          ""
    };
    let findedSlug = false;

    const locations = (await fetcher.get(`/api/locations2`, {
        credentials: "same-origin"
    })).data;

    const subjects = (await fetcher.get(`/api/subjects`, {
        credentials: "same-origin"
    })).data;

    const allIntersections = (await fetcher.get(`/api/filterCrosses`, {
        credentials: "same-origin"
    })).data;

    if(startedSlug){
        intersectionData = (await fetcher.get(`/api/filterCrosses/${startedSlug}`, {
            credentials: "same-origin"
        }))

        if(intersectionData.ok)
            findedSlug = true;
        
        intersectionData = intersectionData.data[0]
    }

    if(!startedSlug || findedSlug)
        return {
            ok: true,
            data: {
                locations,
                subjects,
                locale,
                startedSlug,
                intersectionData,
                allIntersections,
                ...intersectionData
            }
        }

    return {ok: false}
}