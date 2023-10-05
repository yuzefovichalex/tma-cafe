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
        if (cartItems.length > 0) {
            TelegramSDK.showMainButton(
                'Checkout',
                () => post('/order', JSON.stringify(cartItems), (result) => {
                    TelegramSDK.openInvoice(result.invoiceUrl);
                })
            );
        } else {
            TelegramSDK.hideMainButton();
        }

        const cartItemContainer = $('#cart-items');
        cartItemContainer.empty();

        const cartItemTemplateHtml = $('#cart-item-template').html();
        cartItems.forEach(cartItem => {
            const filledCartItemTemplate = $(cartItemTemplateHtml);
            loadImage(filledCartItemTemplate.find('#cart-item-image'), cartItem.cafeItem.image);
            filledCartItemTemplate.find('#cart-item-name').text(cartItem.cafeItem.name);
            filledCartItemTemplate.find('#cart-item-quantity').text(cartItem.quantity);
            filledCartItemTemplate.find('#cart-item-quantity-increment').on('click', () => {
                Cart.addItem(cartItem.cafeItem, 1);
            });
            filledCartItemTemplate.find('#cart-item-quantity-decrement').on('click', () => {
                Cart.removeItem(cartItem.cafeItem, 1);
            });
            cartItemContainer.append(filledCartItemTemplate);
        });
    }
}