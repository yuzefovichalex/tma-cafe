import { MainPage } from "../pages/main.js";
import { CategoryPage } from "../pages/category.js";
import { DetailsPage } from "../pages/details.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { CartPage } from "../pages/cart.js";

const routes = [
    new MainPage(),
    new CategoryPage(),
    new DetailsPage(),
    new CartPage()
]

var pendingAnimations = false
var animationRunning = false

export const navigateTo = (dest, params) => {
    var url = '?dest=' + dest;
    if (params != null) {
        url += '&params=' + encodeURIComponent(params);
    }
    window.history.pushState({}, '', url);
    handleLocation(false);
};

export const handleLocation = (reverse) => {
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

        if (animationRunning) {
            pendingAnimations = true;
            return;
        }

        if ($('#page-current').contents().length > 0) {
            $('#page-next').load(route.contentPath, () => {
                animatePageChange(reverse);
                route.load(loadParams);
            });
        } else {
            $('#page-current').load(route.contentPath, () => route.load(loadParams));
        }

        if (route.dest !== 'root') {
            TelegramSDK.showBackButton(() => history.back());
        } else {
            TelegramSDK.hideBackButton();
        }
    }
};

function animatePageChange(reverse) {
    animationRunning = true;
            
    const currentPageZIndex = reverse ? '2' : '1';
    const currentPageLeftTo = reverse ? '100vw' : '-25vw';
    const nextPageZIndex = reverse ? '1' : '2';
    const nextPageLeftFrom = reverse ? '-25vw' : '100vw';

    $('#page-current')
        .css({
            transform: '',
            'z-index': currentPageZIndex
        })
        .transition({ x: currentPageLeftTo }, 325);

    $('#page-next')
        .css({
            display: '',
            transform: `translate(${nextPageLeftFrom})`,
            'z-index': nextPageZIndex
        })
        .transition({ x: '0px' }, 325, () => { 
            animationRunning = false;
            restorePagesInitialState();
            if (pendingAnimations) {
                pendingAnimations = false;
                handleLocation(reverse);
            }
        });
}

function restorePagesInitialState() {
    $('#page-current')
        .css({
            transform: '',
            'z-index': '2'
        })
        .empty();

    $('#page-next')
        .css({
            display: 'none',
            'z-index': '1'
        })
        .contents().appendTo('#page-current');
}

window.onpopstate = () => handleLocation(true);

handleLocation();