export class TelegramSDK {

    static showMainButton(text, onClick) {
        $('#telegram-button').text(text);
        $('#telegram-button').off('click').on('click', onClick);
        $('#telegram-button').show();
        // const mainButton = Telegram.WebApp.MainButton;
        // mainButton.setParams({
        //     text: text,
        //     is_visible: true
        // });
        // mainButton.onClick(onClick);
    }

    static hideMainButton() {
        $('#telegram-button').hide();
        //Telegram.WebApp.MainButton.hide();
    }

    static showBackButton(onClick) {
        const backButton = Telegram.WebApp.BackButton.show();
        backButton.show();
        backButton.onClick(onClick);
    }

    static hideBackButton() {
        Telegram.WebApp.BackButton.hide();
    }

    static openInvoice(url, callback) {
        Telegram.WebApp.openInvoice(url, callback);
    }

}