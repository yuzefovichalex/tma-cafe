import { Cart } from "../cart/cart.js"
import { post } from "../requests/requests.js";
import { Route } from "../routing/route.js";
import { showSnackbar } from "../routing/router.js";
import { TelegramSDK } from "../telegram/telegram.js";
import { loadImage } from "../utils/dom.js";

/**
 * Page for displaying cart items, as well as changing them (quantity).
 */
export class CartPage extends Route {

    #emptyCartPlaceholderLottieAnimation

    constructor() {
        super('cart', '/pages/cart.html')
    }

    load(params) {
        this.#loadLottie();
        // Refresh UI when Cart was updated.
        Cart.onItemsChangeListener = (cartItems) => this.#fillCartItems(cartItems);
        this.#loadCartItems()
    }

    #loadLottie() {
        this.#emptyCartPlaceholderLottieAnimation = lottie.loadAnimation({
            container: $('#cart-empty-placeholder-icon')[0],
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: 'lottie/empty-cart.json'
        });
    }

    #loadCartItems() {
        const cartItems = Cart.getItems();
        this.#fillCartItems(cartItems);
    }

    #fillCartItems(cartItems) {
        this.#updateMainButton(cartItems);
        this.#changeEmptyPlaceholderVisibility(cartItems.length == 0);

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
                cartItemElement.find('#cart-item-cost').textBoop(cartItem.getDisplayTotalCost());
                cartItemElement.find('#cart-item-quantity').textBoop(cartItem.quantity);
            } else {
                // This is the newely added item, create new element for it
                const filledCartItemTemplate = $(cartItemTemplateHtml);
                filledCartItemTemplate.attr('id', `${cartItem.getId()}`)
                loadImage(filledCartItemTemplate.find('#cart-item-image'), cartItem.cafeItem.image);
                filledCartItemTemplate.find('#cart-item-name').text(cartItem.cafeItem.name);
                filledCartItemTemplate.find('#cart-item-description').text(cartItem.variant.name);
                filledCartItemTemplate.find('#cart-item-cost').text(cartItem.getDisplayTotalCost());
                filledCartItemTemplate.find('#cart-item-quantity').text(cartItem.quantity);
                filledCartItemTemplate.find('#cart-item-quantity-increment').clickWithRipple(() => {
                    Cart.increaseQuantity(cartItem, 1);
                    TelegramSDK.impactOccured('light');
                });
                filledCartItemTemplate.find('#cart-item-quantity-decrement').clickWithRipple(() => {
                    Cart.decreaseQuantity(cartItem, 1);
                    TelegramSDK.impactOccured('light');
                });
                cartItemsContainer.append(filledCartItemTemplate);
            }
        });
    }

    #updateTextWithBoop(element, text) {
        if (element.text() != text) {
            element
                .text(text)
                .boop();
        }
    }

    #updateMainButton(cartItems) {
        if (cartItems.length > 0) {
            TelegramSDK.showMainButton('CHECKOUT', () => {
                TelegramSDK.setMainButtonLoading(true);
                this.#createOrder(cartItems);
            });
        } else {
            TelegramSDK.setMainButtonLoading(false);
            TelegramSDK.hideMainButton();
        }
    }

    
    #changeEmptyPlaceholderVisibility(isVisible) {
        const placeholder = $('#cart-empty-placeholder');
        if (isVisible) {
            this.#emptyCartPlaceholderLottieAnimation.play();
            placeholder.fadeIn();
        } else {
            this.#emptyCartPlaceholderLottieAnimation.stop();
            placeholder.hide();
        }
    }

    #createOrder(cartItems) {
        const data = {
            _auth: TelegramSDK.getInitData(),
            cartItems: cartItems
        };
        post('/order', JSON.stringify(data), (result) => {
            if (result.ok) {
                TelegramSDK.openInvoice(result.data.invoiceUrl, (status) => {
                    this.#handleInvoiceStatus(status);
                });
            } else {
                showSnackbar(result.error, 'error');
            }
        });
    }

    #handleInvoiceStatus(status) {
        if (status == 'paid') {
            Cart.clear();
            TelegramSDK.close();
        } else if (status == 'failed') {
            TelegramSDK.setMainButtonLoading(false);
            showSnackbar('Something went wrong, payment is unsuccessful :(', 'error');
        } else {
            TelegramSDK.setMainButtonLoading(false);
            showSnackbar('The order was cancelled.', 'warning');
        }
    }

    onClose() {
        // Remove listener to prevent any updates here when page is not visible.
        Cart.onItemsChangeListener = null;
    }
}