export function get(endpoint, onSuccess) {
    $.ajax({
        url: '/api' + endpoint,
        dataType: "json",
        success: result => onSuccess(result)
    });
}