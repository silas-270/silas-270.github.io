// chatwidget/chat-widget.js
const textarea     = document.getElementById('input-field');
const inputWrapper = document.getElementById('input-wrapper');

textarea.addEventListener('input', () => {
  // 1) Textarea-Höhe zurücksetzen, damit sie schrumpfen kann
  textarea.style.height = 'auto';
  // 2) Wrapper-Höhe komplett entfernen, damit CSS wieder greift
  inputWrapper.style.removeProperty('height');

  // 3) Neue Höhe für das Textarea berechnen (max. 5 Zeilen)
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
  const maxHeight  = lineHeight * 1.4 * 5;
  const newHeight  = Math.min(textarea.scrollHeight, maxHeight);

  textarea.style.height = `${newHeight}px`;

  // 4) Falls Du dennoch eine exakte Wrapper-Höhe setzen möchtest:
  //    wir nehmen das Padding-Top und -Bottom aus dem CSS und addieren es
  const style       = getComputedStyle(inputWrapper);
  const padTop      = parseFloat(style.paddingTop);
  const padBottom   = parseFloat(style.paddingBottom);
  const wrapperH    = newHeight + padTop + padBottom;
  inputWrapper.style.height = `${wrapperH}px`;
});