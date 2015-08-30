(function() {
	var flgAction = false;
	var lastMutation = "";

	var takeAction = function(){
		var rso = document.getElementById('rso');

		if(!rso || rso.getAttribute("eid") == lastMutation) return;

		if(!flgAction){
			chrome.extension.sendMessage({action: "showPageAction"}, function(response) {});
			flgAction = true;
		}

		lastMutation = rso ? rso.getAttribute("eid") : null;

		var maxI = 50;
		var ii=0;
		var centerCol = document.getElementById("center_col");

		if(centerCol){
			centerCol.style.display = "none";
		}

		chrome.extension.sendMessage({action: "getBlockedDomains"}, function(response) {
			var arDomains = response.arDomains;
			arDomains.push({match: "ends", domain: ".w3schools.com"});

			arDomains.forEach(function(domain){
				var basicList = document.querySelectorAll(".g a[href*='" + domain.domain + "']"); // All links containing domain

				[].forEach.call(basicList, function(link){
					var href = link.href.substr(link.href.search("://") + 3);
					var flgRemove = false;

					href = href.substr(0, href.search("/"));

					switch(domain.match){
						case "exact":
							flgRemove = href === domain.domain;
							break;
						case "starts":
							flgRemove = href.search(domain.domain) === 0;
							break;
						case "contains":
							flgRemove = href.search(domain.domain) >= 0;
							break;
						case "ends":
							flgRemove = href.search(domain.domain) === href.length - domain.domain.length;
							break;
					}

					if(flgRemove){
						var resultItem = link.parentElement;

						while(resultItem && !resultItem.classList.contains("g")){
							resultItem = resultItem.parentElement;
						}

						if(resultItem){
							resultItem.remove();
						}
					}
				});
			});

			if(centerCol){
				centerCol.style.display = "block";
			}
		});
	};

	takeAction();

	new MutationObserver(function(mutations){
		mutations.forEach(function(mutation){
			var targetId = mutation.target.id;
			if(targetId !== "search" && targetId !== "gsr") return;
			takeAction();
		});
	}).observe(document.body, {childList: true, subtree: true});
})();
