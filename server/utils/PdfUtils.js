const pdf = require('pdf-parse');

/**
 * Checks if a given buffer contains a valid PDF file.
 *
 * @param {Buffer} buffer
 * @returns {Promise<boolean>}
 */
async function isValidPdf(buffer) {
    return await pdf(buffer).then(function(data) {
        return true;
    }).catch((error) => {
        return false;
    })
}

/**
 * Checks if a given PDF buffer contains a specific text.
 *
 * @param {Buffer} buffer
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function pdfContainsText(buffer, text) {
    return await pdf(buffer).then(function(data) {
        return data.text.includes(text);
    }).catch((error) => {
        return false;
    })
}

/**
 * Replace given strings in a filename with 'x'.
 *
 * @param {string} filename
 * @param {Array<string>} stringArray
 * @returns {string}
 */
function replaceInFilename(filename, stringArray) {
    let newFilename = filename;

    stringArray.forEach(str => {
        newFilename = filename.replace(new RegExp(str, 'gi'), 'x');
    });

    return newFilename;
}

module.exports = {
    isValidPdf,
    pdfContainsText,
    replaceInFilename
}
