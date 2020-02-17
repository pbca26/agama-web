export const copyToClipboard = (value) => {
  let result;
  const copyTextarea = document.querySelector('#js-copytextarea');

  copyTextarea.value = value;
  copyTextarea.select();

  try {
    document.execCommand('copy');
    result = 1;
  } catch (err) {
    result = 0;
  }

  return result;
};