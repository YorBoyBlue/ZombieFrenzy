zombieFrenzy.screens["screen-splash"] = (function(){
	var firstRun = true;

	function checkProgress() {
		var $ = zombieFrenzy.dom.$;
		var p = zombieFrenzy.getLoadProgress() * 100;
		$("#screen-splash .indicator")[0].style.width = p + "%";
		if(p == 100) {
			setup();
		} else {
			setTimeout(checkProgress, 30);
		}
	}

	function setup() {
		var dom = zombieFrenzy.dom, $ = dom.$, screen = $("#screen-splash")[0];
		$(".continue", screen)[0].style.display = "block";
		dom.bind("#screen-splash", "click", function() {
			zombieFrenzy.showScreen("screen-menu");
		});
	}

	function run() {
		if(firstRun) {
			checkProgress();
			firstRun = false;
		}
	}

	return {
		run: run
	};

})();