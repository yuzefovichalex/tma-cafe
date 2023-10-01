import { Route } from "./route.js";
import { navigateTo } from "./router.js";
import { get } from "../requests/requests.js";
import { replaceShimmerContent } from "../utils/dom.js";

export class MainRoute extends Route {
    constructor() {
        super('root', '/pages/main.html')
    }

    loadData(params) {
        this.#loadCafeInfo()
        this.#loadCategories();
        this.#loadPopularMenu();
    }

    #loadCafeInfo() {
        get('/info', this.#fillCafeInfo);
    }
    
    #loadCategories() {
        get('/categories', this.#fillCategories)
    }
    
    #loadPopularMenu() {
        get('/menu/popular', this.#fillPopularMenu);
    }
    
    #fillCafeInfo(cafeInfo) {
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
    
    #fillCategories(categories) {
        $('#cafe-section-categories-title').removeClass('shimmer');
        replaceShimmerContent(
            '#cafe-categories',
            '#cafe-category-template',
            '#cafe-category-icon',
            categories,
            (template, cafeCategory) => {
                template.attr('id', cafeCategory.id);
                template.css('background-color', cafeCategory.backgroundColor);
                template.find('#cafe-category-icon').attr('src', cafeCategory.icon);
                template.find('#cafe-category-name').text(cafeCategory.name);
                template.on('click', () => {
                    const params = JSON.stringify({'id': cafeCategory.id});
                    navigateTo('category', params);
                });
            }
        )
    }
    
    #fillPopularMenu(popularMenu) {
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
                template.on('click', () => {
                    const params = JSON.stringify({'id': cafeItem.id});
                    navigateTo('details', params);
                });
            }
        )
    }
}