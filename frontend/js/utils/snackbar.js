import { TelegramSDK } from "../telegram/telegram.js";

export class Snackbar {

    static #snackbarIds = { };

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