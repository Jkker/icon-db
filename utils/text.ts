export const getFirstCapitalizedWord = (str = '') =>
  str.match(/[A-Z][a-z]+/)[0].toLowerCase();
