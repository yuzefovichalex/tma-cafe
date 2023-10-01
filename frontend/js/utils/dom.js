export function replaceShimmerContent(containerSelector, templateSelector, loadableImageSelector, data, templateSetup) {
    let templateHtml = $(templateSelector).html();
    var imageLoaded = 0;
    let imageShouldBeLoaded = data.length;
    let filledTemplates = [];
    data.forEach(dataItem => {
        let filledTemplate = $(templateHtml);
        templateSetup(filledTemplate, dataItem);
        filledTemplate.find(loadableImageSelector).on('load', () => {
            imageLoaded++;
            if (imageLoaded == imageShouldBeLoaded) {
                fillContainer(containerSelector, filledTemplates);
            }
        });
        filledTemplates.push(filledTemplate);
    });
}

export function fillContainer(selector, elements) {
    let container = $(selector);
    container.empty();
    elements.forEach(el => container.append(el));
}

export function loadImage(imageSelector, imageUrl) {
    const image = $(imageSelector);
    if (image != null) {
        if (!image.hasClass('shimmer')) {
            image.addClass('shimmer');
        }
        image.attr('src', imageUrl);
        image.on('load', () => image.removeClass('shimmer'));
    }
}