/**
 * Wrapper for simplifying usage of Telegram.WebApp class and it's methods.
 */
export class TelegramSDK {

    static #mainButtonClickCallback
    static #backButtonClickCallback

    static getInitData() {
        return Telegram.WebApp.initData || '';
    }

    static showMainButton(text, onClick) {
        // $('#telegram-button').text(text);
        // $('#telegram-button').off('click').on('click', onClick);
        // $('#telegram-button').show();
        Telegram.WebApp.MainButton
            .offClick(this.#mainButtonClickCallback)
            .setParams({
                text: text,
                is_visible: true
            })
            .onClick(onClick);
        this.#mainButtonClickCallback = onClick;
    }

    static setMainButtonLoading(isLoading) {
        if (isLoading) {
            Telegram.WebApp.MainButton.showProgress(false);
        } else {
            Telegram.WebApp.MainButton.hideProgress();
        }
    }

    static hideMainButton() {
        //$('#telegram-button').hide();
        Telegram.WebApp.MainButton.hide();
    }

    static showBackButton(onClick) {
        Telegram.WebApp.BackButton
            .offClick(this.#backButtonClickCallback)
            .onClick(onClick)
            .show();
        this.#backButtonClickCallback = onClick;
    }

    static hideBackButton() {
        Telegram.WebApp.BackButton.hide();
    }

    static impactOccured(style) {
        if (Telegram.WebApp.isVersionAtLeast('6.1')) {
            Telegram.WebApp.HapticFeedback.impactOccurred(style);
        }
    }

    static notificationOccured(style) {
        if (Telegram.WebApp.isVersionAtLeast('6.1')) {
            Telegram.WebApp.HapticFeedback.notificationOccurred(style);
        }
    }

    static openInvoice(url, callback) {
        Telegram.WebApp.openInvoice(url, callback);
    }

    static expand() {
        Telegram.WebApp.expand();
    }

    static close() {
        Telegram.WebApp.close();
    }

}