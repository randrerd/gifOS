const themeOptions = ["sailor_day", "sailor_night"];
const $themeStylesheetLink = document.querySelector(".link-theme");

const loadSetColorOption = (() => {
    //If the user had selected an option in the past, sets the stylesheet to it,
    //if not it sets the default light theme
    localStorage.getItem("themeOption")
      ? setColorOption(localStorage.getItem("themeOption"))
      : setColorOption(themeOptions[0]);
  })()
  function setColorOption(theme) {
    $themeStylesheetLink.setAttribute("href", `styles/themes/${theme}.css`);
    localStorage.setItem("themeOption", `${theme}`);
  }