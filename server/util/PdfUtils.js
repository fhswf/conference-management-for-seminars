const pdf = require('pdf-parse');

async function isValidPdf(buffer) {
    return await pdf(buffer).then(function(data) {
        return true;
    }).catch((error) => {
        return false;
    })
}

async function pdfContainsText(buffer, text) {
    return await pdf(buffer).then(function(data) {
        return data.text.includes(text);
    }).catch((error) => {
        return false;
    })
}

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
