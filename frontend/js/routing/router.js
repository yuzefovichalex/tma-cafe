import { MainPage } from "../pages/main.js";
import { CategoryPage } from "../pages/category.js";
import { DetailsPage } from "../pages/details.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { CartPage } from "../pages/cart.js";
import { Snackbar } from "../utils/snackbar.js";

/**
 * List of available routes (pages).
 */
const availableRoutes = [
    new MainPage(),
    new CategoryPage(),
    new DetailsPage(),
    new CartPage()
]

/**
 * When we load content for the route (HTML), we save it there
 * in format { '/path/to/content.html': '<div>...Loaded content</div>' }.
 * When we go to the route with contentPath that exists in cache, we load
 * page from there. This is optimization for route content HTML only,
 * the Route.load(params) method is calling anyway to load new portion of the data.
 * 
 * This is in-memory cache, since we want to store it only for the current app
 * opening.
 */
const pageContentCache = { }

/**
 * Currently selected route.
 * Instance of Route class' child, one of the availableRoutes.
 */
let currentRoute

/**
 * Currently executing route (page) content load request.
 * It resets (null) when page is loaded.
 */
let pageContentLoadRequest

/**
 * Indicates that we have one more navigation request we get while
 * navigation animation was running. If true, when navigation animation finish,
 * there will be one more handleLocation() call.
 */
let pendingAnimations = false

/**
 * Indicates currently running navigation animation.
 */
let animationRunning = false

/**
 * Request for navigating to some destination.
 * @param {string} dest Desired destination. Should be one of availableRoutes dests.
 * @param {*} params Params that you'd like to pass to the new destination (route).
 *                      It will be URL encoded 'params' parameter of the current URL.
 */
export function navigateTo(dest, params) {
    let url = '?dest=' + dest;
    if (params != null) {
        url += '&params=' + encodeURIComponent(params);
    }
    // Keep URL hash part since it may be filled by Telegram.
    // This is actual, for example, when running the app
    // from Inline Button.
    window.history.pushState({}, '', url + location.hash);
    handleLocation(false);
};

/**
 * Handle location defined in the current URL. The method performs:
 *  - Find desired route or fallback to default ('root').
 *  - Run navigation animation (slid-in/slide-out).
 *  - Controls Telegram's back button.
 * @param {boolean} reverse Navigation animation should run in reverse direction.
 *                      Typically used for back (popstate) navigations.
 */
export function handleLocation(reverse) {
    const search = window.location.search;
    if (search == '') {
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

        if (currentRoute.dest != 'root') {
            TelegramSDK.showBackButton(() => history.back());
        } else {
            TelegramSDK.hideBackButton();
        }
    }
};

/**
 * Load page content (HTML). The content may be load from the server or cache,
 * if previously was already loaded (see pageContentCache).
 * @param {string} pageContainerSelector Selector of the page container (e.g. #page-current).
 * @param {string} pagePath Path of the page content, typically defined in Route.contentPath (e.g. /path/main.html).
 * @param {*} onSuccess Callback called when page successfully loaded and added to DOM.
 * @returns Request object, if page is loaded from the server, or null, if from the cache.
 */
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

/**
 * Run navigation animations for outgoing and ingoing pages.
 * @param {boolean} reverse Navigation animation should run in reverse direction.
 *                      Typically used for back (popstate) navigations.
 */
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

/**
 * Reset page containers values to default ones.
 * It should be run when navigation animation is finished.
 */
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

/**
 * Show snackbar on top of the page content. It attaches to the top-level '#content' container,
 * so it's handy to use this method instead of creating such methods in the Route instance directly.
 * @param {string} text Snackbar text.
 * @param {string} style The style of the Snackbar. It may be one of: 'success', 'warning', 'error'.
 *                          It also impacts on the Telegram's Haptic Feedback.
 */
export function showSnackbar(text, style) {
    const colorVariable = style == 'success' ? '--success-color'
        : style == 'warning' ? '--warning-color'
        : style == 'error' ? '--error-color'
        : '--accent-color';

    Snackbar.showSnackbar(
        'content',
        text,
        {
            'background-color': `var(${colorVariable})`
        }
    );

    TelegramSDK.notificationOccured(style);
}

/**
 * We want to handle location when page history is popped (back button click).
 */
window.onpopstate = () => handleLocation(true);