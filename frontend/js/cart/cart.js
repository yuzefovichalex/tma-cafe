import { removeIf } from "../utils/array.js";
import { toDisplayCost } from "../utils/currency.js";

/**
 * Model class representing Cart item. This is combination of
 * Cafe (Menu) item, selected variant and quantity.
 */
class CartItem {
    constructor(cafeItem, variant, quantity) {
        this.cafeItem = cafeItem;
        this.variant = variant;
        this.quantity = quantity;
    }

    /**
     * Create new instance of the CartItem from its JSON representation (map).
     * @param {map} rawCartItem JSON representation (map) of class.
     * @returns New CartItemInstance.
     */
    static fromRaw(rawCartItem) {
        return new CartItem(
            rawCartItem.cafeItem,
            rawCartItem.variant,
            rawCartItem.quantity
        );
    }

    /**
     * Get CartItem ID based on Cafe item and variant.
     * @returns CartItem ID.
     */
    getId() {
        return `${this.cafeItem.id}-${this.variant.id}`;
    }

    /**
     * Display representation of the total cost for selected variant and quantity.
     * @returns The cost in format that may be displayed on UI.
     */
    getDisplayTotalCost() {
        const totalCost = this.variant.cost * this.quantity;
        return toDisplayCost(totalCost);
    }
}

/**
 * Class holds current Cart state and allows to manipulate it.
 * All the available methods are static, so it's safe to use them
 * in different parts of the app to get actual Cart state.
 */
export class Cart {

    static #cartItems = []

    static onItemsChangeListener

    /**
     * Before using the Cart, we try to restore the latest state from the localStorage.
     */
    static {
        const savedCartItemsJson = localStorage.getItem('cartItems');
        if (savedCartItemsJson != null) {
            const savedRawCartItems = JSON.parse(savedCartItemsJson);
            const savedCartItems = savedRawCartItems.map(rawCartItem => CartItem.fromRaw(rawCartItem));
            this.#cartItems = savedCartItems;
        }
    }

    /**
     * @returns Cart items.
     */
    static getItems() {
        return this.#cartItems;
    }

    /**
     * @returns Total portion count of all the added Cart items.
     */
    static getPortionCount() {
        var portionCount = 0;
        for (let i = 0; i < this.#cartItems.length; i++) {
            portionCount += this.#cartItems[i].quantity;
        }
        return portionCount;
    }

    /**
     * Add new Cafe item to the Cart, if the Cart item with this configuration (Cafe item + variant)
     * doesn't exist in the Cart, or just update the existing Cart item quantity.
     * @param {map} cafeItem Map representation of Cafe item.
     * @param {map} variant Selected variant of Cafe item.
     * @param {number} quantity Selected quantuty.
     */
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

    /**
     * Increase the quantity of desired Cart item. Do nothing, if such item is not in Cart.
     * @param {CartItem} cartItem Desired Cart item model.
     * @param {number} quantity Amount by which to increase.
     */
    static increaseQuantity(cartItem, quantity) {
        const existingItem = this.#findItem(cartItem.getId());
        if (existingItem != null) {
            existingItem.quantity += quantity;
            this.#saveItems();
            this.#notifyAboutItemsChanged();
        }
    }

    /**
     * Increase the quantity of desired Cart item. Do nothing, if such item is not in Cart.
     * If quantity is more than found Cart item's quantity, fully remove such item.
     * @param {CartItem} cartItem Desired Cart item model.
     * @param {number} quantity Amount by which to decrease.
     */
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

    /**
     * Remove all the items from the Cart.
     */
    static clear() {
        this.#cartItems = [];
        this.#saveItems();
        this.#notifyAboutItemsChanged();
    }

    /**
     * Find Cart item by ID.
     * @param {string} id ID of the desired item.
     * @returns Found CartItem or undefined.
     */
    static #findItem(id) {
        return this.#cartItems.find(cartItem => cartItem.getId() === id);
    }

    /**
     * Save in-memory stored items to the localStorage.
     */
    static #saveItems() {
        localStorage.setItem('cartItems', JSON.stringify(this.#cartItems));
    }

    /**
     * Notify onItemsChangeListener about change in the item list.
     */
    static #notifyAboutItemsChanged() {
        if (this.onItemsChangeListener != null) {
            this.onItemsChangeListener(this.#cartItems);
        } 
    }

}