'use strict';

/*Global Constants */
const $APIKey = 'AtDXUGwf0oBU7IXtdm8Ztz3zUP1ct6nO';

const navbarSection = (() => {
  /*DOM Cache*/
  const $body = document.querySelector('body');
  const $returnBtn = document.querySelector('.navbar-logo-container');
  const $chooseThemeBtn = document.querySelector('.navbar-theme-btn');
  const $startCreatingPhaseBtn = document.querySelector('.create-btn');
  const $myGifsBtn = document.querySelector('.navbar-myGIFS-btn');
  const $returnArrowBtn = document.querySelector('.navbar-return-arrow');
  const $themeOptionsContainer = document.querySelector(
    '.navbar-dropdown-theme-options-container'
  );
  const $themeOptionsElements = document.querySelectorAll(
    '.navbar-dropdown-theme-option'
  );
  const $themeStylesheetLink = document.querySelector('.link-theme');
  const $suggestionsSection = document.querySelector('.suggestions-container');
  const $trendingSection = document.querySelector('.trending-container');
  const $myGifsSection = document.querySelector('.myGifs-container');

  /*Local variables*/
  const themeOptions = ['sailor_day', 'sailor_night'];

  //When clicking outside the div containing the theme options, hides it
  //if visible
  document.onclick = function (e) {
    if ($themeOptionsContainer.classList.contains('is-active')) {
      if (
        !(
          e.target.classList.contains('navbar-theme-btn') ||
          e.target.classList.contains(
            'navbar-dropdown-theme-options-container'
          ) ||
          e.target.classList.contains('navbar-theme-btn-text')
        )
      ) {
        $themeOptionsContainer.classList.toggle('is-active');
      }
    }
  };
  $myGifsBtn.onclick = function () {
    //Toggles 'hidden' class to show only MyGifs section
    hideElements($suggestionsSection, $trendingSection);
    showElements($myGifsSection, $returnArrowBtn);
  };
  $startCreatingPhaseBtn.onclick = function () {
    window.location = 'create.html';
  };
  $returnBtn.onclick = function () {
    window.location = 'index.html';
  };
  $chooseThemeBtn.onclick = function () {
    $themeOptionsContainer.classList.toggle('is-active');
  };
  $themeOptionsElements.forEach((option) => {
    //Sets theme option selected by user
    option.onclick = function () {
      option === $themeOptionsElements[0]
        ? setColorOption(themeOptions[0])
        : setColorOption(themeOptions[1]);
      //Closes the div containing the theme options once user has selected
      $themeOptionsContainer.classList.remove('is-active');
    };
  });

  function setColorOption(theme) {
    $themeStylesheetLink.setAttribute('href', `styles/themes/${theme}.css`);
    localStorage.setItem('themeOption', `${theme}`);
  }
})();

