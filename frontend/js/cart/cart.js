import { removeIf } from "../utils/array.js";
import { toDisplayCost } from "../utils/currency.js";

class CartItem {
    constructor(cafeItem, variant, quantity) {
        this.cafeItem = cafeItem;
        this.variant = variant;
        this.quantity = quantity;
    }

    static fromRaw(rawCartItem) {
        return new CartItem(
            rawCartItem.cafeItem,
            rawCartItem.variant,
            rawCartItem.quantity
        );
    }

    getId() {
        return `${this.cafeItem.id}-${this.variant.id}`;
    }

    getDisplayTotalCost() {
        const totalCost = this.variant.cost * this.quantity;
        return toDisplayCost(totalCost);
    }
}

export class Cart {

    static #cartItems = []

    static onItemsChangeListener

    static {
        const savedCartItemsJson = localStorage.getItem('cartItems');
        if (savedCartItemsJson != null) {
            const savedRawCartItems = JSON.parse(savedCartItemsJson);
            const savedCartItems = savedRawCartItems.map(rawCartItem => CartItem.fromRaw(rawCartItem));
            this.#cartItems = savedCartItems;
        }
    }

    static getItems() {
        return this.#cartItems;
    }

    static getPortionCount() {
        var portionCount = 0;
        for (let i = 0; i < this.#cartItems.length; i++) {
            portionCount += this.#cartItems[i].quantity;
        }
        return portionCount;
    }

    static addItem(cafeItem, variant, quantity) {
        const addingCartItem = new CartItem(cafeItem, variant, quantity);
        const existingItem = this.#findItem(addingCartItem.getId());
        if (existingItem != null) {
            existingItem.quantity += quantity;
        } else {
            this.#cartItems.push(addingCartItem);
        }
        this.#saveItems();
        this.#notifyAboutItemsChanged();
    }

    static increaseQuantity(cartItem, quantity) {
        const existingItem = this.#findItem(cartItem.getId());
        if (existingItem != null) {
            existingItem.quantity += quantity;
            this.#saveItems();
            this.#notifyAboutItemsChanged();
        }
    }

    static decreaseQuantity(cartItem, quantity) {
        const existingItem = this.#findItem(cartItem.getId());
        if (existingItem != null) {
            if (existingItem.quantity > quantity) {
                existingItem.quantity -= quantity;
            } else {
                removeIf(this.#cartItems, cartItem => cartItem.getId() === existingItem.getId())
            }
            this.#saveItems();
            this.#notifyAboutItemsChanged();
        }
    }

    static #findItem(id) {
        return this.#cartItems.find(cartItem => cartItem.getId() === id);
    }

    static #saveItems() {
        localStorage.setItem('cartItems', JSON.stringify(this.#cartItems));
    }

    static #notifyAboutItemsChanged() {
        if (this.onItemsChangeListener != null) {
            this.onItemsChangeListener(this.#cartItems);
        } 
    }

}