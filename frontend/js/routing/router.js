import { MainPage } from "../pages/main.js";
import { CategoryPage } from "../pages/category.js";
import { DetailsPage } from "../pages/details.js";

const routes = [
    new MainPage(),
    new CategoryPage(),
    new DetailsPage()
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