const searchbarSection = (() => {
  //DOM Cache
  const $inputBar = document.querySelector('.searchbox-input');
  const $autocompleteContainer = document.querySelector(
    '.searchbox-suggestions-container'
  );
  const $autocompleteSuggestionItems = document.querySelectorAll(
    '.searchbox-suggestions-text'
  );
  const $autocompleteSuggestionButtons = document.querySelectorAll(
    '.searchbox-suggestions-item'
  );
  const $submitBtn = document.querySelector('.searchbox-input-submit');
  const $searchResultsWrapper = document.querySelector(
    '.searchResults-content-wrapper'
  );
  const $searchResultsContainer = document.querySelector(
    '.searchResults-container'
  );
  const $suggestionsSection = document.querySelector('.suggestions-container');
  const $trendingSection = document.querySelector('.trending-container');
  const $returnArrowBtn = document.querySelector('.navbar-return-arrow');
  const $searchHistoryContainer = document.querySelector(
    '.searchbox-search-history-container'
  );

  //Local Bindings
  let mainSuggestions = [];

  function getSearchHistory() {
    let searchHistory = localStorage.getItem('searchHistory');
    if (searchHistory) {
      let terms = searchHistory.split(', ');
      return terms;
    } else return false;
  }

  //Event listeners

  $submitBtn.onclick = function () {
    getSearchResults(0, $inputBar.value);
  };

  $autocompleteSuggestionButtons.forEach((suggestion) => {
    suggestion.onclick = function () {
      let suggestionTerm = suggestion.childNodes[1].innerText;
      $inputBar.value = suggestionTerm;
      getSearchResults(0, $inputBar.value);
    };
  });
  let offset = 0;
  async function getSearchResults(externalOffset, term) {
    try {
      const searchHidden = $searchResultsContainer.classList.contains('hidden');
      const searchedTerms = getSearchHistory();

      let response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${$APIKey}&q=${term}&offset=${offset + externalOffset}&limit=8`
      );
      let data = await response.json();
     

      if (searchHidden) {
        //On first search
        hideElements(
          $trendingSection,
          $suggestionsSection,
          $autocompleteContainer
        );
        showElements(
          $searchResultsContainer,
          $returnArrowBtn,
          $searchHistoryContainer,
          $searchHistoryContainer
        );
      } else {
        hideElements($autocompleteContainer);
      }
      data.data.forEach((element) => {
        checkGifRatio(element)
          ? appendToContainer(
              createGifElement(element, 'result-large'),
              $searchResultsWrapper
            )
          : appendToContainer(
              createGifElement(element, 'result-small'),
              $searchResultsWrapper
            );
      });

      if (!(term === searchedTerms[searchedTerms.length - 1])) {
        //When function not being called by lazyload
        storeSearchHistory(term);
        renderTags();
        const array = Array.from($searchResultsWrapper.children);
        array.forEach((element) => {
          element.remove();
        });
      } else {
        offset += 8;
      }

      $searchHistoryContainer.childNodes.forEach((tag) => {
        tag.onclick = function () {
          let tagText = tag.innerText;
          //Removes the '#' symbol from the tag for it
          //to be searchable
          let searchableTerm = tagText.slice(1, tagText.length);
          $inputBar.value = searchableTerm;
          getSearchResults(0, searchableTerm);
        };
      });

      //Updates container header with the search term
      $searchResultsContainer.childNodes[1].innerText = `Gifs de ${term}`;
      lazyLoad(getSearchResults, $searchResultsWrapper);
    } catch (err) {
      console.log(err);
    }
  }

  function storeSearchHistory(term) {
    //Checks if there's already search history data stored
    //if not, then sets it
    if (!localStorage.getItem('searchHistory')) {
      localStorage.setItem('searchHistory', term);
    } else {
      let previousHistory = localStorage.getItem('searchHistory');
      let newHistory = (previousHistory += `, ${term}`);
      localStorage.setItem('searchHistory', newHistory);
    }
  }

  function renderTags() {
    //Gets value from localStorage searchHistory key and
    //sets an array with each of the terms stored in the key
    //value
    let keyValue = localStorage.getItem('searchHistory');
    let searchHistoryArray = keyValue.split(', ');

    let tags = addHashtagToSentences(searchHistoryArray);

    //Checks if there's any tag already rendered
    if (!$searchHistoryContainer.childElementCount) {
      //Renders tags from existing search history
      tags.forEach((tag) => {
        appendToContainer(
          createGifElement(tag, 'searchHistoryTag'),
          $searchHistoryContainer
        );
      });
    } else {
      //Renders tag for the last search made
      appendToContainer(
        createGifElement(tags[tags.length - 1], 'searchHistoryTag'),
        $searchHistoryContainer
      );
    }
  }

  function addHashtagToSentences(array) {
    let result = [];

    array.forEach((item) => {
      let hashtaggedItem = '';
      hashtaggedItem += `#${item}`;
      result.push(hashtaggedItem);
    });
    return result;
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
      if (e.keyCode === 27 || $inputBar.value === '') {
        hideElements($autocompleteContainer);
      }
      //Performs the search action when ENTER key is used
      else if (e.keyCode === 13) {
        getSearchResults(0, $inputBar.value);
      }
      //Removes the first four elements from the array to store the new suggestions
      let oldItems = mainSuggestions.splice(0, 4);

      //Removes disabled attribute to submit button
      //when user starts typing so thet can use it to submit search
      $submitBtn.removeAttribute('disabled');
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
    '.suggestions-parent-element'
  );

  /*Local variables*/
  const suggestedSearchTerms = [
    'midnight+gospel',
    'bianca+del+rio',
    'tiffany+pollard',
    'soraya+montenegro',
    'beyonce',
    'trippy',
    'amy+winehouse',
    'frank+ocean',
    'kali+uchis',
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

      let i = 0;
      data.data.forEach((element) => {
        replaceLazy($suggestionsContainer, element, 'suggestions', i);
        i++;
      });
    } catch (error) {
      console.log(error);
    }
  }

  for (let i = 0; i < 4; i++) {
    appendToContainer(
      createGifElement(null, 'suggestions-lazy'),
      $suggestionsContainer
    );
  }

  // Calls the async function
  getSuggestions(randomSuggestion);
})();

