import { Cart } from "../cart/cart.js"
import { Route } from "../routing/route.js";

export class CartPage extends Route {
    constructor() {
        super('cart', '/pages/cart.html')
    }

    load(params) {
        this.#loadCartItems()
    }

    #loadCartItems() {
        const cartItems = Cart.getItems();
        this.#fillCartItems(cartItems);
    }

    #fillCartItems(cartItems) {

    }
}