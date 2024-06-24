var PointCalibrate = 0;
// Must change both at the same time when we want to switch calibration (values 3 and 9), also in gaze_recording.js:132 (around this location), change calibPos3 in calibPos4
var calib = 3; // grid fo the CALIBRAGE (4*4, 3*3,…)
var nbPoint = 9; // Total points in the CALIBRAGE
var CalibrationPoints={};
window.saveDataAcrossSessions = true;
console.log('saveDataAcrossSessions', window.saveDataAcrossSessions);
var helpModal;

var calibration_data = {
  'calibration_points': [],
  'precision_measurement': 0
};

/**
 * Clear the canvas and the CALIBRAGE button.
 */
function ClearCanvas(){
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('display', 'none');
  });
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Show the instruction of using CALIBRAGE at the start up screen.
 */
function PopUpInstruction(){
  ClearCanvas();
  swal({
    title:"CALIBRAGE",
    text: "Please click on each of the 9 points on the screen. You must click on each point 5 times till it goes yellow. This will calibrate your eye movements.",
    buttons:{
      cancel: false,
      confirm: true
    }
  }).then(isConfirm => {
    ShowCalibrationPoint();
  });

}
/**
  * Show the help instructions right at the start.
  */
function helpModalShow() {
    if(!helpModal) {
        helpModal = new bootstrap.Modal(document.getElementById('helpModal'))
    }
    helpModal.show();
}

function calcAccuracy() {
    precisionMethod = 'percents'; // 'pixels' or 'percents'
    // show modal
    // notification for the measurement process
    swal({
        title: "Calculating measurement",
        text: "Please don't move your mouse & stare at the middle dot for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
        closeOnEsc: false,
        allowOutsideClick: false,
        closeModal: true
    }).then( () => {
        // makes the variables true for 5 seconds & plots the points
    
        store_points_variable(); // start storing the prediction points
    
        sleep(5000).then(() => {
                stop_storing_points_variable(); // stop storing the prediction points
                var past50 = webgazer.getStoredPoints(); // retrieve the stored points
                var result = calculatePrecision(past50, precisionMethod);
                var precisionPc = result[0];
                var precisionPx = result[1];
                if (precisionMethod == 'percents'){
                	var value = precisionPc + '%';
                  precision_measurement = precisionPc;
                } else if (precisionMethod == 'pixels') {
                	var value = precisionPx + 'px';
                  precision_measurement = precisionPx;
                }
                var accuracyLabel = "<a>Accuracy | "+ value +"</a>";
                document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.

                swal({
                    title: "Your accuracy measure is " + value,
                    allowOutsideClick: false,
                    buttons: {
                        cancel: "Recalibrate",
                        confirm: true,
                    }
                }).then(isConfirm => {
                        if (isConfirm){
                            // calibration data storage
                            calibration_data['calibration_points'] = past50;
                            calibration_data['precision_measurement'] = precision_measurement;
                            localStorage.setItem('calibration_data', JSON.stringify(calibration_data));
                            //clear the CALIBRAGE & hide the last middle button
                            ClearCanvas();
                            // Launch the game
                            launch_game();
                        } else {
                            //use restart function to restart the CALIBRAGE
                            document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
                            webgazer.clearData();
                            ClearCalibration();
                            ClearCanvas();
                            ShowCalibrationPoint();
                        }
                });
        });
    });
}

function calPointClick(node) {
    const id = node.id;

    if (!CalibrationPoints[id]){ // initialises if not done
        CalibrationPoints[id]=0;
    }
    CalibrationPoints[id]++; // increments values

    if (CalibrationPoints[id]==5){ //only turn to yellow after 5 clicks
        node.style.setProperty('background-color', 'yellow');
        node.setAttribute('disabled', 'disabled');
        PointCalibrate++;
    } else if (CalibrationPoints[id]<5){
        //Gradually increase the opacity of CALIBRAGE points when click to give some indication to user.
        var opacity = 0.2*CalibrationPoints[id]+0.2;
        node.style.setProperty('opacity', opacity);
    }

    // Which points to display depending on the CALIBRAGE chosen
    if (calib == 4) {
      calib4(PointCalibrate);
    } else if (calib == 3) {
      calib3(PointCalibrate);
    }

    // Display central points when all the others are fully clicked
    if (PointCalibrate == nbPoint - 1){
        document.getElementById('Pt5').style.removeProperty('display');
    }

    if (PointCalibrate >= nbPoint){ // last point is calibrated
        // grab every element in CALIBRAGE class and hide them except the middle point.
        document.querySelectorAll('.Calibration').forEach((i) => {
            i.style.setProperty('display', 'none');
        });
        document.getElementById('Pt5').style.removeProperty('display');

        // clears the canvas
        var canvas = document.getElementById("plotting_canvas");
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // Calculate the accuracy
        calcAccuracy();
    }
}

/**
 * Load this function when the index page starts.
* This function listens for button clicks on the html page
* checks that all buttons have been clicked 5 times each, and then goes on to measuring the precision
*/
//$(document).ready(function(){
function docLoad() {
  ClearCanvas();
  helpModalShow();
    
    // click event on the CALIBRAGE buttons
    document.querySelectorAll('.Calibration').forEach((i) => {
        i.addEventListener('click', () => {
            calPointClick(i);

        });
        i.style.zIndex = 3;
    })
};
window.addEventListener('load', docLoad);

