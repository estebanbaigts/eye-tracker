import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// Global constants for distance calculation
const KNOWN_DISTANCE = 50; // cm (adjust according to your setup)
const KNOWN_FACE_WIDTH = 14.5; // cm (adjust according to your setup)
let focalLength = null; // Initialize focal length

// Function to calculate distance from object size
function calculateDistance(faceWidth) {
    return (KNOWN_FACE_WIDTH * focalLength) / faceWidth;
}

// Function to measure brightness
function measureBrightness(imageData) {
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        totalBrightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    document.getElementById('brightness').textContent = totalBrightness / (imageData.width * imageData.height);
    return totalBrightness / (imageData.width * imageData.height);
}

/**
 * Constructor of TFFaceMesh object
 * @constructor
 * */
const TFFaceMesh = function() {
  this.model = faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );
  this.predictionReady = false;
};

// Global variable for face landmark positions array
TFFaceMesh.prototype.positionsArray = null;

/**
 * New luminance (perceived) function bc the one in util.mjs is part of a class
 */
function avgLuminance(pixels, width, height) {
    var luminance = new Uint8ClampedArray(pixels.length >> 2);
    var p = 0;
    var w = 0;
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var value = pixels[w] * 0.299 + pixels[w + 1] * 0.587 + pixels[w + 2] * 0.114;
            luminance[p++] = value;
            w += 4;
        }
    }
    var avg = 0;
    for (var i = 0; i < luminance.length; i++) {
        avg += luminance[i];
    }
    avg /= luminance.length;
    return avg;
}

/**
 * Isolates the two patches that correspond to the user's eyes
 * @param  {Object} video - the video element itself
 * @param  {Canvas} imageCanvas - canvas corresponding to the webcam stream
 * @param  {Number} width - of imageCanvas
 * @param  {Number} height - of imageCanvas
 * @return {Object} the two eye-patches, first left, then right eye
 */
