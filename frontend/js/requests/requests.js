export function get(endpoint, onSuccess) {
    $.ajax({
        url: '/api' + endpoint,
        dataType: "json",
        success: result => onSuccess(result)
    });
}

export function post(endpoint, data, onSuccess) {
    $.ajax({
        type: 'POST',
        url: '/api' + endpoint,
        data: data,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: result => onSuccess(result)
    })
}