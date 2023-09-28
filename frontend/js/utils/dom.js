export function replaceShimmerContent(containerSelector, templateSelector, loadableImageSelector, data, templateSetup) {
    let templateHtml = $(templateSelector).html();
    var imageLoaded = 0;
    let imageShouldBeLoaded = data.length;
    let filledTemplates = [];
    data.forEach(dataItem => {
        let filledTemplate = $(templateHtml);
        templateSetup(filledTemplate, dataItem);
        filledTemplate.find(loadableImageSelector).on('load', function() {
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