const baseApiUrl = 'http://127.0.0.1:8000/api'

export function get(endpoint, onSuccess) {
    $.ajax({
        url: baseApiUrl + endpoint,
        dataType: "json",
        success: result => onSuccess(result)
    });
}