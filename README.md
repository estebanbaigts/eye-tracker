# Web Eye-tracker (Usage)

This proof of concept is an eye-tracker for web pages, using a webcam and a calibration.
This POC also include a test game, launching after the calibration ended as well as a recording of the prediction in a .json file.

## Features

- Calibration (9 or 17 points)
- No special hardware: only the webcam
- Swappable components for eye detection
- Several gaze prediction models
- Recording of gaze estimation data into a json file

## Build the repository

To use the project, follow these instructions:

On Mac/Linux:

- Open a terminal to do the following

On Windows:

- Open a powershell as administrator

  ### To build the repository

- Ensure Node is downloaded: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm (tested on v16 and v18)

- having the folder eye_tracking on your computer

```
  # place yourself in the eye_tracking repository
  cd eye_tracking

  # if the node_modules folder and the package-lock.json are still in the project (not in a .gitignore yet)
  rm -rf node_modules
  rm -f package-lock.json
  npm cache clean --force

  # install the dependencies
  npm install

  # build the project
  npm run build

  # install serve for serving local files
  npm install --global serve

  # launch a local serve with node
  serve www

  # packing the sources when modifying them according with webpack.config.js
  npx webpack
```

If `serve` is not recognized as an npm command, try to run
`npm install -g http-server`
in the terminal or powershell and add the following line in the <b>package.json</b> file in the "scripts" section:
`"start": "http-server"`
Then run a local server with the command
`npm start`

### Add a game after the calibration

