import { MainPage } from "../pages/main.js";
import { CategoryPage } from "../pages/category.js";
import { DetailsPage } from "../pages/details.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { CartPage } from "../pages/cart.js";

const availableRoutes = [
    new MainPage(),
    new CategoryPage(),
    new DetailsPage(),
    new CartPage()
]

const pageContentCache = { }

let currentRoute

let pageContentLoadRequest
let pendingAnimations = false
let animationRunning = false

export const navigateTo = (dest, params) => {
    let url = '?dest=' + dest;
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
        if (animationRunning) {
            pendingAnimations = true;
            return;
        }

        if (currentRoute != null) {
            currentRoute.onClose();
        }

        const searchParams = new URLSearchParams(search);
        const dest = searchParams.get('dest') || 'root';
        const encodedLoadParams = searchParams.get('params');
        if (encodedLoadParams != null) {
            var loadParams = decodeURIComponent(encodedLoadParams);
        }
        currentRoute = availableRoutes.find((route) => dest === route.dest);

        if (pageContentLoadRequest != null) {
            pageContentLoadRequest.abort();
        }

        if ($('#page-current').contents().length > 0) {
            pageContentLoadRequest = loadPage('#page-next', currentRoute.contentPath, () => { 
                pageContentLoadRequest = null;
                currentRoute.load(loadParams);
            });
            animatePageChange(reverse);
        } else {
            pageContentLoadRequest = loadPage('#page-current', currentRoute.contentPath, () => {
                pageContentLoadRequest = null;
                currentRoute.load(loadParams)
            });
        }

        if (currentRoute.dest !== 'root') {
            TelegramSDK.showBackButton(() => history.back());
        } else {
            TelegramSDK.hideBackButton();
        }
    }
};

function loadPage(pageContainerSelector, pagePath, onSuccess) {
    const container = $(pageContainerSelector);
    const page = pageContentCache[pagePath];
    if (page != null) {
        container.html(page);
        onSuccess();
        return null;
    } else {
        return $.ajax({
            url: pagePath,
            success: (page) => {
                pageContentCache[pagePath] = page;
                container.html(page);
                onSuccess();
            }
        });
    }
}

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
    const currentPage = $('#page-current');
    const nextPage = $('#page-next');

    currentPage
        .attr('id', 'page-next')
        .css({
            display: 'none',
            'z-index': '1'
        })
        .empty();

    nextPage
        .attr('id', 'page-current')
        .css({
            display: '',
            transform: '',
            'z-index': '2'
        });
}

window.onpopstate = () => handleLocation(true);