import { removeIf } from "../utils/array.js";

class CartItem {
    constructor(cafeItem, quantity) {
        this.cafeItem = cafeItem;
        this.quantity = quantity;
    }

    static fromRaw(rawCartItem) {
        return new CartItem(rawCartItem.cafeItem, rawCartItem.quantity);
    }

    getId() {
        return this.cafeItem.id;
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

    static addItem(cafeItem, quantity) {
        const existingItem = this.#findItem(cafeItem.id);
        if (existingItem != null) {
            existingItem.quantity += quantity;
        } else {
            const cartItem = new CartItem(cafeItem, quantity);
            this.#cartItems.push(cartItem);
        }
        this.#saveItems();
        this.#notifyAboutItemsChanged();
    }

    static removeItem(cafeItem, quantity) {
        const existingItem = this.#findItem(cafeItem.id);
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