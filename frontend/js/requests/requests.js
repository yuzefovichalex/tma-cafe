export function get(endpoint, onSuccess) {
    $.ajax({
        url: '/api' + endpoint,
        dataType: "json",
        success: result => onSuccess(result)
    });
}

export function post(endpoint, data, onSuccess) {
    $.post({
        url: '/api' + endpoint,
        data: data,
        success: result => onSuccess(result)
    })
}