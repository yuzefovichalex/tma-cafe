import { get } from "./js/requests.js";

$(window).on('load', function () {
    loadCafeInfo();
    loadCategories();
    loadPopularMenu();
});

function loadCafeInfo() {
    get('/info', fillCafeInfo);
}

function loadCategories() {
    get('/categories', fillCategories)
}

function loadPopularMenu() {
    get('/menu/popular', fillPopularMenu);
}

function fillCafeInfo(cafeInfo) {
    var cafeInfoTemplate = $('#cafe-info-template').html();
    var filledCafeInfoTemplate = $(cafeInfoTemplate);
    filledCafeInfoTemplate.find('#cafe-name').text(cafeInfo.name);
    filledCafeInfoTemplate.find('#cafe-kitchen-categories').text(cafeInfo.kitchenCategories);
    filledCafeInfoTemplate.find('#cafe-rating').text(cafeInfo.rating);
    filledCafeInfoTemplate.find('#cafe-cooking-time').text(cafeInfo.cookingTime);
    filledCafeInfoTemplate.find('#cafe-status').text(cafeInfo.status);
    $('#cafe-info').empty();
    $('#cafe-info').append(filledCafeInfoTemplate);
}

function fillCategories(categories) {
    $('#cafe-section-categories-title').removeClass('shimmer');
    replaceShimmerContent(
        '#cafe-categories',
        '#cafe-category-template',
        '#cafe-category-icon',
        categories,
        (template, cafeCategory) => {
            template.attr('id', cafeCategory.name);
            template.css('background-color', cafeCategory.backgroundColor);
            template.find('#cafe-category-icon').attr('src', cafeCategory.icon);
            template.find('#cafe-category-name').text(cafeCategory.name);
        }
    )
}

function fillPopularMenu(popularMenu) {
    $('#cafe-section-popular-title').removeClass('shimmer');
    replaceShimmerContent(
        '#cafe-section-popular',
        '#cafe-item-template',
        '#cafe-item-image',
        popularMenu,
        (template, cafeItem) => {
            template.attr('id', cafeItem.name);
            template.find('#cafe-item-image').attr('src', cafeItem.image);
            template.find('#cafe-item-name').text(cafeItem.name);
            template.find('#cafe-item-description').text(cafeItem.description);
        }
    )
}

function replaceShimmerContent(containerSelector, templateSelector, loadableImageSelector, data, templateSetup) {
    let templateHtml = $(templateSelector).html();
    var imageLoaded = 0;
    let imageShouldBeLoaded = data.length;
    let filledTemplates = [];
    data.forEach(dataItem => {
        let filledTemplate = $(templateHtml);
        templateSetup(filledTemplate, dataItem);
        filledTemplate.find(loadableImageSelector).on('load', function() {
            imageLoaded++;
            if (imageLoaded == imageShouldBeLoaded) {
                fillContainer(containerSelector, filledTemplates);
            }
        });
        filledTemplates.push(filledTemplate);
    });
}

function fillContainer(selector, elements) {
    let container = $(selector);
    container.empty();
    elements.forEach(el => container.append(el));
}