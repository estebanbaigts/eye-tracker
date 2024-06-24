var recording = false;
var saving = false;

// Position of the calibration points depending of the calibration (9 or 17 points), in percentage of the browser's page. Origin top left
// Need to be modified when the calibration points are moved in calibration.js:4/5
const calibPos3 = {
    pt1: {
        x: 0.02,
        y: 0.02,
    },
    pt2: {
        x: 0.97,
        y: 0.02,
    },
    pt3: {
        x: 0.02,
        y: 0.96,
    },
    pt4: {
        x: 0.97,
        y: 0.96,
    },
    pt5: {
        x: 0.50,
        y: 0.50,
    },
    pt6: {
        x: 0.50,
        y: 0.0, // 70px
    },
    pt7: {
        x: 0.97,
        y: 0.50,
    },
    pt8: {
        x: 0.50,
        y: 0.96,
    },
    pt9: {
        x: 0.02,
        y: 0.50,
    }
};
const calibPos4 = {
    pt1: {
        x: 0.02,
        y: 0.02,
    },
    pt2: {
        x:0.97,
        y:0.02,
    },
    pt3: {
        x:0.02,
        y:0.96,
    },
    pt4: {
        x: 0.97,
        y: 0.96,
    },
    pt5: {
        x: 0.50,
        y: 0.50,
    },
    pt6: {
        x: 0.33,
        y: 0.33,
    },
    pt7: {
        x: 0.66,
        y: 0.33,
    },
    pt8: {
        x: 0.33,
        y: 0.66,
    },
    pt9: {
        x: 0.66,
        y: 0.66,
    },
    pt10: {
        x: 0.33,
        y: 0.0, // 70px
    },
    pt11: {
        x: 0.66,
        y: 0.0, // 70px
    },
    pt12: {
        x: 0.97,
        y: 0.33,
    },
    pt13: {
        x: 0.97,
        y: 0.66,
    },
    pt14: {
        x: 0.33,
        y: 0.96,
    },
    pt15: {
        x: 0.66,
        y: 0.96,
    },
    pt16: {
        x: 0.02,
        y: 0.33,
    },
    pt17: {
        x: 0.02,
        y: 0.66,
    }
};

/**
 * get the browser name and version
 */
function getBrowserSpecs() {
    const browser = bowser.getParser(window.navigator.userAgent);
    const browserObject = browser.getBrowser();

    return [browserObject.name, browserObject.version]
}

/**
 * Rescale data and download it onto the user's machine in a json file
 */
