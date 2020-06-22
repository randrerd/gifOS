"use strict";

//TO-DO: Infinite scrolling on trending section; searchSection.
/*Global Constants */
const $APIKey = "AtDXUGwf0oBU7IXtdm8Ztz3zUP1ct6nO";

const navbarSection = (() => {
  /*DOM Cache*/
  const $body = document.querySelector("body");
  const $returnBtn = document.querySelector(".navbar-logo-container");
  const $chooseThemeBtn = document.querySelector(".navbar-theme-btn");
  const $startCreatingPhaseBtn = document.querySelector(".create-btn");
  const $myGifsBtn = document.querySelector(".navbar-myGIFS-btn");
  const $returnArrowBtn = document.querySelector(".navbar-return-arrow");
  const $themeOptionsContainer = document.querySelector(
    ".navbar-dropdown-theme-options-container"
  );
  const $themeOptionsElements = document.querySelectorAll(
    ".navbar-dropdown-theme-option"
  );
  const $themeStylesheetLink = document.querySelector(".link-theme");
  const $suggestionsSection = document.querySelector(".suggestions-container");
  const $trendingSection = document.querySelector(".trending-container");
  const $myGifsSection = document.querySelector(".myGifs-container");

  /*Local variables*/
  const themeOptions = ["sailor_day", "sailor_night"];

  /*Event Listeners*/
  window.onload = () => {
    //Calls functions on page load
    loadSetColorOption();
  };
  //When clicking outside the div containing the theme options, hides it
  //if visible
  document.onclick = function (e) {
    if ($themeOptionsContainer.classList.contains("is-active")) {
      if (
        !(
          e.target.classList.contains("navbar-theme-btn") ||
          e.target.classList.contains(
            "navbar-dropdown-theme-options-container"
          ) ||
          e.target.classList.contains("navbar-theme-btn-text")
        )
      ) {
        $themeOptionsContainer.classList.toggle("is-active");
      }
    }
  };
  $myGifsBtn.onclick = function () {
    //Toggles 'hidden' class to show only MyGifs section
    hideElements($suggestionsSection, $trendingSection);
    showElements($myGifsSection, $returnArrowBtn);
  };
  $startCreatingPhaseBtn.onclick = function () {
    window.location = "create.html";
  };
  $returnBtn.onclick = function () {
    window.location = "index.html";
  };
  $chooseThemeBtn.onclick = function () {
    $themeOptionsContainer.classList.toggle("is-active");
  };
  $themeOptionsElements.forEach((option) => {
    //Sets theme option selected by user
    option.onclick = function () {
      option === $themeOptionsElements[0]
        ? setColorOption(themeOptions[0])
        : setColorOption(themeOptions[1]);
      //Closes the div containing the theme options once user has selected
      $themeOptionsContainer.classList.remove("is-active");
    };
  });
  function loadSetColorOption() {
    //If the user had selected an option in the past, sets the stylesheet to it,
    //if not it sets the default light theme
    localStorage.getItem("themeOption")
      ? setColorOption(localStorage.getItem("themeOption"))
      : setColorOption(themeOptions[0]);
  }
  function setColorOption(theme) {
    $themeStylesheetLink.setAttribute("href", `styles/themes/${theme}.css`);
    localStorage.setItem("themeOption", `${theme}`);
  }
})();

const searchSection = (() => {})();

const suggestionsSection = (() => {
  /*DOM Cache*/
  const $suggestionsContainer = document.querySelector(
    ".suggestions-parent-element"
  );

  /*Local variables*/
  const suggestedSearchTerms = [
    "midnight+gospel",
    "bianca+del+rio",
    "tiffany+pollard",
    "soraya+montenegro",
    "beyonce",
    "trippy",
    "amy+winehouse",
    "frank+ocean",
    "kali+uchis",
  ];
  const randomSuggestion = getRandomSuggestion(suggestedSearchTerms);

  function getRandomSuggestion(array) {
    let randomNumberArray = Math.floor(Math.random() * array.length);
    return array[randomNumberArray];
  }

  async function getSuggestions(suggestionTerms) {
    try {
      let response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${$APIKey}&q=${suggestionTerms}
         &limit=4&rating=G&lang=en&offset=${getRandomArbitrary(0, 20)}`
      );
      let data = await response.json();
      data.data.forEach((element) => {
        appendToContainer(
          createGifElement(element, "suggestions"),
          $suggestionsContainer
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  //Calls the async function
  getSuggestions(randomSuggestion);
})();

const trendingSection = (() => {
  /*DOM Cache*/
  const $trendingContainer = document.querySelector(".trending-parent-element");
  const $body = document.querySelector("body");
  let offset = 0;

  async function getTrending(defaultLoad = 12) {
    try {
      let response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${$APIKey}&limit=12&rating=R&offset=${
          defaultLoad * offset
        }`
      );
      let data = await response.json();
      data.data.forEach((element) => {
        //Checks if the element's ratio is greater than itself and a half, if so, it gets assigned
        //a large container and then appends it to the trending section div element.
        element.images.original.width / element.images.original.height >= 1.5
          ? appendToContainer(
              createGifElement(element, "trending-large"),
              $trendingContainer
            )
          : appendToContainer(
              createGifElement(element, "trending-small"),
              $trendingContainer
            );
      });
      offset++;
    } catch (error) {
      console.log(error);
    }
  }
  getTrending();
  

})();

/*Global functions*/

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function addHashtagToWords(string) {
  let sentence = string.split(" ");
  let newSentence = "";
  sentence.forEach((word) => {
    newSentence += `#${word} `;
  });
  return newSentence;
}

function createGifElement(object, type) {
  const $newContainer = document.createElement("div");

  switch (type) {
    case "suggestions":
      $newContainer.innerHTML = `<div class="gif-container">
      <div class="gif-header-container">
        <h2 class="gif-title">${object.title}</h2>
        <button class="gif-times-btn"></button>
      </div>
      <div class="gif-content-wrapper">
        <img
          src="${object.images.original.url}"
          alt="${object.title}"
          class="gif-content-img loading-animation"
        />
        <a target=_blank href="${object.bitly_url}" class="gif-content-details-btn">Ver más...</a>
      </div>
    </div>`;
      return $newContainer.firstChild;
      break;

    case "trending-small":
      $newContainer.innerHTML = `<div class="gif-container gif-and-tagline-wrapper">
      <img
        src="${object.images.original.url}"
        alt="${object.title}"
        class="gif-content-img loading-animation"
      />
      <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
    </div>`;
      return $newContainer.firstChild;

    case "trending-large":
      $newContainer.innerHTML = `<div class="gif-container gif-large gif-and-tagline-wrapper">
      <img
        src="${object.images.original.url}"
        alt="${object.title}"
        class="gif-content-img loading-animation"
      />
      <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
    </div>`;
      return $newContainer.firstChild;
  }
}

function appendToContainer(element, parent) {
  parent.appendChild(element);
}

function hideElements(...elements) {
  elements.forEach((element) => {
    element.classList.add("hidden");
  });
}
function showElements(...elements) {
  elements.forEach((element) => {
    element.classList.remove("hidden");
  });
}
function addFlex(...elements) {
  elements.forEach((element) => {
    element.classList.add("flex");
  });
}
function removeFlex(...elements) {
  elements.forEach((element) => {
    element.classList.remove("flex");
  });
}
