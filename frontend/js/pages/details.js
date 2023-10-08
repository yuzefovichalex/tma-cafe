import { Route } from "../routing/route.js";
import { get } from "../requests/requests.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { loadImage } from "../utils/dom.js";
import { Cart } from "../cart/cart.js";
import { toDisplayCost } from "../utils/currency.js"
import { Snackbar } from "../utils/snackbar.js";

export class DetailsPage extends Route {

    #selectedVariant;
    #selectedQuantity = 1;

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

        $('#cafe-item-details-quantity-decrease-button').on('click', () => this.#decreaseQuantity());

        $('#cafe-item-details-quantity-increase-button').on('click', () => this.#increaseQuantity())

        TelegramSDK.showMainButton(
            'Add to Cart',
            () => {
                Cart.addItem(menuItem, this.#selectedVariant, this.#selectedQuantity);
                this.#showSuccessSnackbar();
                TelegramSDK.notificationOccured('success');
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

    #increaseQuantity() {
        this.#selectedQuantity++;
        $('#cafe-item-details-quantity-value').text(this.#selectedQuantity);
    }

    #decreaseQuantity() {
        if (this.#selectedQuantity > 1) {
            this.#selectedQuantity--;
        }
        $('#cafe-item-details-quantity-value').text(this.#selectedQuantity);
    }

    #showSuccessSnackbar() {
        Snackbar.showSnackbar(
            'cafe-item-details-container',
            'Successfully added to cart!',
            {
                bottom: '88px'
            }
        );
    }

}