zombieFrenzy.screens["screen-menu"] = (function(){
	var firstRun = true;
	var dom = zombieFrenzy.dom;

	function setup() {
		dom.bind("#screen-menu ul.menu", "click", function(e) {
			if(e.target.nodeName.toLowerCase() === "button") {
				var action = e.target.getAttribute("name");
				zombieFrenzy.showScreen(action);
			}
		});
	}

	function run() {
		if(firstRun) {
			setup();
			firstRun = false;
		}
	}

	return {
		run: run
	};

})();