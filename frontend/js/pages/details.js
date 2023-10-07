import { Route } from "../routing/route.js";
import { get } from "../requests/requests.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { loadImage } from "../utils/dom.js";
import { Cart } from "../cart/cart.js";

export class DetailsPage extends Route {
    constructor() {
        super('details', '/pages/details.html')
    }

    load(params) {
        if (params != null) {
            const parsedParams = JSON.parse(params);
            this.#loadDetails(parsedParams.id);
        } else {
            console.log('Params must not be null and must contain category ID.')
        }
    }

    #loadDetails(menuItemId) {
        get('/menu/details/' + menuItemId, this.#fillDetails)
    }

    #fillDetails(menuItem) {
        loadImage($('#cafe-item-details-image'), menuItem.image);

        const name = $('#cafe-item-details-name');
        name.removeClass('shimmer');
        name.text(menuItem.name);

        const description = $('#cafe-item-details-description');
        description.removeClass('shimmer');
        description.text(menuItem.description);

        TelegramSDK.showMainButton(
            'Add to Cart',
            () => {
                Cart.addItem(menuItem, 1);
                TelegramSDK.notificationOccured('success');
            }
        );
    }

}