const trendingSection = (() => {
  /*DOM Cache*/
  const $trendingContainer = document.querySelector('.trending-parent-element');
  const $body = document.querySelector('body');
  const $footer = document.querySelector('footer');

  let trendingLoaded = false;

  async function getTrending(offset) {
    try {
      let response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${$APIKey}&limit=8&rating=R&offset=${offset}`
      );
      let data = await response.json();

      if (!trendingLoaded) {
        let i = 0;
        data.data.forEach((element) => {
          checkGifRatio(element)
            ? replaceLazy($trendingContainer, element, 'trending-large', i)
            : replaceLazy($trendingContainer, element, 'trending-small', i);

          i++;
        });
        trendingLoaded = true;
      } else {
        data.data.forEach((element) => {
          checkGifRatio(element)
            ? appendToContainer(
                createGifElement(element, 'trending-large'),
                $trendingContainer
              )
            : appendToContainer(
                createGifElement(element, 'trending-small'),
                $trendingContainer
              );
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  for (let i = 0; i < 8; i++) {
    appendToContainer(
      createGifElement(null, 'trending-lazy'),
      $trendingContainer
    );
  }
  lazyLoad(getTrending, $trendingContainer);
})();

function lazyLoad(cb, mainContainer) {
  let offset = 0;
  const $footer = document.querySelector('footer');
  const $inputBar = document.querySelector('.searchbox-input');

  if ('IntersectionObserver' in window) {
    const options = {
      threshold: 0.15,
    };
    // Create new observer object
    let lazyImageCallback = (entries, observer) => {
      // Loop through IntersectionObserverEntry objects
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          console.log('intersecting')
          mainContainer.classList.contains('searchResults-content-wrapper')
            ? cb(offset, $inputBar.value)
            : cb(offset);
          offset += 8;
        }
      });
    };
    let containerChildren = mainContainer.childNodes;

    let lazyImageObserver = new IntersectionObserver(
      lazyImageCallback,
      options
    );
    // Loop through and observe each image if not a search
    if (!mainContainer.classList.contains('searchResults-content-wrapper')) {
      containerChildren.forEach((lazyImage) => {
        lazyImageObserver.observe(lazyImage);
      });
    }

    //Observe footer and loads new images
    lazyImageObserver.observe($footer);
  }
}

const myGifsSection = (() => {
  const $myGifsContainer = document.querySelector('.myGifs-content-wrapper');

  if (!localStorage.getItem('uploadedGifs')) {
    null;
  } else {
    let uploadHistoryValue = localStorage.getItem('uploadedGifs');
    let uploadHistoryIDs = uploadHistoryValue.split(', ');
    uploadHistoryIDs.forEach((element) => {
      // appendToContainer(createGifElement(getUploadedGif(element), 'myGif'),$myGifsContainer);
      getUploadedGif(element).then((data) => {
        try {
          checkGifRatio(data)
            ? appendToContainer(
                createGifElement(data, 'myGif-large'),
                $myGifsContainer
              )
            : appendToContainer(
                createGifElement(data, 'myGif-small'),
                $myGifsContainer
              );
        } catch (error) {
          console.log(error);
        }
      });
    });
  }
  async function getUploadedGif(id) {
    try {
      let response = await fetch(
        `https://api.giphy.com/v1/gifs/${id}?api_key=${$APIKey}`
      );
      let data = await response.json();

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
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
  let sentence = string.split(' ');
  let newSentence = '';
  for (let i = 0; i <= 3; i++) {
    let word = sentence[i];
    newSentence += `#${word} `;
  }
  return newSentence;
}

function createGifElement(object, type) {
  const $newContainer = document.createElement('div');

  switch (type) {
    case 'searchHistoryTag':
      $newContainer.innerHTML = `<a class="searchbox-autocomplete-history-item gif-content-details-btn">${object}</a>`;
      return $newContainer.firstChild;

    case 'suggestions':
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
    case 'suggestions-lazy':
      $newContainer.innerHTML = `<div class="gif-container">
        <div class="gif-header-container">
          <h2 class="gif-title">Loading...</h2>
          <button class="gif-times-btn"></button>
        </div>
        <div class="gif-content-wrapper">
          <img
            src="#"
            alt="Loading..."
            class="gif-content-img loading-animation"
          />
          <a target=_blank href="#" class="gif-content-details-btn">Ver más...</a>
        </div>
      </div>`;
      return $newContainer.firstChild;

    case 'trending-small':
      $newContainer.innerHTML = `<div class="gif-container gif-and-tagline-wrapper">
      <img
        src="${object.images.original.url}"
        alt="${object.title}"
        class="gif-content-img loading-animation"
      />
      <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
    </div>`;
      return $newContainer.firstChild;

    case 'trending-large':
      $newContainer.innerHTML = `<div class="gif-container gif-large gif-and-tagline-wrapper">
      <img
        src="${object.images.original.url}"
        alt="${object.title}"
        class="gif-content-img loading-animation"
      />
      <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
    </div>`;
      return $newContainer.firstChild;
    case 'trending-lazy':
      $newContainer.innerHTML = `<div class="gif-container gif-large gif-and-tagline-wrapper">
          <img
            src="#"
            alt="${null}"
            class="gif-content-img loading-animation"
          />
          <h2 class="gif-title-tagline">loading</h2>
        </div>`;
      return $newContainer.firstChild;
    case 'result-small':
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

    case 'result-large':
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

    case 'result-lazy':
      $newContainer.innerHTML = `<div class="gif-container gif-and-tagline-wrapper">
          <a target="_blank" href="#" class="gif-result-link">
          <img
            src="#"
            alt="Loading"
            class="gif-content-img loading-animation"
          />
          <h2 class="gif-title-tagline">Loading</h2>
          </a>
        </div>`;
      return $newContainer.firstChild;

    case 'myGif-large':
      $newContainer.innerHTML = `<div class="gif-container gif-large gif-and-tagline-wrapper">
        <a target="_blank" href="${object.bitly_url}" class="gif-result-link">
        <img
          src="${object.images.original.url}"
          alt="${object.title}"
          class="gif-content-img loading-animation"
        />
        </a>
      </div>`;
      return $newContainer.firstChild;
    case 'myGif-small':
      $newContainer.innerHTML = `<div class="gif-container gif-and-tagline-wrapper">
        <a target="_blank" href="${object.bitly_url}" class="gif-result-link">
        <img
          src="${object.images.original.url}"
          alt="${object.title}"
          class="gif-content-img loading-animation"
        />
        </a>
      </div>`;
      return $newContainer.firstChild;
  }
}

function replaceLazy(parent, object, type, i) {
  const childNodeArray = parent.childNodes;
  let child = childNodeArray[i];
  switch (type) {
    case 'trending-small':
      child.outerHTML = `<div class="gif-container gif-and-tagline-wrapper">
    <img
      src="${object.images.original.url}"
      alt="${object.title}"
      class="gif-content-img loading-animation"
    />
    <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
  </div>`;
      break;
    case 'trending-large':
      child.outerHTML = `<div class="gif-container gif-large gif-and-tagline-wrapper">
    <img
      src="${object.images.original.url}"
      alt="${object.title}"
      class="gif-content-img loading-animation"
    />
    <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
  </div>`;
      break;
    case 'suggestions':
      child.outerHTML = `<div class="gif-container">
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
      break;
    case 'result-small':
      child.outerHTML = `<div class="gif-container gif-and-tagline-wrapper">
          <a target="_blank" href="${object.bitly_url}" class="gif-result-link">
          <img
            src="${object.images.original.url}"
            alt="${object.title}"
            class="gif-content-img loading-animation"
          />
          <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
          </a>
        </div>`;
      break;

    case 'result-large':
      child.outerHTML = `<div class="gif-container gif-large gif-and-tagline-wrapper">
          <a target="_blank" href="${object.bitly_url}" class="gif-result-link">
          <img
            src="${object.images.original.url}"
            alt="${object.title}"
            class="gif-content-img loading-animation"
          />
          <h2 class="gif-title-tagline">${addHashtagToWords(object.title)}</h2>
          </a>
        </div>`;
      break;
  }
}

function appendToContainer(element, parent) {
  parent.appendChild(element);
}

function hideElements(...elements) {
  elements.forEach((element) => {
    element.classList.add('hidden');
  });
}
function showElements(...elements) {
  elements.forEach((element) => {
    element.classList.remove('hidden');
  });
}
function addFlex(...elements) {
  elements.forEach((element) => {
    element.classList.add('flex');
  });
}
function removeFlex(...elements) {
  elements.forEach((element) => {
    element.classList.remove('flex');
  });
}
