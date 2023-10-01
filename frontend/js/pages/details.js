import { Route } from "../routing/route.js";
import { get } from "../requests/requests.js";

export class DetailsPage extends Route {
    constructor() {
        super('details', '/pages/details.html')
    }

    loadData(params) {
        if (params != null) {
            const parsedParams = JSON.parse(params);
            this.#loadDetails(parsedParams.id);
        } else {
            console.log('Params must not be null and must contain category ID.')
        }
    }

    #loadDetails(menuItemId) {
        get('/menu/details/' + menuItemId, this.#fillDetails)
    }

    #fillDetails(menuItem) {
        $('#cafe-item-details-image').attr('src', menuItem.image);
        $('#cafe-item-details-name').text(menuItem.name);
        $('#cafe-item-details-description').text(menuItem.description);
    }

}