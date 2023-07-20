export const extractFirst3000Words = (inputString) => {
  const trimmedString = inputString.trim();

  const wordsArray = trimmedString.split(/\s+/);

  const first3000Words = wordsArray.slice(0, 3000);

  const resultString = first3000Words.join(' ');

  return resultString;
};
