export function resizeTextarea(textarea: HTMLTextAreaElement, minHeight = 30) {
  textarea.style.height = `${minHeight}px`;
  textarea.style.height = `${textarea.scrollHeight}px`;
}