The folder <b>Game/</b> is made to contain the whole build of a webGL Unity game. I advise to paste the whole folder of a game (DO NOT COMMIT AND PUSH THIS FOLDER) in the root of the project <b>eye_tracking/</b>, and copy paste its content into the empty <b>Game/</b> folder. As the <i>.gitignore</i> of Backpack doesn't allow <b>Build/</b> folders to be pushed, the build of a game should be copy pasted from your machine to this folder.
<br>
After pasting it into Game/ delete the folder of the build you imported from your machine (not the Game/ folder, the one with the name of your game). Then go to the section 31 of the variable <i>code</i> in <b>game.js</b> (marked //s31//) and change the variable <i>name</i> with the name of the build of your game. E.g. : 'WebCamEyeTrackerTestScene-v0.3' for the test game.

## Browser Support

The following browsers (and derivatives) support the project:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Opera
- Safari

# Web Eye-tracker (Functioning)

This is a node app, organized by webpack.

The project is separated into several parts:

- The www/ files : html files, css files, fonts, .json files, everything that makes the display in the browser and javascript files (in www/js/ folder) that interact with the user in the page
  - these files are loaded in the html pages and do things like manage the calibration process (calibration.js), manage the prediction recording system (gaze_recording.js), display the Unity game at the end of the calibration (game.js)
  - they are full files and are imported directly in the pages
- The src/ files : source files in javascript, these files are minified in a single <i>webgazer.js</i> file in the <b>www/</b> folder which is only once imported into the html script
- The Game/ files : files relatives to the unity game. When changing the game, just need to change all the files of the webGL build of the new game, and change the paths, see www/js/game.js:26 .

The functioning of classes and functions is explained as comments in the files.

## Small things to know about the project

- The size of the browser's window MUST NOT be changed during and after the calibration process, this would make any prediction completely useless.
- The origin of the coordinates system of the saved data is in the BOTTOM LEFT (like a mathematical frame of reference in (R+, R+)). The tracker initially has an origin in the top left, but is changed in the function `download_file` of <i>www/js/gaze_recording.js</i>.
- After extracting the eye patches for one frame, they are downsampled into a 10 by 6 image (length by height) which is then converted in a sort of histogram (did not have the time to dig into this so this may be incorrect) of the same size, finally given as input to the regression (one coefficient for each point of the histogram). Already tried to increase the size of this for a 20 by 12, this logically makes explode the computation time and decrease the FPS to 3 to 5.
- A user must launch the recording of the predictions before launching the game, in order to have predictions for the whole duration of the game. No real matter if the gaze recording is started before of after the calibration process. This must also be stopped after the end of the game (when the unity .json file is downloaded). You only need to click on the button "record" or "stop recording" one time. After that the button may disparrear (due to bootstrap rule I couldn't figure out). To make it appear again, click anywhere in the window.
- If you change the positions of the calibration points (to make it fit to the size of the game for instance), you must also change the percentages in the javascript objects at the beginning of <i>gaze_recording.js</i>. If not we won't calculate correctly their positions in pixels and the analysis will be false.
- Personal Impression : The tracker looks to derive automatically to the right, even during fixation points. Hypothesis : I did too many time this process and inconsciently do the calibration incorrectly.
- Before any new group of analysis, gather new sessions with the actual state of the tracker, data and analysis code have been completed with new caracteristics that are absent of former sessions registered.
- When calibrating, start clicking on the dots when the square in the top left corner of the window is displayed in green. This is what is left of the video preview of WebGazer.js . Taking it off allowed to put the calibration point in the corner and make a symmetrical calibration map, but I left the face position square in order to have the information when the model is loaded (square in black), when the face is in the right spot (square in green) or when the face goes out of it (square in red).

# Improvement process (what have been attempted, what haven't, what should)

A lot of changes have been made before the merge of the project into backpack, but a quick `git log --oneline` easily reports the development process aside from the precision improvements (unity game management, recording of prediction, …)

### Tested

- Modify size of eye patch given to the regression.
  - Dramatically increases the computation time and decreases to FPS to less than 10.
- Prediction point of the size of the average prediction in the calibration.
  - Objective : check faster if the prediction in game is around the average.
  - Disturbs the player who inconsciently tends to watch this big point (even more if the RT prediction goes away due to bad overall precision).
- Change calibration from 9 to 17 points.
  - Can't say if better because at that time the tracker was too shaky, but probably reduces the wide prediction mistakes and enhances the global precision.
  - Probably too long to calibrate for most users (17 points to click 5 times each, with people's nowadays focus capabilities...).

### Scheduled to modify/test

- Take the timestamp of a frame closer to the real capture of the frame to avoid the latency due to calculation in the final result.
  - Objective : even if the project increases its latency due to long computation times, the timestamp of a frame is still quite close of the true timestamp and isn't spaced by computation, resulting in more precise prediction.
  - Requires improving the real position in the Unity test game to reduce latency from this side of the project.
- Change facemesh detection model.
  - Requires to change the global output of the new model to make it fit to the rest of the pipeline OR change the input of the rest of the pipeline to be able to make the treatment of the facemesh otherly detected. Besides, this mediapipe model by Google is probably of a quality we won't be able to match elsewhere, that's why I don't have so much hope for this.
- Replace calibration points perfectly in the canvas where the game will display to increase the calibration points density in the game zone.
  - Be aware that the edge effects of putting the calibration only on the game zone can result in bad predictions on the borders.
  - As a matter of facts, the size of the game should not change after the calibration, otherwise the precision will be completely incorrect, thus making impossible the fullscreen or this game imho.
- Smooth predictions on several points in order to reduce the frequency of prediction oscillations
- Explain oscillations on fixation points. Could give ideas on how to prevent it.
- Get rid of useless parts of the code (for production, as I guess development mode requires several techniques to progress).
- Don't save predictions made when the user is blinking, as it has been noticed that the prediction is then lacking precision
- Get into the commits history of WebGazer.js to see the process of development, their previous problems, solutions, ideas tested, aso…

### Ideas

- Dig into regression model to enhance or change it.
  - Time consuming.
- Better the javascript code to make it more efficient (can't do atm, not good enough at js).
  - async prog.
- Delete the parts of webgazer (the original eye-tracker) that are not useful for the project, to make it lighter to load and execute.
- Link unity game and tracker to make the game react to event of the tracker like:
  - Not sufficient luminosity so the game is paused and a popup asks to open some light and disappears when the luminosity is sufficient again.
  - Face lost (same process than the point before).
- Add face orientation as entry to the regression model (interesting : n°51 in the litterature review, see google drive).
- For the analysis sub-project : Find a way to recognize automatically the pairs of .json files (Unity test game file + gaze tracker file) in order not to have to explicitly write the pairs files names in a list of duets at the beginning of the loop.py file.
  - Find a way to retrace one particular session in case it has interesting caracteristics.
  - Calculate the difference of precision between static and dynamic points (need to find a way to separate moving and static parts in phase 3, the rest is already immediate (separate part 1 and 2)). A new column with a label "static" or "dynamic" can be a thing.
- Find why I wrote everything in english for this project but in french in the analysis project (still wondering…).