function download_file(dataArray, luminanceArray, size, fileNamePtr) {
    var fileName = fileNamePtr;

    // Get browser's windows canvas size
    var windowWidth = document.getElementById("plotting_canvas").width;
    var windowHeight = document.getElementById("plotting_canvas").height;

    
    // Get game canvas
    var jeu = document.getElementById("jeu");
    var canvasJeu = null;
    for (var i = 0; i< jeu.childNodes.length; i++) {
        if (jeu.childNodes[i].className == "awtGameCanvas"){
            canvasJeu = jeu.childNodes[i];
            break;
        }
    }
    // Get game canvas size
    if (canvasJeu) {
        var canvasWidth = parseInt(canvasJeu.style.width.slice(0,-2));
        var canvasHeight = parseInt(canvasJeu.style.height.slice(0, -2));
    } else {
        var canvasWidth = null;
        var canvasHeight = null;
    }
    // Calculate margins around game canvas
    var margeHoriz = Math.round((windowWidth - canvasWidth)/2);
    var margeVert = Math.round((windowHeight - canvasHeight)/2);
    
    // Get calibration points positions in pixels (convert from percentages to pixels with windows sizes)
    var calibPointsPx = {};
    var i = 1;
    for (const [key, value] of Object.entries(calibPos3)) {
        const val = { // Same way to rescale coordinates than for predicted coordinates, except we don't cut it to 0 or maxSize when it's out of the game canvas
            x: (value.x * windowWidth) - margeHoriz +5, // +5 because the dot is 10px large and its position is defined on the top left corner
            y: windowHeight - (value.y * windowHeight) - margeVert +5,
        }
        if (value.y == 0) {
            val.y = windowHeight - 70 - margeVert +5;
        }
        calibPointsPx[key] = val;
        i++;
    };

    // Rescaling of the predicted gaze coordinates
    const coordArray = [];
    for (let i = 0; i < size; i++) {
        // 1st Step : horizontal flip to put the origin at the bottom of the window (to go along the unity coordinates system that starts a the bottom left of the canvas)
        var coordY = windowHeight - dataArray[i][1];
        
        // 2nd Step : Lower the coordinates to superpose them to the game canvas frame. Shift from the value of the margin computed before
        // output (e.g. given for the ordinates) : predicted coordinates on the game canvas have a value within the game canvas limits, those predicted too high have a negative value, those predicted too low have a value greater than the game canvas height
        coordY -= margeVert;
        var coordX = dataArray[i][0] - margeHoriz;

/*         // Cutting of the predicted value inside the game canvas (if predicted outside, fixed at the border to +- 1, to distinguish with points perfectly predicted at the borders)
        // Abscissa
        if (coordX < 0) {
            coordX = -1;
        } else if (coordX > canvasWidth) {
            coordX = canvasWidth + 1;
        }
        // Ordinates
        if (coordY < 0) {
            coordY = -1;
        } else if (coordY > canvasHeight) {
            coordY = canvasHeight + 1;
        } */
        coordArray.push({ x: coordX, y: coordY, timestamp: dataArray[i][2] });
    }

    // Analysis data that can be suppressed in production
    const camWidth = document.getElementById('camWidth').textContent;
    const camHeight = document.getElementById('camHeight').textContent;
    const browserSpecs = getBrowserSpecs();

    const jsonData = JSON.stringify({
      trackerWindowSize: {
        width: windowWidth,
        height: windowHeight
      },
      gameCanvasSize: {
        width: canvasWidth,
        height: canvasHeight
      },
      dataLen: size,
      camSpec: {
        width: camWidth,
        height: camHeight
      },
      browserSpec: {
          name: browserSpecs[0],
          version: browserSpecs[1]
      },
      data: coordArray,
      avgLuminance: luminanceArray,
      calibPoints: calibPointsPx
    });

    var blob = new Blob([jsonData], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName + '.json';
     
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent("click");
    link.dispatchEvent(e);
    window.URL.revokeObjectURL(link.href);
}

/**
 * Provokes the saving of the predictions (and their metadata) in a .json file
 */
function saveGazeRecording(data, luminance, size) {
    const file_name = 'gaze-data-recording-' + Date.now();
    download_file(data, luminance, size, file_name);
    recording = false;
}
  
/**
 * Set recording to false (don't put gaze data in an array)
 */
function stopRecording() {
  recording = false;
}
  
/**
 * Set recording to true (put gaze data in an array)
 */
function startRecording() {
  recording = true;
}
  
/**
 * NOT USED ATM
 * Set saving to true (allow to save recorded data in a file)
 */
function stopSaving() {
  saving = false;
}
  
/**
 * NOT USED ATM
 * Set saving to false (don't want to save recorded data yet)
 */
function startSaving() {
  saving = true;
}

/**
 * Manage the changes when clicking on the record button in the html page
 */
function recordingManagement() {
    // behaviour depends entirely on the value of `recording`, if we stop the recording we save automatically
    const btnDiv = document.getElementById('Rec');
    if (!recording) {
        // Start saving the data in an array
        startRecording();
        btnDiv.textContent = 'Stop recording';
    } else {
        // Stop the saving of the predictions and save (then empty) the variables used in a file we finally download
        btnDiv.textContent = "Record";
        startSaving();
        stopRecording();
    }
}