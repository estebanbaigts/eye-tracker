const params = {
  moveTickSize: 50,
  videoContainerId: 'webgazerVideoContainer',
  videoElementId: 'webgazerVideoFeed',
  videoElementCanvasId: 'webgazerVideoCanvas',
  faceOverlayId: 'webgazerFaceOverlay',
  faceFeedbackBoxId: 'webgazerFaceFeedbackBox',
  gazeDotId: 'webgazerGazeDot',
  videoViewerWidth: 320,
  videoViewerHeight: 240,
  faceFeedbackBoxRatio: 0.66,
  // View options
  showVideo: false,
  mirrorVideo: true,
  showFaceOverlay: false,
  showFaceFeedbackBox: true,
  showGazeDot: true, // Still displayed when set to false, see index.mjs:577 if the error in the line comes from here
  camConstraints: { video: { width: { min: 320, ideal: 640, max: 1920 }, height: { min: 240, ideal: 480, max: 1080 }, facingMode: "user" } },
  dataTimestep: 50,
  showVideoPreview: true,
  applyKalmanFilter: true,
  saveDataAcrossSessions: true,
  // Whether or not to store accuracy eigenValues, used by the CALIBRAGE example file
  storingPoints: false,

  trackEye: 'both',

  precisionMethod: 'percents', // percents OR pixels (not used atm!)
};

export default params;