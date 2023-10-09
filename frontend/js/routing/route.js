/**
 * Route is a representation of navigation destination. It holds such data as
 * dest (e.g. 'cart') and contentPath (e.g. '/pages/cart.html').
 * This is a base class that does nothing itself. It should be overriden by passing
 * dest and contentPath values, as well as overriding method load(params).
 */
export class Route {
    constructor(dest, contentPath) {
        this.dest = dest;
        this.contentPath = contentPath;
    }

    /**
     * Load content. This method is called when the HTML of the route defined by
     * contentPath param is loaded and added to DOM.
     * @param {string} params Params that are needed for content load (e.g. some ID).
     *                          You can pass it by calling navigateTo(dest, params). 
     *                          In JSON format.
     */
    load(params) { }

    /**
     * This method is called before the route is changed. It's a good place
     * to remove listeners or cancel the request.
     */
    onClose() { }
}