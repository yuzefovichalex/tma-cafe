import { Route } from "../routing/route.js";
import { get } from "../requests/requests.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { loadImage } from "../utils/dom.js";
import { Cart } from "../cart/cart.js";
import { toDisplayCost } from "../utils/currency.js"
import { Snackbar } from "../utils/snackbar.js";

/**
 * Page for displaying main item details, as well as selectin variant, quantity
 * and adding item to the Cart.
 */
export class DetailsPage extends Route {

    #selectedVariant;
    #selectedQuantity = 1;

    constructor() {
        super('details', '/pages/details.html')
    }

    load(params) {
        TelegramSDK.expand();

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

        $('#cafe-item-details-name')
            .removeClass('shimmer')
            .text(menuItem.name);

        $('#cafe-item-details-description')
            .removeClass('shimmer')
            .text(menuItem.description);

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

        this.#resetQuantity();
        $('#cafe-item-details-quantity-decrease-button').clickWithRipple(() => this.#decreaseQuantity());
        $('#cafe-item-details-quantity-increase-button').clickWithRipple(() => this.#increaseQuantity());

        TelegramSDK.showMainButton(
            'ADD TO CART',
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
        this.#refreshSelectedVariantWeight();
        this.#refreshSelectedVariantPrice();
        TelegramSDK.impactOccured('light');
    }

    #refreshSelectedVariantWeight() {
        $('#cafe-item-details-selected-variant-weight')
            .removeClass('shimmer')
            .text(this.#selectedVariant.weight);
    }

    #refreshSelectedVariantPrice() {
        $('#cafe-item-details-selected-variant-price')
            .removeClass('shimmer')
            .text(toDisplayCost(this.#selectedVariant.cost));
    }

    #increaseQuantity() {
        this.#selectedQuantity++;
        this.#refreshSelectedQuantity();
        TelegramSDK.impactOccured('light');
    }

    #decreaseQuantity() {
        if (this.#selectedQuantity > 1) {
            this.#selectedQuantity--;
            this.#refreshSelectedQuantity();
            TelegramSDK.impactOccured('light');
        }
    }

    #resetQuantity() {
        this.#selectedQuantity = 1;
        this.#refreshSelectedQuantity();
    }

    #refreshSelectedQuantity() {
        $('#cafe-item-details-quantity-value')
            .text(this.#selectedQuantity)
            .boop();
    }

    #showSuccessSnackbar() {
        Snackbar.showSnackbar(
            'cafe-item-details-container',
            'Successfully added to cart!',
            {
                bottom: '80px',
                'background-color': 'var(--success-color)'
            }
        );
    }

}