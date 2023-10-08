import { Route } from "../routing/route.js";
import { get } from "../requests/requests.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { loadImage } from "../utils/dom.js";
import { Cart } from "../cart/cart.js";
import { toDisplayCost } from "../utils/currency.js"

export class DetailsPage extends Route {

    #selectedVariant;

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
        get('/menu/details/' + menuItemId, (menuItems) => {
            this.#fillDetails(menuItems);
        });
    }

    #fillDetails(menuItem) {
        loadImage($('#cafe-item-details-image'), menuItem.image);

        const name = $('#cafe-item-details-name');
        name.removeClass('shimmer');
        name.text(menuItem.name);

        const description = $('#cafe-item-details-description');
        description.removeClass('shimmer');
        description.text(menuItem.description);

        $('#cafe-item-details-section-title').removeClass('shimmer');

        const variants = menuItem.variants;
        const variantsContainer = $('#cafe-item-details-variants');
        const variantTemplateHtml = $('#cafe-item-details-variant-template').html();
        variants.forEach((variant) => {
            const filledVariantTemplate = $(variantTemplateHtml)
                .attr('id', variant.id)
                .text(variant.name)
                .on('click', () => this.#selectVariant(variant));
            variantsContainer.append(filledVariantTemplate);
        });

        if (variants.length > 0) {
            this.#selectVariant(variants[0]);
        }

        TelegramSDK.showMainButton(
            'Add to Cart',
            () => {
                if (this.#selectedVariant != null) {
                    Cart.addItem(menuItem, this.#selectedVariant, 1);
                    TelegramSDK.notificationOccured('success');
                } else {
                    // Should not be possible, since we pre-select variant above.
                }
            }
        );
    }

    #selectVariant(variant) {
        if (this.#selectedVariant != null) {
            $(`#${this.#selectedVariant.id}`).removeClass('selected');
        }
        $(`#${variant.id}`).addClass('selected');
        this.#selectedVariant = variant;
        this.#updateSelectedVariantPrice();
    }

    #updateSelectedVariantPrice() {
        const selectedVariantPrice = $('#cafe-item-details-selected-variant-price');
        selectedVariantPrice.removeClass('shimmer');
        selectedVariantPrice.text(toDisplayCost(this.#selectedVariant.cost));
    }

}