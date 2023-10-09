/**
 * Performs GET request.
 * @param {string} endpoint API endpoint path, e.g. '/info'.
 * @param {*} onSuccess Callback on successful request.
 */
export function get(endpoint, onSuccess) {
    $.ajax({
        //url: 'http://localhost:5000' + endpoint,
        url: '/api' + endpoint,
        dataType: "json",
        success: result => onSuccess(result)
    });
}

/**
 * Performs POST request.
 * @param {string} endpoint API endpoint path, e.g. '/order'.
 * @param {string} data Request body in JSON format.
 * @param {*} onResult Callback on request result. In case of success, returns
 *                      result = { ok: true, data: <data-from-backend> }, otherwise
 *                      result = { ok: false, error: 'Something went wrong' }.
 */
export function post(endpoint, data, onResult) {
    $.ajax({
        type: 'POST',
        //url: 'http://localhost:5000' + endpoint,
        url: '/api' + endpoint,
        data: data,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: result => onResult({ ok: true, data: result}),
        error: xhr => onResult({ ok: false, error: 'Something went wrong.'})
    })
}