/**
 * Shuffles the elements of an array randomly using the Fisher-Yates shuffle algorithm.
 *
 * @param {Array} array - The array to be shuffled.
 * @returns {void}
 */
function mixArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

module.exports = {
    mixArray
}
