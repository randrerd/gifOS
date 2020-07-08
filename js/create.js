"use strict";
const $APIKey = "AtDXUGwf0oBU7IXtdm8Ztz3zUP1ct6nO";
const uploadCounter = 0;

const navbarSection = (() => {
  /*DOM Cache*/

  const $returnBtn = document.querySelector(".navbar-logo-container");
  const $returnArrowBtn = document.querySelector(".navbar-return-arrow");
  const $themeStylesheetLink = document.querySelector(".link-theme");

  /*Local Variables*/
  const themeOptions = ["sailor_day", "sailor_night"];

  /*Event Listeners*/
  document.addEventListener("DOMContentLoaded", (event) => {
    showElements(0, $returnArrowBtn);
  });

  $returnBtn.onclick = function () {
    window.location = "index.html";
  };

})();

const creatingPhase1 = (() => {
  /*DOM Cache */
  const $creatingPhase1Container = document.querySelector(
    ".creating-phase-step1"
  );
  const $creatingPhase2Container = document.querySelector(
    ".creating-phase-step2"
  );
  const $cancelBtn = document.querySelector(".create-gif-cancel-btn");
  const $startBtn = document.querySelector(".create-gif-start-btn");

  /*Event Listeners */
  document.addEventListener("DOMContentLoaded", (event) => {
    showElements(0, $creatingPhase1Container);
  });
  $cancelBtn.onclick = function () {
    window.location = "index.html";
  };
  $startBtn.onclick = function () {
    creatingPhase2();
    showElements(1, $creatingPhase2Container);
    hideElements(0, $creatingPhase1Container);
  };
})();

