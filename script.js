"use strict";


const navbarSection = (() => {
  /*BUTTONS BINDINGS*/
  const $returnArrowBtn = document.querySelector(".navbar-return-arrow");
  const $returnBtn = document.querySelector(".navbar-logo-container");
  const $chooseThemeBtn = document.querySelector(".navbar-theme-btn");
  const $startCreatingPhaseBtn = document.querySelector(".create-btn");
  const $myGifsBtn = document.querySelector('.navbar-myGIFS-btn')
  const $lightThemeBtn = document.querySelector('.light-theme-btn')
  const $darkThemeBtn = document.querySelector('.dark-theme-btn');
  

  /*SECTIONS BINDINGS*/
  const $linkedTheme = document.querySelector('.link-theme');
  const $themeOptionsContainer = document.querySelector(".navbar-dropdown-theme-options-container");
  const $searchboxContainer = document.querySelector('.searchbox-container');
  const $suggestionsContainer = document.querySelector('.suggestions-container');
  const $trendingContainer = document.querySelector('.trending-container');
  const $searchResultsContainer = document.querySelector('.searchResults-container');
  const $myGifsContainer = document.querySelector('.myGifs-container');
  const $prephaseSections = [$searchboxContainer, $suggestionsContainer, $trendingContainer,$startCreatingPhaseBtn,$chooseThemeBtn,$myGifsBtn];
  const $creatingPhase1 = document.querySelector('.creating-phase-step1');
  const $creatingPhase2 = document.querySelector('.creating-phase-step2');
  const $creatingPhase3 = document.querySelector('.creating-phase-step3');
  const $creatingPhase4 = document.querySelector('.creating-phase-step4');
  const $creatingPhase5 = document.querySelector('.creating-phase-step5');
  const $creatingPhase6 = document.querySelector('.creating-phase-step6');
  
  /*EVENT LISTENERS*/
  $lightThemeBtn.onclick = function () {
    $linkedTheme.setAttribute('href','styles/themes/sailor_day.css');
  }
  $darkThemeBtn.onclick = function () {
    $linkedTheme.setAttribute('href','styles/themes/sailor_night.css');
  }


  $chooseThemeBtn.onclick = function () {
    $themeOptionsContainer.classList.toggle("is-active");
  };
  
  $startCreatingPhaseBtn.onclick = function () {
    showElements($returnArrowBtn, $creatingPhase1, $myGifsContainer);
    addFlex($creatingPhase1);
    $prephaseSections.forEach(element => {
      hideElements(element)
    });
  }
  $returnBtn.onclick = function () {
    window.location = "/";
  };
})();

const creatingPhaseStage1Functions = (() =>{
/*SECTIONS BINDINGS*/
const $creatingPhase1 = document.querySelector('.creating-phase-step1');
const $creatingPhase2 = document.querySelector('.creating-phase-step2');

/*BUTTONS BINDINGS */
const $cancelBtn = document.querySelectorAll('.create-gif-cancel-btn');
const $startBtn = document.querySelector('.create-gif-start-btn');

$cancelBtn.forEach(element => {
  element.onclick =(() => {
    window.location = '/';
  })
});


$startBtn.onclick = (() =>{
  hideElements($creatingPhase1);
  removeFlex($creatingPhase1);
  showElements($creatingPhase2);
  addFlex($creatingPhase2);
  
})
})()

function hideElements(...elements) {
	elements.forEach(element => {
		element.classList.add("hidden");
	});
}
function showElements(...elements) {
	elements.forEach(element => {
		element.classList.remove("hidden");
	});
}
function addFlex(...elements) {
  elements.forEach(element => {
    element.classList.add('flex');
  })
}
function removeFlex(...elements) {
  elements.forEach(element => {
    element.classList.remove('flex');
  })
}