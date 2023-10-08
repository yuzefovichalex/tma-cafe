export class TelegramSDK {

    static #mainButtonClickCallback
    static #backButtonClickCallback

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

    static close() {
        Telegram.WebApp.close();
    }

}