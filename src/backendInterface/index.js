
//TODO Change for server
// const HOST = "http://localhost:10090/"
const HOST = "http://agar.ludecat.io:10090/"
let uuid = localStorage.getItem("uuid") || ""
const controlsSection = document.querySelector('.js-controls-section');
const uuidForm = document.querySelector('.js-uuid-form');
const uuidInput = document.querySelector('.js-uuid-form-input')
const uuidParagraph = document.querySelector(".js-current-uuid")
const roundDurationForm = document.querySelector('.js-round-duration-form');
const roundDurationInput = document.querySelector('.js-round-duration-form-input')
const currentRoundDurationParagraph = document.querySelector(".js-current-round-duration")
const roundCountDownParagraph = document.querySelector(".js-round-countdown")
let paused = false
let roundStarted = false
let pauseStartTime = 0
let accumulatedPauseTime = 0

// --- UUID ---
if (uuid) {
  uuidParagraph.textContent = "Current uuid: " + uuid
  controlsSection.classList.remove("hidden")
}

if (uuidForm.attachEvent) {
  uuidForm.attachEvent("submit", processUuidForm);
} else {
  uuidForm.addEventListener("submit", processUuidForm);
}

function processUuidForm(e) {
  if (e.preventDefault) e.preventDefault();
  uuid = uuidInput.value;
  uuidParagraph.textContent = "Current uuid: " + uuid
  localStorage.setItem('uuid', uuid);
  controlsSection.classList.remove("hidden")
}


// --- Round Duration ---
if (roundDurationForm.attachEvent) {
  roundDurationForm.attachEvent("submit", processRoundDurationForm);
} else {
  roundDurationForm.addEventListener("submit", processRoundDurationForm);
}
async function processRoundDurationForm(e) {
  if (e.preventDefault) e.preventDefault();
  let currentDuration = roundDurationInput.value;
  currentDuration = currentDuration * 1000 //in ms
  try {
    const resp = await executeCommandWithResp("updateroundduration " + currentDuration)
    if(resp)
    currentRoundDurationParagraph.textContent = "Current round duration: " + (resp.duration / 1000) + " sec"

  }
  catch (e) {
    alert(e.message)
  }
  roundDurationInput.value = ""
}
getCurrentRoundDuration(currentRoundDurationParagraph)


// ------- COMMANDS -------
// --- Round Start ---
const roundStartBtn = document.querySelector(".js-roundstart-btn")
let countdownInterval = null
let updateInterval = null

roundStartBtn.addEventListener("click", async () => {
  try {
    const resp = await executeCommandWithResp("roundstart")
    if(resp)
    {
      initiateCountdown(resp.duration, resp.timeElapsed)
      roundStartBtn.disabled = true
      roundStartBtn.classList.add("disabled")
    }
  }
  catch (err) {
    alert("Cannot start round. " + err.message)
  }
})

// --- Countdown ---

let globalTimeElapsed = 0

function initiateCountdown(duration, timeElapsed) {
  globalTimeElapsed = timeElapsed
  let startTime = Date.now() + 998
  clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    if(!paused){
      const newDuration = duration - globalTimeElapsed
      let currentTotalSecondsLeft = Math.floor((startTime + newDuration + accumulatedPauseTime - Date.now()) / 1000)
      if (currentTotalSecondsLeft <= 0) {
        roundCountDownParagraph.textContent = "Round countdown: 00:00"
        accumulatedPauseTime = 0
        globalTimeElapsed = 0
        roundStartBtn.disabled = false
        roundStartBtn.classList.remove("disabled")
        clearInterval(updateInterval)
        clearInterval(countdownInterval)
        return
      }
      roundCountDownParagraph.textContent = createCountdownString(currentTotalSecondsLeft)
      globalTimeElapsed++
    }

  }, 1000)

  updateInterval = setInterval(() => {
    if(!paused)
    updateRoundCountDown()
  }, 5000)
}

function createCountdownString(currentTotalSecondsLeft) {
  let minutes = Math.floor(currentTotalSecondsLeft / 60)
  let seconds = currentTotalSecondsLeft - minutes * 60

  let minutesStr = minutes.toString()
  while (minutesStr.length < 2) minutesStr = "0" + minutesStr
  let secondsStr = seconds.toString()
  while (secondsStr.length < 2) secondsStr = "0" + secondsStr
  return "Round countdown: " + minutesStr + ":" + secondsStr
}


async function updateRoundCountDown() {
  let resp = await executeRequest("countdowntime")
  globalTimeElapsed = Math.floor(resp.timeElapsed / 1000)
}

async function getCurrentRoundDuration(currentRoundDurationParagraph) {
  let currentDuration = await executeRequest("roundduration")
  if(currentDuration)
  {
    currentDuration = (currentDuration.duration / 1000)
  currentRoundDurationParagraph.textContent = "Current round duration: " + currentDuration + " sec"
}
}


// --- Pause ---
const pauseBtn = document.querySelector(".js-pause-btn")
pauseBtn.addEventListener("click", () => {
  paused = true
  pauseStartTime = Date.now()
  pauseBtn.disabled = true
  pauseBtn.classList.add("disabled")
  executeCommand("pause").catch(err => console.error("Can't fetch pause command"))
})

// --- Resume ---
const resumeBtn = document.querySelector(".js-resume-btn")
resumeBtn.addEventListener("click", () => {
  if(paused)
  accumulatedPauseTime += Date.now() - pauseStartTime
  paused = false
  pauseBtn.disabled = false
  pauseBtn.classList.remove("disabled")
  executeCommand("resume").catch(err => console.error("Can't fetch resume command"))
})

// --- Restart ---
const restartBtn = document.querySelector(".js-restart-btn")
restartBtn.addEventListener("click", () => {
  executeCommand("restart").catch(err => console.error("Can't fetch restart command"))
})

// --- Update round duration ---
const updateRoundDuration = document.querySelector(".js-round-duration-btn")

// --- Exit ---
const exitBtn = document.querySelector(".js-exit-btn")
exitBtn.addEventListener("click", () => {
  executeCommand("exit")
})




// --- Fetch functions ---

function executeCommand(command) {
  return fetch(HOST + "commands?command=" + command, {
    method: 'POST',
    headers: {
      'authorization': uuid,
    }
  }) 
    .then(res => {
      if(res){
        if (res.status === 403) {
          alert("Need correct UUID to execute commands")
        }
        else {
          return res
        }

      }

    })
}

function executeCommandWithResp(command) {
  return executeCommand(command)
    .then(res => {
      if(res){
        if (res.status === 403) {
          alert("Need correct UUID to execute commands")
        }
        else {
          return res.json()
        }

      }
    })
    .then(json => {
      if(json){
        if (json.hasOwnProperty("error")) {
          throw new Error(json.error)
        }
        else  return json

      }
    })
  // .catch(err => {
  //   console.error(err)
  // })
}




function executeRequest(request) {
  return fetch(HOST + "requests?request=" + request, {
    method: 'GET',
    headers: {
      //'authorization': uuid,
    }
  })
    .then(res => {
      return res.json()
    })
    .then(json => {
      return json
    })
    .catch(err => console.error(request + " failed"))
}