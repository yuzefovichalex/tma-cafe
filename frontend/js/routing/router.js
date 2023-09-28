import { MainRoute } from "./main-route.js";
import { CategoryRoute } from "./category-route.js";
import { DetailsRoute } from "./details-route.js";

const routes = [
    new MainRoute(),
    new CategoryRoute(),
    new DetailsRoute()
]

export const navigateTo = (dest, params) => {
    var url = '?dest=' + dest;
    if (params != null) {
        url += '&params=' + encodeURIComponent(params);
    }
    window.history.pushState({}, '', url);
    handleLocation();
};

export const handleLocation = () => {
    const search = window.location.search;
    if (search === "") {
        navigateTo('root')
    } else {
        const searchParams = new URLSearchParams(search);
        const dest = searchParams.get('dest') || 'root';
        const encodedLoadParams = searchParams.get('params');
        if (encodedLoadParams != null) {
            var loadParams = decodeURIComponent(encodedLoadParams);
        }
        const route = routes.find((route) => dest === route.dest);
        $('#content').load(route.contentPath, () => route.loadData(loadParams));
    }
};

window.onpopstate = handleLocation;

handleLocation();