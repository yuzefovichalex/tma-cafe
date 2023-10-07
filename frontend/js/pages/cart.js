import { Cart } from "../cart/cart.js"
import { post } from "../requests/requests.js";
import { Route } from "../routing/route.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { loadImage } from "../utils/dom.js";

export class CartPage extends Route {
    constructor() {
        super('cart', '/pages/cart.html')
    }

    load(params) {
        Cart.onItemsChangeListener = (cartItems) => this.#fillCartItems(cartItems);
        this.#loadCartItems()
    }

    #loadCartItems() {
        const cartItems = Cart.getItems();
        this.#fillCartItems(cartItems);
    }

    #fillCartItems(cartItems) {
        this.#updateMainButton(cartItems);

        const cartItemsContainer = $('#cart-items');
        const cartItemsIds = cartItems.map((cartItem) => cartItem.getId());

        // Remove elements not presented in the cartItems anymore
        cartItemsContainer.children().each((index, element) => {
            const cartItemElement = $(element);
            if (!cartItemsIds.includes(cartItemElement.attr('id'))) {
                cartItemElement.remove();
            }
        })

        const cartItemTemplateHtml = $('#cart-item-template').html();
        cartItems.forEach(cartItem => {
            const cartItemElement = cartItemsContainer.find(`#${cartItem.getId()}`);
            if (cartItemElement.length > 0) {
                // We found the existing item, just update the needed params
                cartItemElement.find('#cart-item-quantity').text(cartItem.quantity);
            } else {
                // This is the newely added item, create new element for it
                const filledCartItemTemplate = $(cartItemTemplateHtml);
                filledCartItemTemplate.attr('id', `${cartItem.getId()}`)
                loadImage(filledCartItemTemplate.find('#cart-item-image'), cartItem.cafeItem.image);
                filledCartItemTemplate.find('#cart-item-name').text(cartItem.cafeItem.name);
                filledCartItemTemplate.find('#cart-item-quantity').text(cartItem.quantity);
                filledCartItemTemplate.find('#cart-item-quantity-increment').on('click', () => {
                    Cart.addItem(cartItem.cafeItem, 1);
                });
                filledCartItemTemplate.find('#cart-item-quantity-decrement').on('click', () => {
                    Cart.removeItem(cartItem.cafeItem, 1);
                });
                cartItemsContainer.append(filledCartItemTemplate);
            }
        });
    }

    #updateMainButton(cartItems) {
        if (cartItems.length > 0) {
            TelegramSDK.showMainButton(
                'CHECKOUT',
                () => post('/order', JSON.stringify(cartItems), (result) => {
                    TelegramSDK.openInvoice(result.invoiceUrl);
                })
            );
        } else {
            TelegramSDK.hideMainButton();
        }
    }

    onClose() {
        Cart.onItemsChangeListener = null;
    }
}