"use strict";

const navbarSection = (() => {
  /*DOM Cache*/

  const $returnBtn = document.querySelector(".navbar-logo-container");
  const $returnArrowBtn = document.querySelector(".navbar-return-arrow");
  const $themeStylesheetLink = document.querySelector(".link-theme");

  /*Local Variables*/
  const themeOptions = ["sailor_day", "sailor_night"];

  /*Event Listeners*/
  window.onload = function () {
    $returnArrowBtn.classList.remove("hidden");
    loadSetColorOption();
  };
  $returnBtn.onclick = function () {
    window.location = "index.html";
  };

  function loadSetColorOption() {
    sessionStorage.getItem("themeOption")
      ? setColorOption(sessionStorage.getItem("themeOption"))
      : setColorOption(themeOptions[0]);
  }
  function setColorOption(theme) {
    $themeStylesheetLink.setAttribute("href", `styles/themes/${theme}.css`);
    sessionStorage.setItem("themeOption", `${theme}`);
  }
})();

const creatingPhase = (() => {
  /*DOM Cache */
  const $body = document.querySelector("body");
  const $creatingPhase1 = document.querySelector(".creating-phase-step1");
  const $creatingPhase2 = document.querySelector(".creating-phase-step2");
  const $creatingPhase3 = document.querySelector(".creating-phase-step3");
  const $creatingPhase4 = document.querySelector(".creating-phase-step4");
  const $creatingPhase5 = document.querySelector(".creating-phase-step5");
  const $creatingPhase6 = document.querySelector(".creating-phase-step6");

  $creatingPhase1.classList.remove("hidden");
})();
