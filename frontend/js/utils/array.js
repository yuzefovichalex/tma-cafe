/**
 * Removes all found items match provided predicate.
 * @param {Array} array Target array.
 * @param {*} predicate Condition for item selection.
 */
export function removeIf(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            array.splice(i, 1);
            i--;
        }
    }
}