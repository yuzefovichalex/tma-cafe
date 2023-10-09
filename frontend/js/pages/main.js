import { Route } from "../routing/route.js";
import { navigateTo } from "../routing/router.js";
import { get } from "../requests/requests.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { loadImage, replaceShimmerContent } from "../utils/dom.js";
import { Cart } from "../cart/cart.js";

/**
 * Page for displaying main page content, e.g. cafe info, categories, some menu sections.
 */
export class MainPage extends Route {
    constructor() {
        super('root', '/pages/main.html')
    }

    load(params) {
        const portionCount = Cart.getPortionCount()
        if (portionCount > 0) {
            TelegramSDK.showMainButton(
                `MY CART • ${this.#getDisplayPositionCount(portionCount)}`,
                () => navigateTo('cart')
            )
        } else {
            TelegramSDK.hideMainButton();
        }
        
        this.#loadCafeInfo()
        this.#loadCategories();
        this.#loadPopularMenu();
    }

    #loadCafeInfo() {
        get('/info', (cafeInfo) => {
            this.#fillCafeInfo(cafeInfo);
        });
    }
    
    #loadCategories() {
        get('/categories', (categories) => {
            this.#fillCategories(categories);
        })
    }
    
    #loadPopularMenu() {
        get('/menu/popular', (popularMenu) => {
            this.#fillPopularMenu(popularMenu);
        });
    }
    
    #fillCafeInfo(cafeInfo) {
        loadImage($('#cafe-logo'), cafeInfo.logoImage);
        loadImage($('#cafe-cover'), cafeInfo.coverImage);

        const cafeInfoTemplate = $('#cafe-info-template').html();
        const filledCafeInfoTemplate = $(cafeInfoTemplate);
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

    #getDisplayPositionCount(positionCount) {
        return positionCount == 1 ? `${positionCount} POSITION` : `${positionCount} POSITIONS`;
    }

}