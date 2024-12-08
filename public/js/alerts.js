const mainWindowEl = document.querySelector(".game-window");

// Cannot trigger several alerts
let isAlert = false;

const hideAlert = () => {
  isAlert = false;
  const el = document.querySelector(".alert");
  el.style.opacity = 0;
  setTimeout(() => {
    if (el) el.parentElement.removeChild(el);
  }, 500);
};

export const showAlert = (title, message) => {
  if (!isAlert) {
    isAlert = true;
    mainWindowEl.insertAdjacentHTML(
      "beforeend",
      `<div class="alert">${message}</div>`
    );
    setTimeout(() => {
      hideAlert();
    }, 5000);
  }
};
