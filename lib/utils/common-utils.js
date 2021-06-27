// convert a string into title case
const toTitleCase = (str) =>
    str
        .toLowerCase()
        .split(' ')
        .map((word) => word.replace(word[0], word[0].toUpperCase()))
        .join(' ');

// https://github.com/regexhq/whitespace-regex
const whitespaceRegex = /^[\s\f\n\r\t\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\x09\x0a\x0b\x0c\x0d\x20\xa0]+$/;

/**
 * Is string blank.
 * @param str string to  input
 * @return true with length 0 or any unicode "blank" chars
 */
const isBlank = (str) => typeof str !== 'string' || !str.length || whitespaceRegex.test(str);

module.exports = {
    toTitleCase,
    isBlank,
};
