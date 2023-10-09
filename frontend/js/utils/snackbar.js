import { TelegramSDK } from "../telegram/telegram.js";

/**
 * Util class for showing Snackbar. It's goal to handle Snackbar instance and keep
 * it single for the target container. The class allow to show Snackbar without direct
 * definition in your HTML.
 */
export class Snackbar {

    /**
     * Map of pairs: Snackbar ID in format ('${parentId}-snackbar') 
     * to it's animation timeout ID. Storing the IDs allows to not create the
     * Snackbar if it's already added to DOM, but update it's content and styling.
     */
    static #snackbarIds = { };

    /**
     * Displays Snackbar at the bottom of target container.
     * @param {*} parentId The id of the target (parent) container. Without '#' symbol.
     * @param {*} text Text for displaying in the Snackbar.
     * @param {*} params CSS parameters you'd like to apply to the Snackbar.
     */
    static showSnackbar(parentId, text, params) {
        const currentSnackbarId = this.#snackbarIds[`${parentId}-snackbar`];
        if (currentSnackbarId != null) {
            console.log('update');

            clearTimeout(currentSnackbarId);

            const snackbar = $(`#${parentId}-snackbar`);

            if (params != null) {
                snackbar.css(params);
            };
    
            snackbar.text();

            this.#hideSnackbarWithDelay(snackbar);
        } else {
            const snackbar = $(`<div id="${parentId}-snackbar" class="snackbar">${text}</div>`);

            if (params != null) {
                snackbar.css(params);
            };

            $(`#${parentId}-snackbar`).remove();
            $(`#${parentId}`).append(snackbar);

            snackbar
                .transition(
                    { opacity: 1, scale: 1 },
                    250,
                    () => this.#hideSnackbarWithDelay(snackbar)
                );
        }

        TelegramSDK.notificationOccured('success');
    }

    /**
     * Hide the snackbar instance after some amount of time (2000ms).
     * @param {*} snackbar Showing snackbar instance.
     */
    static #hideSnackbarWithDelay(snackbar) {
        this.#snackbarIds[snackbar.attr('id')] = setTimeout(() => {
            snackbar.transition({
                opacity: 0,
                scale: 0.24
            }, 200, () => {
                snackbar.remove();
                this.#snackbarIds[snackbar.attr('id')] = null;
            });
        }, 2000);
    }

}