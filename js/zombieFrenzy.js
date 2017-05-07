var zombieFrenzy = (function() {
	var scriptQueue = [];
	var numResourcesLoaded = 0; 
	var numResources = 0; 
	var executeRunning = false;

	function getLoadProgress() {
		return numResourcesLoaded / numResources;
	}

	function executeScriptQueue() {
		var next = scriptQueue[0];
		var first; 
		var script;

		if(next && next.loaded) {
			executeRunning = true;
			scriptQueue.shift();
			first = document.getElementsByTagName("script")[0];
			script = document.createElement("script");
			script.onload = function() {
				if(next.callback) {
					next.callback();
				}
				executeScriptQueue();
			}; 
			script.src = next.src; 
			first.parentNode.insertBefore(script, first);
		} else {
			executeRunning = false;
		}
	}

	function load(src, callback) {
		var image;
		var queueEntry;

		numResources++;

		queueEntry = {
			src: src,
			callback: callback,
			loaded: false
		};
		scriptQueue.push(queueEntry);

		image = new Image();
		image.onload = image.onerror = function() {
			numResourcesLoaded++;
			queueEntry.loaded = true; 
			if(!executeRunning) {
				executeScriptQueue();
			}
		};
		image.src = src;
	}

	function setup() {
		zombieFrenzy.showScreen("screen-splash");
	}

	function showScreen(screenId) {
		var dom = zombieFrenzy.dom;
		var $ = dom.$; 
		var activeScreen = $("#game .screen.active")[0];
		var screen = $("#" + screenId)[0];

		if(!zombieFrenzy.screens[screenId]) {
			console.warn("Screen module " + screenId + " is not implemented yet!");
			return;
		}

		if(activeScreen) {
			dom.removeClass(activeScreen, "active");
		}
		dom.addClass(screen, "active");
		zombieFrenzy.screens[screenId].run();
	}

	function isStandalone() {
		return (window.navigator.standalone !== false);
	}

	return {
		load: load,
		setup: setup,
		showScreen: showScreen,
		isStandalone : isStandalone,
		screens: {},
		getLoadProgress : getLoadProgress
	};

})(); 