import { Route } from "../routing/route.js";
import { navigateTo } from "../routing/router.js";
import { get } from "../requests/requests.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { replaceShimmerContent } from "../utils/dom.js";
import { Cart } from "../cart/cart.js";

/**
 * Page for displaying menu list for selected category.
 */
export class CategoryPage extends Route {
    constructor() {
        super('category', '/pages/category.html')
    }

    load(params) {
        TelegramSDK.expand();

        const portionCount = Cart.getPortionCount()
        if (portionCount > 0) {
            TelegramSDK.showMainButton(
                `MY CART • ${this.#getDisplayPositionCount(portionCount)}`,
                () => navigateTo('cart')
            )
        } else {
            TelegramSDK.hideMainButton();
        }

        if (params != null) {
            const parsedParams = JSON.parse(params);
            this.#loadMenu(parsedParams.id);
        } else {
            console.log('Params must not be null and must contain category ID.')
        }
    }

    #loadMenu(categoryId) {
        get('/menu/' + categoryId, (cafeItems) => {
            this.#fillMenu(cafeItems);
        });
    }

    #fillMenu(cafeItems) {
        replaceShimmerContent(
            '#cafe-category',
            '#cafe-item-template',
            '#cafe-item-image',
            cafeItems,
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