const creatingPhase2 = () => {
  //DOM Cache
  const $timesBtn = document.querySelector('.gif-times-btn');
  const $captureBtn = document.querySelector(".btn-capture");
  const $doneBtn = document.querySelector(".btn-done");
  const $videoContainer = document.querySelector(".video-content");
  const $videoTimerContainer = document.querySelector(".videodetails-timer");
  const $windowContainer = document.querySelector(
    ".capture-video-container-header-wrapper"
  );
  const $windowHeader = $windowContainer.childNodes[1];
  const $playbar = document.querySelector(".preview-video-playbar-wrapper");
  const $repeatCaptureBtn = document.querySelector(".repeat-capture-btn");
  const $uploadBtn = document.querySelector(".upload-btn");
  const $uploadingPhaseContainer = document.querySelector(
    ".uploading-video-content-wrapper"
  );
  const $timerDisplay = document.querySelector(".videodetails-timer");
  const $playBtn = document.querySelector(".play-btn");
  const $succesUploadPhaseContainer = document.querySelector(
    ".success-upload-content-wrapper"
  );
  const $uploadedGifContainer = document.querySelector(".uploadedGif");
  const $downloadGifBtn = document.querySelector(".download-gif-btn");
  const $copyToClipboardBtn = document.querySelector(".copy-gif-btn");
  const $inputURL = document.createElement("input");
  const $cancelBtn = document.querySelector(".uploading-gif-cancel-btn");
  const $myGifsContainer = document.querySelector(".myGifs-container");
  const $finishBtn = document.querySelector('.btn-finish');

  //Variables for future use by camera recorder
  let blob;
  let recorder;
  let gifRecorder;
  let url;
  let tracks;
  let uploadCounter = 0;
  let lastURLUploaded;

  //Variables for future use by the timer
  let startTime;
  let updatedTime;
  let difference;
  let tInterval;
  let timerContent;
  let savedTime;
  let paused = 0;
  let running = 0;

  //Event listeners
  $timesBtn.onclick = function () {
    window.location = 'index.html';
  }
  $captureBtn.onclick = function () {
    showElements(1, $videoTimerContainer, $doneBtn);
    hideElements(1, $captureBtn);
    $windowHeader.textContent = "Capturando tu Guifo";
    startRecording();
    startTimer();
  };
  $doneBtn.onclick = function () {
    stopRecording();
    hideElements(1, $doneBtn);
    showElements(1, $uploadBtn, $playbar, $repeatCaptureBtn);
    $windowHeader.textContent = "Vista Previa";
    pauseTimer();
  };

  $videoContainer.onclick = function () {
    resetTimer();
    $videoContainer.play();
  };

  $uploadBtn.onclick = function () {
    $windowHeader.textContent = "Subiendo Guifo";
    hideElements(1, $videoContainer, $uploadBtn, $playbar, $timerDisplay, $repeatCaptureBtn);
    showElements(1, $uploadingPhaseContainer, $cancelBtn);

    
    uploadGif(blob, uploadCounter).then((id) => {
      uploadCounter++;
      storeGifID(id);
      hideElements(
        1,
        $uploadingPhaseContainer,
        document.querySelector(".creating-phase-videodetails-wrapper"),
        $cancelBtn
      );
      showElements(1, $succesUploadPhaseContainer);
      getUploadedGif(id).then((url) => {
        $uploadedGifContainer.src = url;
        lastURLUploaded = url;
      });
      myGifsSection().then(() => {
        showElements(0, $myGifsContainer);
      });
    });
  };
  $playBtn.onclick = function () {
    resetTimer();
    $videoContainer.play();
    // renderPlaybarProgress();
    // console.log($videoContainer)
  };
  $repeatCaptureBtn.onclick = function () {
    $videoContainer.src = null;
    recorder.reset();
    gifRecorder.reset();
    recorder.destroy();
    gifRecorder.destroy();
    getCameraData();
    timerContent = null;
    startTime = null;
    savedTime = null;
    hideElements(1, $uploadBtn, $playbar, $repeatCaptureBtn,$timerDisplay);
    showElements(1, $captureBtn);
    

  }
  $downloadGifBtn.onclick = function () {
    invokeSaveAsDialog(blob);
  };
  $copyToClipboardBtn.onclick = function () {
    document.body.appendChild($inputURL);
    $inputURL.value = lastURLUploaded;
    $inputURL.select();
    document.execCommand("copy");
    document.body.removeChild($inputURL);
  };
  $cancelBtn.onclick = function () {
    window.location = 'index.html'
  }
  $finishBtn.onclick = function () {
    window.location = 'index.html'
  }

  getCameraData();
  async function getUploadedGif(id) {
    let response = await fetch(
      `https://api.giphy.com/v1/gifs/${id}?api_key=${$APIKey}`
    );
    let data = await response.json();

    return data.data.images.original.url;
  }

  async function getCameraData() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    $videoContainer.srcObject = stream;
    $videoContainer.play();
    tracks = stream.getTracks();
  }

  async function startRecording() {
    const stream = $videoContainer.srcObject;
    recorder = new RecordRTCPromisesHandler(stream, {
      type: "video",
      mimeType: "video/webm; codecs=vp8",
      videoBitsPerSecond: 128000,
    });

    gifRecorder = new RecordRTCPromisesHandler(stream, {
      type: "gif",
    });

    await recorder.startRecording();
    await gifRecorder.startRecording();
    recorder.stream = stream;
  }

  async function stopRecording() {
    await recorder.stopRecording();
    await gifRecorder.stopRecording();
    url = await recorder.getDataURL();
    $videoContainer.srcObject = null;
    $videoContainer.src = url;
    tracks[0].stop();
    blob = await gifRecorder.getBlob();
  }

  async function uploadGif(blob, id) {
    try {
      let form = new FormData();

      form.append("file", blob, `file${id}.gif`);

      let response = await fetch(
        `https://upload.giphy.com/v1/gifs?api_key=${$APIKey}`,
        {
          method: "POST",
          body: form,
        }
      );
      let data = await response.json();

      return data.data.id;
    } catch (error) {
      console.log(error);
    }
  }

  function storeGifID(id) {
    if (!localStorage.getItem("uploadedGifs")) {
      localStorage.setItem("uploadedGifs", id);
    } else {
      let oldKeyValue = localStorage.getItem("uploadedGifs");
      let newKeyValue = `${oldKeyValue}, ${id}`;
      localStorage.setItem("uploadedGifs", newKeyValue);
    }
  }

  function startTimer() {
    if (!running) {
      startTime = new Date().getTime();
      tInterval = setInterval(getShowTime, 1);

      paused = 0;
      running = 1;
    }
  }
  function pauseTimer() {
    if (!difference) {
      // if timer never started, don't allow pause button to do anything
    } else if (!paused) {
      clearInterval(tInterval);
      savedTime = difference;
      paused = 1;
      running = 0;
    } else {
      // if the timer was already paused, when they click pause again, start the timer againstartTimer();
    }
  }
  function resetTimer() {
    if (running) {
      null;
    } else {
      savedTime = 0;
      difference = 0;
      paused = 0;
      running = 0;
      $timerDisplay.innerHTML = "00:00:000";
      startTime = new Date().getTime();
      //Starts running the timer until it reaches the previous time recorded
      tInterval = setInterval(playRecordedTimer, 1);
    }
  }

  function getShowTime() {
    updatedTime = new Date().getTime();
    if (savedTime) {
      difference = updatedTime - startTime + savedTime;
    } else {
      difference = updatedTime - startTime;
    }

    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);
    let milliseconds = Math.floor((difference % (1000 * 60)) / 100);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    milliseconds =
      milliseconds < 100
        ? milliseconds < 10
          ? "00" + milliseconds
          : "0" + milliseconds
        : milliseconds;

    timerContent = minutes + ":" + seconds + ":" + milliseconds;
    $timerDisplay.innerHTML = timerContent;
  }

  function playRecordedTimer() {
    running = 1;
    updatedTime = new Date().getTime();
    if (savedTime) {
      difference = updatedTime - startTime + savedTime;
    } else {
      difference = updatedTime - startTime;
    }

    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);
    let milliseconds = Math.floor((difference % (1000 * 60)) / 100);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    milliseconds =
      milliseconds < 100
        ? milliseconds < 10
          ? "00" + milliseconds
          : "0" + milliseconds
        : milliseconds;

    $timerDisplay.innerHTML = minutes + ":" + seconds + ":" + milliseconds;

    if ($timerDisplay.innerHTML === timerContent) {
      //When the timer reaches the recorded time, it stops
      running = 0;
      clearInterval(tInterval);
    }
    //If user changes tabs or minimizes window, pauses timer and video
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        running = 0;
        clearInterval(tInterval);
        $videoContainer.pause();
      }
    });
  }

  //TO-DO: Progress bar for video

  // let progressBlocks = document.querySelectorAll('.playback-bar');
  // console.log(progressBlocks);

  // function paintProgressBlock(i){
  //   let videoTotalDuration = $videoContainer.duration;
  //   let currentTime = 0;
  //   let barBlocksLength = progressBlocks.length;

  //   for (let i = 0; i < progressBlockss.length; i++) {
  //     const element = progressBlockss[i];
  //     currentTime = $videoContainer.currentTime;
  //     let barProgress = parseInt(currentTime/videoTotalDuration);
  //   }

  //   progressBlocks[i].classList.remove('empty-block')
  //   progressBlocks[i].classList.add('filled-block')

  // }
};
const myGifsSection = async () => {
  const $myGifsContainer = document.querySelector(".myGifs-content-wrapper");

  if (!localStorage.getItem("uploadedGifs")) {
    null;
  } else {
    let uploadHistoryValue = localStorage.getItem("uploadedGifs");
    let uploadHistoryIDs = uploadHistoryValue.split(", ");
    uploadHistoryIDs.forEach((element) => {
      // appendToContainer(createGifElement(getUploadedGif(element), 'myGif'),$myGifsContainer);
      getUploadedGif(element).then((data) => {
        try {
          checkGifRatio(data)
            ? appendToContainer(
                createGifElement(data, "myGif-large"),
                $myGifsContainer
              )
            : appendToContainer(
                createGifElement(data, "myGif-small"),
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
};

function checkGifRatio(object) {
  //Checks if the element's ratio is greater than itself and a half, if so, it
  //returns true
  let isLarge = false;
  object.images.original.width / object.images.original.height >= 1.5
    ? (isLarge = true)
    : (isLarge = false);
  return isLarge;
}

function createGifElement(object, type) {
  const $newContainer = document.createElement("div");

  switch (type) {
    case "myGif-large":
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
    case "myGif-small":
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

function appendToContainer(element, parent) {
  parent.appendChild(element);
}
function hideElements(flex = 0, ...elements) {
  !flex
    ? elements.forEach((element) => {
        element.classList.add("hidden");
      })
    : elements.forEach((element) => {
        element.style.display = "none";
      });
}
function showElements(flex = 0, ...elements) {
  !flex
    ? elements.forEach((element) => {
        element.classList.remove("hidden");
      })
    : elements.forEach((element) => {
        element.style.display = "flex";
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
