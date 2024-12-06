const mainWindowEl = document.querySelector(".game-window");

const hideAlert = () => {
  const el = document.querySelector(".alert");
  el.style.opacity = 0;
  setTimeout(() => {
    if (el) el.parentElement.removeChild(el);
  }, 500);
};

export const showAlert = (title, message) => {
  mainWindowEl.insertAdjacentHTML(
    "beforeend",
    `<div class="alert">${message}</div>`
  );
  setTimeout(() => {
    hideAlert();
  }, 5000);
};
