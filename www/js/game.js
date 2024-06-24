// code to inject in the html page when we want to load the game
const code = `
var applicationInstance;
var unityInstantiated = false;

var counter1 = 0;

function instantiateApplication()
{
	document.body.appendChild(script);
}

function startToLoad() {

	//document.querySelector("#startToLoadButtonDiv").style.display = "none";
	document.querySelector('.progressText').style.display = showProgress;

	counter1++;
	if (counter1 == 1)
	{
		instantiateApplication();
	}
}

//s31//
var buildUrl = './Game/Build';
// Modifier la variable suivante pour coller avec le jeu du moment (nom trouvable dans le nom du dossier de build)
var name = 'WebCamEyeTrackerTestScene-v0.3';
var loaderUrl = buildUrl + '/' + name + '.loader.js';
var config = {
	dataUrl: buildUrl + '/' + name + '.data.unityweb',
	frameworkUrl: buildUrl + '/' + name + '.framework.js.unityweb',
	codeUrl: buildUrl + '/' + name + '.wasm.unityweb',
	streamingAssetsUrl: 'StreamingAssets',
	companyName: 'OpenMindInnovation',
	productName: 'Omind',
	productVersion: '1.0',
};
//s32//

var container = document.querySelector('#gameContainer');
var canvas = document.querySelector('#unity-canvas');
var loader = document.querySelector('#loader');

var script = document.createElement('script');

script.src = loaderUrl;
script.onload = () => {
	createUnityInstance(canvas, config, (progress) => {
		if (progress === 1) {

		}
		else if (progress >= 0.9) {
			loader.querySelector('.progressText').innerHTML = 'LOADING...';
		}
		else {
			loader.querySelector('.progressText').innerHTML = Math.round(progress * 100) + '%';
		}

		loader.querySelector('.full').style.transform = 'scaleX(' + progress + ')';
	}).then((unityInstance) => {

		applicationInstance = unityInstance;
		unityInstantiated = true;

		loader.querySelector('.progressBar').style.display = 'none';
		loader.querySelector('.progressText').style.display = 'none';
		loader.querySelector('.gameLogo').style.display = 'none';
		loader.querySelector('.awtCanvas1').style.backgroundColor = 'transparent';
		loader.querySelector('.awtCanvas1').style.pointerEvents = 'none';
		document.querySelector('#socialLinks_landscapeMode').style.display = 'none';
		document.querySelector('.description').style.display = 'none';
		document.getElementsByClassName('storeLinks')[0].style.display = 'none';
		document.getElementsByClassName('storeLinks')[1].style.display = 'none';

		document.querySelector('#footer').style.display = 'none';
		document.querySelector("#socialLinks_portraitMode").style.display = "none";
		document.querySelector("#companyLogo").style.display = "none";

		document.getElementsByClassName("awtBackground")[0].style.display = "none";
		document.querySelector(".awtBackground").style.pointerEvents = "none";

		document.querySelector(".awtCanvas2").style.pointerEvents = "none";

		document.querySelector("#watchVideoButton").style.display = "none";
		document.querySelector("#playPongButton").style.display = "none";

	}).catch((message) => {
		alert(message);
	});
};
	`;



/**
 * Launch the game in web page (triggered at the end of the calibration)
 */
function launch_game() {
	// Add elements that load the game canvas in the html page
	var gameContainer = document.getElementById("jeu");
	var template1 = document.getElementById("truc1");
	var clone1 = template1.content.cloneNode(true);
	var template2 = document.getElementById("truc2");
	var clone2 = template2.content.cloneNode(true);
	var template3 = document.getElementById("truc3");
	var clone3 = template3.content.cloneNode(true);
	gameContainer.appendChild(clone1);
	gameContainer.appendChild(clone2);
	gameContainer.appendChild(clone3);
	// Load js script from the code variable at the top of this file into the html page
	var script0 = document.createElement('script');
	script0.textContent = code;
	document.body.appendChild(script0);
	// Load awt.js into the page (bugs if imported at the loading of the page)
	var script1 = document.createElement('script');
	script1.src = './Game/awt.js';
	document.body.appendChild(script1);
}