export function removeIf(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            array.splice(i, 1);
            i--;
        }
    }
}