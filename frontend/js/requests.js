const baseApiUrl = 'http://127.0.0.1:8000/api'

$.ajaxSetup({
    beforeSend: (xhr, options) => options.url = baseApiUrl + options.url
})

export function get(endpoint, onSuccess) {
    $.ajax({
        url: endpoint,
        dataType: "json",
        success: result => onSuccess(result)
    });
}