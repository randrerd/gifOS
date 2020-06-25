"use strict";

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

  loadSetColorOption();
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

const searchbarSection = (() => {
  //DOM Cache
  const $inputBar = document.querySelector(".searchbox-input");
  const $autocompleteContainer = document.querySelector(
    ".searchbox-suggestions-container"
  );
  const $autocompleteSuggestionItems = document.querySelectorAll(
    ".searchbox-suggestions-text"
  );
  const $autocompleteSuggestionButtons = document.querySelectorAll(
    ".searchbox-suggestions-item"
  );
  const $submitBtn = document.querySelector(".searchbox-input-submit");
  const $searchResultsWrapper = document.querySelector(
    ".searchResults-content-wrapper"
  );
  const $searchResultsContainer = document.querySelector(
    ".searchResults-container"
  );
  const $suggestionsSection = document.querySelector(".suggestions-container");
  const $trendingSection = document.querySelector(".trending-container");
  const $returnArrowBtn = document.querySelector(".navbar-return-arrow");

  //Local Bindings
  let mainSuggestions = [];
  let totalSuggestions = [];
  let searchCounter = 0;

  //Event listeners
  $submitBtn.onclick = function () {
    showResults($inputBar.value);
  };
  $autocompleteSuggestionButtons.forEach((suggestion) => {
    suggestion.onclick = function () {
      let suggestionTerm = suggestion.childNodes[1].innerText;
      $inputBar.value = suggestionTerm;
      showResults($inputBar.value);
    };
  });

  async function getSearchResults(term) {
    try {
      let response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${$APIKey}&q=${term}&offset=0&limit=6`
      );
      let data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  function showResults(term) {
    $searchResultsContainer.childNodes[1].innerText = `Gifs de ${term}`;
    try {
      let data = getSearchResults(term);

      if (!searchCounter) {
        //On first search
        hideElements(
          $trendingSection,
          $suggestionsSection,
          $autocompleteContainer
        );
        showElements($searchResultsContainer, $returnArrowBtn);

        data.then((results) => {
          results.data.forEach((object) => {
            checkGifRatio(object)
              ? appendToContainer(
                  createGifElement(object, "result-large"),
                  $searchResultsWrapper
                )
              : appendToContainer(
                  createGifElement(object, "result-small"),
                  $searchResultsWrapper
                );
          });
        });
      } else {
        //Replaces previous gif elements with the results from
        //the last search made
        hideElements($autocompleteContainer);

        data.then((results) => {
          for (let i = 0; i < results.data.length; i++) {
            for (let j = 0; j < $searchResultsWrapper.childNodes.length; j++) {
              //Skips first iteration since first child is a #text non visible element
              const oldGif = $searchResultsWrapper.childNodes[j + 1];
              checkGifRatio(results.data[j])
                ? $searchResultsWrapper.replaceChild(
                    createGifElement(results.data[j], "result-large"),
                    oldGif
                  )
                : $searchResultsWrapper.replaceChild(
                    createGifElement(results.data[j], "result-small"),
                    oldGif
                  );
            }
          }
        });
      }
      searchCounter++;
    } catch (error) {
      console.log(error);
    }
  }

  const autocompletePortion = (() => {
    async function getAutocompleteTerms(term) {
      try {
        let response = await fetch(
          `https://api.giphy.com/v1/gifs/search/tags?api_key=${$APIKey}&q=${term}`
        );
        let data = await response.json();
        return data;
      } catch (error) {
        console.log(error);
      }
    }

    $inputBar.onkeyup = function (e) {
      let searchTerm = $inputBar.value;

      showElements($autocompleteContainer);
      getAutocompleteTerms(searchTerm).then((data) => {
        data.data.forEach((termsArray) => {
          replacePlaceholders(termsArray.name);
        });
      });
      //Hides the autocomplete container when ESC key is used or when
      //the user deletes all input bar
      if (e.keyCode === 27 || $inputBar.value === "") {
        hideElements($autocompleteContainer);
      }
      //Performs the search action when ENTER key is used
      else if (e.keyCode === 13) {
        showResults($inputBar.value);
      }
      //Removes the first four elements from the array to store the new suggestions
      let oldItems = mainSuggestions.splice(0, 4);
      //Store previous suggestions to allItems array for future use
      oldItems.forEach((item) => {
        totalSuggestions.push(item);
      });
      //Removes disabled attribute to submit button
      //when user starts typing so thet can use it to submit search
      $submitBtn.removeAttribute("disabled");
    };

    function replacePlaceholders(...suggestedTerms) {
      for (let i = 0; i < suggestedTerms.length; i++) {
        //Appends each suggested term to the mainSuggestions array
        const suggestedTerm = suggestedTerms[i];
        mainSuggestions.push(suggestedTerm);

        for (let j = 0; j < $autocompleteSuggestionItems.length; j++) {
          //Iterates over the existing placeholder elements and replaces
          //the empty content with the suggested terms found on mainSuggestions
          //array
          const itemPlaceholder = $autocompleteSuggestionItems[j];
          itemPlaceholder.textContent = mainSuggestions[j];
        }
      }
    }
  })();
})();

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
        checkGifRatio(element)
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

function checkGifRatio(object) {
  //Checks if the element's ratio is greater than itself and a half, if so, it
  //returns true
  let isLarge = false;
  object.images.original.width / object.images.original.height >= 1.5
    ? (isLarge = true)
    : (isLarge = false);
  return isLarge;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function addHashtagToWords(string) {
  let sentence = string.split(" ");
  let newSentence = "";
  for (let i = 0; i <= 3; i++) {
    let word = sentence[i];
    newSentence += `#${word} `;
  }
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
    case "result-small":
      $newContainer.innerHTML = `<div class="gif-container gif-and-tagline-wrapper">
        <a target="_blank" href="${object.bitly_url}" class="gif-result-link">
        <img
          src="${object.images.original.url}"
          alt="${object.title}"
          class="gif-content-img loading-animation"
        />
        <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
        </a>
      </div>`;
      return $newContainer.firstChild;

    case "result-large":
      $newContainer.innerHTML = `<div class="gif-container gif-large gif-and-tagline-wrapper">
        <a target="_blank" href="${object.bitly_url}" class="gif-result-link">
        <img
          src="${object.images.original.url}"
          alt="${object.title}"
          class="gif-content-img loading-animation"
        />
        <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
        </a>
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
