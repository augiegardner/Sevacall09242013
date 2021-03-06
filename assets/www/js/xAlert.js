/**
 * @xAlert
 * @arguments: (str) message, (func) callback, (str) opt_title, (str) opt_buttons
 * @type buttons (str): comma separated list, no spaces  
**/ 
function xAlert(options) {
	var self = this;
	self.defaults = {	
						title	: "Alert",
						content : "",
						orientation : "horizontal",
        				callback : function(){}
					};
    
	// use user-specified options, else use defaults
	//
	for (k in self.defaults)	{
		if (typeof(self[k]) != typeof(self.defaults[k]))
			self[k] = self.defaults[k];
	}
    
    self.content = arguments[0] ? arguments[0] : self.defaults.content;
    self.callback = arguments[1] ? arguments[1] : self.defaults.callback;
    self.title = arguments[2] ? arguments[2] : self.defaults.title;
    self.buttons = arguments[3] ? arguments[3].split(",") : ["Dismiss"];
    self.mainButtons = self.buttons.filter(function(elem, index, array){
    	if(self.buttons[index].indexOf("#") != -1 && (self.buttons[index] = self.buttons[index].replace("#", "")))
        	return true;
    });
    
    if(isPhoneGap) {
        	return navigator.notification.confirm(self.content, self.callback, self.title , self.buttons.toString());
    }
	
	self.cancelTouchMove = function( e ) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	};
	
	self.init();
}

xAlert.prototype = {
	
	init : function(){
		var self = this;
		
		self.setOverlay();
		self.setPopup();
		self.setButtons();
		
		self.create();
	},
	
	create : function( ) {
		var self = this;
		
		// append overlay and alert container
		//
		document.getElementById('fastclick').appendChild(self.overlay);
		document.getElementById('fastclick').appendChild(self.popup);
		
		// append all buttons to alert container
		//
		for(var i = 0; i < self.buttonsArray.length; i++) {
			self.popup.querySelector(".alert-buttons").appendChild(self.buttonsArray[i]);
		}
		
		self.disableScrolling();
	},
	
	destroy : function() {
		var self = this;
		
		// classes to fade out
		//
		self.popup.className+= " destroy";
		self.overlay.className+= " destroy";
		
		// after fade out, remove DOM elements
		//
        document.getElementById('fastclick').removeChild(self.popup);
        document.getElementById('fastclick').removeChild(self.overlay);
		
		self.enableScrolling();
	
	},
	
	disableScrolling : function() {
		document.body.addEventListener("touchmove", this.cancelTouchMove);
	},
	
	enableScrolling : function() {
		document.body.removeEventListener("touchmove", this.cancelTouchMove);
	},
	
	setOverlay : function() {
		var self = this;
		self.overlay = document.createElement("div");
		self.overlay.className = "alert-overlay";
		
		// apply a window-specific radial gradient to accomodate for the pixel-specific radial gradient syntax which is the most widely supported syntax (otherwise, use percentage-based)
		//
		var bg =  "background-image: -webkit-gradient(radial, 50% 50%, 0, 50% 50%, " + window.screen.width + ", color-stop(0%, rgba(0, 0, 0, 0.00)), color-stop(100%, rgba(0, 0, 0, 0.55)));";
			bg += "background-image: -moz-radial-gradient(center center, 50% 100%, rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.55) 100%);";
			bg += "background-image: -webkit-gradient(radial, 50% 50%, 0, 50% 50%, 114, color-stop(0%, rgba(0, 0, 0, 0.55)), color-stop(100%, rgba(0, 0, 0, 0.55)));"
			bg += "background-image: -webkit-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
			bg += "background-image: -moz-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
			bg += "background-image: -ms-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
			bg += "background-image: -o-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
			bg += "background-image: radial-gradient(100% 100% at center center, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
		self.overlay.setAttribute("style", bg);
	},
	
	setPopup : function() {
		var self = this;
		self.popup = document.createElement("div");
		self.popup.className = "alert-wrapper";
		
		// Use innerHTML instead of creating several extra DOM elements and appending them
		//
		var innerHTML = 	'	<div class="alert-vertical-center">';
			innerHTML += 	'	<div class="alert">';
			innerHTML += 	'	<div class="highlight">';
			innerHTML +=	'	</div>';
			innerHTML += 	'	<div class="alert-content">';
			innerHTML +=    '		<div class="alert-title">';
			innerHTML +=    '			' + self.title;
			innerHTML +=    '		</div>';
			innerHTML +=    '		'+self.content+'';
			innerHTML +=	'		<div class="alert-buttons">';
			innerHTML +=	'		</div>';
			innerHTML +=	'	</div>';
			innerHTML +=	'	</div>';
			innerHTML +=	'	</div>';
		
		self.popup.innerHTML = innerHTML;
	},
	
	setButtons : function() {
		var self = this;
		self.buttonsArray = [];
		var count = self.buttons.length;
		
		for(var i = 0; i < count; i++) {
            var button = document.createElement("div");
            var	width = (count > 1 && self.orientation == "horizontal") ? ((100 - ( count - 1 )) / count) : 100;
            button.className = "alert-button";
            button.className += self.mainButtons[i] ? " main" : "";
            button.style.width = width+"%";
            button.innerHTML = self.buttons[i];
            button.setAttribute("data-buttonNumber", i+1);
            button.addEventListener("click", function(){self.callback(this.getAttribute("data-buttonNumber")); self.destroy();});
			self.buttonsArray.push(button);
		}
	}
	
}