/**
 * Show the CALIBRAGE Points
 */
function ShowCalibrationPoint() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.removeProperty('display');
  });

  // Initially displays only the four corners points (whatever the type of CALIBRAGE chosen)
  const pt6 = document.getElementById('Pt6');
  pt6.style.setProperty('display', 'none');
  const pt7 = document.getElementById('Pt7');
  pt7.style.setProperty('display', 'none');
  const pt8 = document.getElementById('Pt8');
  pt8.style.setProperty('display', 'none');
  const pt9 = document.getElementById('Pt9');
  pt9.style.setProperty('display', 'none');

  // Point 5
  document.getElementById('Pt5').style.setProperty('display', 'none');

  // These points are always at the same place, BUT if the CALIBRAGE is in 9 points, there are never displayed
  const pt10 = document.getElementById('Pt10');
  pt10.style.setProperty('display', 'none');
  pt10.style.top = '70px';
  pt10.style.left = '33vw';
  const pt11 = document.getElementById('Pt11');
  pt11.style.setProperty('display', 'none');
  pt11.style.top = '70px';
  pt11.style.left = '66vw';
  const pt12 = document.getElementById('Pt12');
  pt12.style.setProperty('display', 'none');
  pt12.style.top = '33vh';
  pt12.style.left = '97vw';
  const pt13 = document.getElementById('Pt13');
  pt13.style.setProperty('display', 'none');
  pt13.style.top = '66vh';
  pt13.style.left = '97vw';
  const pt14 = document.getElementById('Pt14');
  pt14.style.setProperty('display', 'none');
  pt14.style.top = '96vh';
  pt14.style.left = '33vw';
  const pt15 = document.getElementById('Pt15');
  pt15.style.setProperty('display', 'none');
  pt15.style.top = '96vh';
  pt15.style.left = '66vw';
  const pt16 = document.getElementById('Pt16');
  pt16.style.setProperty('display', 'none');
  pt16.style.top = '33vh';
  pt16.style.left = '2vw';
  const pt17 = document.getElementById('Pt17');
  pt17.style.setProperty('display', 'none');
  pt17.style.top = '66vh';
  pt17.style.left = '2vw';

  if (calib == 3) {
    pt6.style.top = '70px';
    pt6.style.left = '50vw';

    pt7.style.top = '50vh';
    pt7.style.left = '97vw';
    
    pt8.style.top = '96vh';
    pt8.style.left = '50vw';

    pt9.style.top = '50vh';
    pt9.style.left = '2vw';
  } else if (calib == 4) {
    pt6.style.top = '33vh';
    pt6.style.left = '33vw';

    pt7.style.top = '33vh';
    pt7.style.left = '66vw';
    
    pt8.style.top = '66vh';
    pt8.style.left = '33vw';

    pt9.style.top = '66vh';
    pt9.style.left = '66vw';
  }
}

/**
* This function clears the CALIRABGE buttons memory
*/
function ClearCalibration(){
  // Clear data from WebGazer
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('background-color', 'red');
    i.style.setProperty('opacity', '0.2');
    i.removeAttribute('disabled');
  });

  CalibrationPoints = {};
  PointCalibrate = 0;
}

// sleep function because java doesn't have one, sourced from http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


function calib4(points) {
  // Display the square of inner points
  if (points == 4) {
    document.getElementById('Pt6').style.removeProperty('display');
    document.getElementById('Pt7').style.removeProperty('display');
    document.getElementById('Pt8').style.removeProperty('display');
    document.getElementById('Pt9').style.removeProperty('display');
  }
  // Display all other points except of the central point
  if (points == 8) {
    document.getElementById('Pt10').style.removeProperty('display');
    document.getElementById('Pt11').style.removeProperty('display');
    document.getElementById('Pt12').style.removeProperty('display');
    document.getElementById('Pt13').style.removeProperty('display');
    document.getElementById('Pt14').style.removeProperty('display');
    document.getElementById('Pt15').style.removeProperty('display');
    document.getElementById('Pt16').style.removeProperty('display');
    document.getElementById('Pt17').style.removeProperty('display');
  }
}

function calib3(points) {
  if (points == 4) {
    // Top point
    const pt6 = document.getElementById('Pt6');
    pt6.style.removeProperty('display');
    pt6.style.top = '70px';
    pt6.style.left = '50vw';
    // Right point
    const pt7 = document.getElementById('Pt7');
    pt7.style.removeProperty('display');
    pt7.style.top = '50vh';
    pt7.style.right = '2vw';
    // Bottom point
    const pt8 = document.getElementById('Pt8');
    pt8.style.removeProperty('display');
    pt8.style.bottom = '2vh';
    pt8.style.left = '50vw';
    // Left point
    const pt9 = document.getElementById('Pt9');
    pt9.style.removeProperty('display');
    pt9.style.top = '50vh';
    pt9.style.left = '2vw';
  }
}