TFFaceMesh.prototype.getEyePatches = async function(video, imageCanvas, width, height) {
  if (imageCanvas.width === 0) {
    return null;
  }

  const model = await this.model;
  const timestamp_pred = Date.now();
  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: false,
  });

  var lumi = 0;
  var timestamp_lumi = 0;
  if (predictions[0]) {
      const dim = predictions[0].boundingBox;
      const frameWidth = dim.bottomRight[0] - dim.topLeft[0];
      const frameHeight = dim.bottomRight[1] - dim.topLeft[1];
      const frame = imageCanvas.getContext('2d').getImageData(dim.topLeft[0], dim.topLeft[1], frameWidth, frameHeight);

      lumi = avgLuminance(frame.data, frameWidth, frameHeight);
      timestamp_lumi = Date.now();
  }
  if (predictions.length == 0){
      return false;
    }
    
    this.positionsArray = predictions[0].scaledMesh;
    const prediction = predictions[0];
    const positions = this.positionsArray; 
    
    const { scaledMesh } = predictions[0];
    const [leftBBox, rightBBox] = [
        {
            eyeTopArc: prediction.annotations.leftEyeUpper0,
            eyeBottomArc: prediction.annotations.leftEyeLower0
        },
        {
            eyeTopArc: prediction.annotations.rightEyeUpper0,
            eyeBottomArc: prediction.annotations.rightEyeLower0
        },
    ].map(({ eyeTopArc, eyeBottomArc }) => {
        const topLeftOrigin = {
            x: Math.round(Math.min(...eyeTopArc.map(v => v[0]))),
            y: Math.round(Math.min(...eyeTopArc.map(v => v[1]))),
        };
        const bottomRightOrigin = {
            x: Math.round(Math.max(...eyeBottomArc.map(v => v[0]))),
            y: Math.round(Math.max(...eyeBottomArc.map(v => v[1]))),
        };
        
        return {
            origin: topLeftOrigin,
            width: bottomRightOrigin.x - topLeftOrigin.x,
            height: bottomRightOrigin.y - topLeftOrigin.y, 
        }
    });
    var leftOriginX = leftBBox.origin.x;
    var leftOriginY = leftBBox.origin.y;
    var leftWidth = leftBBox.width;
    var leftHeight = leftBBox.height;
    var rightOriginX = rightBBox.origin.x;
    var rightOriginY = rightBBox.origin.y;
    var rightWidth = rightBBox.width;
    var rightHeight = rightBBox.height;
    
    if (leftWidth === 0 || rightWidth === 0){
        console.log('an eye patch had zero width');
        return null;
    }
    
    if (leftHeight === 0 || rightHeight === 0){
        console.log('an eye patch had zero height');
        return null;
    }
    
    var eyeObjs = {};
    
    var leftImageData = imageCanvas.getContext('2d').getImageData(leftOriginX, leftOriginY, leftWidth, leftHeight);
    
     var leftImageDataLight = {"data" : {}};
    var j = 0;
    for (var i=0; i<leftImageData.data.length; i++) {
        if ((i+1)%4 === 0) {
            continue;
        } else {
            leftImageDataLight["data"][j.toString()] = leftImageData["data"][i.toString()];
            j++;
        }
    }
    
    eyeObjs.left = {
        patch: leftImageData,
        imagex: leftOriginX,
        imagey: leftOriginY,
        width: leftWidth,
        height: leftHeight
    };
    
    var rightImageData = imageCanvas.getContext('2d').getImageData(rightOriginX, rightOriginY, rightWidth, rightHeight);
    var rightImageDataLight = {"data" : {}};
    const newImage = Image;
    var j = 0;
    for (var i=0; i<rightImageData.data.length; i++) {
        if ((i+1)%4 === 0) {
            continue;
        } else {
            rightImageDataLight["data"][j.toString()] = rightImageData["data"][i.toString()];
            j++;
        }
    }
    eyeObjs.right = {
        patch: rightImageData,
        imagex: rightOriginX,
        imagey: rightOriginY,
        width: rightWidth,
        height: rightHeight
    };
    eyeObjs.luminance = [lumi, timestamp_lumi];
    eyeObjs.timestamp_pred = timestamp_pred;
    return eyeObjs;
};

TFFaceMesh.prototype.getEyePatches = function () {
  return this.eyePatches;
}

TFFaceMesh.prototype.getPositions = function () {
  return this.positionsArray;
}

TFFaceMesh.prototype.reset = function(){
  console.log( "Unimplemented; Tracking.js has no obvious reset function" );
}

TFFaceMesh.prototype.drawFaceOverlay = function(ctx, keypoints){
  if (keypoints) {
    ctx.fillStyle = '#32EEDB';
    ctx.strokeStyle = '#32EEDB';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < keypoints.length; i++) {
      const x = keypoints[i][0];
      const y = keypoints[i][1];

      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }
}

TFFaceMesh.prototype.name = 'TFFaceMesh';

export default TFFaceMesh;

// Main function to start camera and perform face detection
async function startCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const faceMesh = new TFFaceMesh();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;

        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        });

        video.addEventListener('play', async () => {
            const tick = async () => {
                if (video.paused || video.ended) {
                    return;
                }
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                measureBrightness(imageData);
                const eyePatches = await faceMesh.getEyePatches(video, canvas, canvas.width, canvas.height);
                if (eyePatches) {
                    const faceWidth = eyePatches.right.imagex - eyePatches.left.imagex; // Calculate face width in pixels
                    if (!focalLength && faceWidth > 0) {
                        focalLength = (faceWidth * KNOWN_DISTANCE) / KNOWN_FACE_WIDTH;
                    }
                    if (focalLength) {
                        const distance = calculateDistance(faceWidth);
                        document.getElementById('distance').textContent = distance.toFixed(2) + ' cm';
                    }
                }
                setTimeout(tick, 100); // Update at ~10 fps
            };
            tick();
        });
    } catch (error) {
        console.error('Error accessing the camera: ', error);
    }
}
startCamera();
