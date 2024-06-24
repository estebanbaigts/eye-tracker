/*
 * This function calculates a measurement for how precise 
 * the eye tracker currently is which is displayed to the user
 */
function calculatePrecision(past50Array, method) {
  var windowHeight = window.innerHeight;
  var windowWidth = window.innerWidth;

  // Retrieve the last 50 gaze prediction points
  var x50 = past50Array[0];
  var y50 = past50Array[1];

  // Calculate the position of the point the user is staring at
  var staringPointX = windowWidth / 2;
  var staringPointY = windowHeight / 2;

  var percentageValues = new Array(50);
  var pixelValues = new Array(50);

  calculatePrecisionValues(percentageValues, pixelValues, windowHeight, x50, y50, staringPointX, staringPointY, method);
  var precisionPercentages = calculateAverage(percentageValues);
  var precisionPixels = calculateAverage(pixelValues);

  // Return the precision measurement as a rounded percentage
  return [Math.round(precisionPercentages), Math.round(precisionPixels)];
};

/*
 * Calculate percentage accuracy for each prediction based on distance of
 * the prediction point from the centre point (uses the window height as
 * lower threshold 0%)
 */
function calculatePrecisionValues(percentageValues, distanceValues, windowHeight, x50, y50, staringPointX, staringPointY, method) {
  for (x = 0; x < 50; x++) {
    // Calculate distance between each prediction and staring point
    var xDiff = staringPointX - x50[x];
    var yDiff = staringPointY - y50[x];
    var distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));

    if (method == 'percents') {
      console.log("Méthode d'évaluation de précision: pourcentage.");
      // Calculate precision percentage
      var halfWindowHeight = windowHeight / 2;
      var precision = 0;
      if (distance <= halfWindowHeight && distance > -1) {
        precision = 100 - (distance / halfWindowHeight * 100);
      } else if (distance > halfWindowHeight) {
        precision = 0;
      } else if (distance > -1) {
        precision = 100;
      }
      // Store the precision
      percentageValues[x] = precision;
      distanceValues[x] = distance;
    } else if (method == 'pixels') {
      console.log("Méthode d'évaluation de précision: pixels.");
      // Store the distance
      distanceValues[x] = distance;
    } else {
      console.log("Méthode d'évaluation de précision inconnue.");
    }

  }
}

/*
 * Calculates the average of all precision percentages calculated
 */
function calculateAverage(precisionPercentages) {
  var precision = 0;
  for (x = 0; x < 50; x++) {
    precision += precisionPercentages[x];
  }
  precision = precision / 50;
  return precision;
}

module.exports = {
  calculatePrecision,
  calculatePrecisionValues,
  calculateAverage
};