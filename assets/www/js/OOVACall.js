/** //
 *	@description A collection of javascript resources, including OOVACall, the object oriented version of SevaCall
 *	@author	Augie Gardner
 *	@created March 2013
 *	@updated June 2013
 *
 **/
var PHONEGAP_TYPE = "Android"; // necessary for review link
var DEFAULT_DESCRIPTION = "Describe what you need help with in as much detail as possible..."
var TWITTER_MESSAGE = "SevaCall found me help in minutes! sevacall.com #savetime #awesome @sevacall";

var omitFinalPage = false;
var testing = false; // gett ing all company ratings may not work with the testing on
var clearStorage = false; // clears the local storage on page load

if(clearStorage) {
	window.localStorage.clear();
}

// function that loads when the page is ready for manipulation
//
function DeviceReady(callback) {
	var IV = new infoValidate();
	// if an action took place before OOVACall was completely loaded, we're going to add this action to the stack and load it when OOVACall is finished
	var actionTaken = false;
	$("#where-click, #info-icon, #settings-icon").click(function(){
		if(typeof OOvaCall == 'undefined') {
			var action = $(this).attr("id");
			actionTaken = action;
			alert("added to stack: " + action);
		}
	});
	var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i) ? true : false;
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i) ? true : false;
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i) ? true : false;
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
        }
    };
	/*
	Android fake active class (fix)
	if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
		// header buttons and time buttons need to be delegated in our bindbuttons function, this will get overridden by that point.
		$(".button, .what-text.nativeSelect").bind("touchstart", function ( e ) { 
			
			$(this).focus();
			 //$(this).addClass("fake-active");
		}).bind("touchend", function() {
			$(this).removeClass("fake-active");
		}).bind("touchmove", function() { // Substitute for the fact that touchcancel is not firing on some devices
			var $this = $(this);
			$this.removeClass("fake-active");
		});
	}
	*/
	
	// SevaCall's API variable-grabbing ping (getConstants)
	//
	var site = $root + 'api/mobile/v3/getConstants.php?version=1.0.25';
	
	// SevaCalls API-retrieved Variables
	//
	var API_URL;
	var ADD_HISTORY = true;
	APILoaded=true;
	var firstPopState = true;
	var currentStateID = 0;
	var nextPage;
	var currentState = {page : "step1.php", direction : "back", id : currentStateID};

	var POPPED = 0;
	if(APILoaded) {
		window.onpopstate = function(event) {
			POPPED++;
			var self = OOvaCall;
			var pageObject = event.state;
			
			if(currentState.page == "timetable.php") {
				TT.cancelTimeTable();
			}
			if(!pageObject) {
				pageObject = {page : "step1.php", direction : "back", id : -1};
			}
			if(firstPopState) {
				firstPopState = false;
				return;
			}
			
			if(pageObject) {
				var popID = window.event.state ? window.event.state.id : -1;
				ADD_HISTORY = false;	
				var callback = function(){currentStateID = popID; currentState = pageObject};
				var lateCallback = function(){ADD_HISTORY = true;};
				
				
				var direction = currentState.direction == "forward" ? "back" : "forward";
				
				console.log("popID: " + popID + " currentStateID: " + currentStateID + "currentStatePage: " + currentState.page + " currentStateDirection: " + currentState.direction);
				if(popID < currentStateID) {
					console.log("BCK");
					if(self.request) {
						POPPED--;
						self.request.abort();
					}
					self.changePage(pageObject.page, direction, callback, lateCallback, {drawMap : true});
				}
				else if(popID > currentStateID) {
					console.log("FWD");
					if(self.request){
						POPPED--;
						self.request.abort();
					}
					self.changePage(pageObject.page, direction, callback, lateCallback, {drawMap : true});
				}
				else {
					console.log("************ stationary");
					// ending up on same page
					if(self.request)
						self.request.abort();
					self.changePage(pageObject.page, "stationary", callback, lateCallback, {drawMap : true});
				}
			}
		}
        
		/** 
		 * Loads a page and transitions it into view
		 *
		 * @return {boolean} true on success, false on failure
		 */
		var TRANSITIONING = false;
		var nextPage = {page : "", type : "", callback : function(){}, lateCallback : function(){}};
		var LOADINGPAGES = 0;
		var animationTimeout = function(){};
		
		function loadPage(page, type, callback, lateCallback, options) {
			TRANSITIONING = false;
			
			var self = OOvaCall;
			var timeoutID;
			var transitionTimer = 250; // note this should match the CSS transition property from the CSS file
			
			if(self.transitionCount % 2 == 0) {
				var transitionBox = $("#MAIN-TRANSITION");
				var mainBox = $("#MAIN");
			}
			else {
				var transitionBox = $("#MAIN");
				var mainBox = $("#MAIN-TRANSITION");
			}
			self.transitionCount++; 
			self.activateSpinner();
			self.deactivateButtons();
			self.request = $.SCAjax(page, requestHandler);
			if(self.infoBox)
				self.infoBox.close();
				
			if(ADD_HISTORY) {
				OOvaCall.pushHistory(type);
			}
			
			function requestHandler(result) {
				TRANSITIONING = true;
				//alert("Gotdata");
				POPPED = false;
				LOADINGPAGES++;
				if(callback) {
					callback();
				}
				if(type == "forward") {
					console.log("************** forward");
					transitionOut("left");
					transitionBox.removeClass("hidden ready-right ready-left").addClass("ready-right").html(result);
					transitionIn();
				}
				else if(type == "back") {
					console.log("************** backward");
					transitionOut("right");
					transitionBox.removeClass("hidden ready-right ready-left").addClass("ready-left").html(result);
					transitionIn();
				}
				else if(type == "stationary") {
					self.deactivateSpinner();
					self.activateButtons();
					mainBox.removeClass("centered").addClass("ready-right");
					transitionBox.addClass("centered").html(result);
				}
				optionalCallbacks();
                if(page == "step3.php" && ((options && options.drawMap) || type == "back"))
					activateMap();
				/*
				if(lateCallback) {
					lateCallback();
				}
				*/
				
				setTimeout(function(){
					//alert(">");
					LOADINGPAGES--;
					POPPED--;
					if(lateCallback) {
						lateCallback();
					}
					if(LOADINGPAGES == 0) {
						//alert("DONE");
						mainBox.addClass("hidden").empty();
						if(self.radialBackground && page != "final.php")
							self.removeRadialBackground();
					}
					/*
					if(POPPED == 0) {
						if(self.radialBackground && page != "final.php")
							self.removeRadialBackground();
						mainBox.addClass("hidden").empty();
					}
					*/
				},transitionTimer);
			}
			/*
			function checkIfDoneTransitioning(callback) {
				alert();
				animationTimeout = setTimeout(function(){
					
							if(POPPED == 0) {
								alert("YA");;
							}
							else
								alert(POPPED);
						}
					);
				}, 1);
			}
			*/
			function transitionOut(direction) {
				setTimeout(function(){ // timeout necessary for class to be added above(otherwise transitioning is off, im not sure why)
					if(direction == "left") {
						mainBox.removeClass("centered").removeClass("REMOVED").addClass("transition ready-left");
					}
					else if(direction == "right")
						mainBox.removeClass("centered").removeClass("REMOVED").addClass("transition ready-right");
					setTimeout(function(){
						mainBox.removeClass("transition");
					}, transitionTimer);
				}, 1);
			}
			
			function transitionIn() {
				var timeoutID = currentStateID;
				setTimeout(function() { // timeout necessary for class to be added above(otherwise transitioning is off, im not sure why)
						self.deactivateSpinner();
						self.activateButtons();
						transitionBox.addClass("transition centered").addClass("REMOVED");//.removeClass("");
						
						setTimeout(function(){
							transitionBox.removeClass("transition");// ready-right ready-left");
							if(timeoutID == currentStateID) {
								console.log("timeoutIDS === " + timeoutID);
								transitionBox.removeClass("ready-right ready-left");
								//alert("RMV");
							}
							else {
								console.log("timeout ID was: " + timeoutID + " and currentStateID was : " + currentStateID);
							}
						}, transitionTimer);
						
				}, 1);
			}
			
			
			
			
			
			/************************************** LOAD-PAGE HELPERS ********************************/
			function optionalCallbacks() {
				//mainBox.empty();
				self.setHeaderButtons();
				self.paintHeaderButtons();
				self.repaintPageVars();
				self.trackPageOpened();
				self.pageSnap();
				self.setNextPage();
				if(page == "final.php") { 
					self.addRadialBackground(transitionBox);
				}
				
				if(page == "information.php") {
					$(".video-box").append(self.video);
					self.setVimeoActions();
					$(self.video).css({"top" : "0px"}).animate({
						opacity : 1
					}, 1500);
				}
				if(page == "step3.php") {
					self.appendExistingStatuses();
					console.log(">>>>>>>>sppending statuses<");
				}
			}
			function activateMap() {
				self.drawMap();
				if(self.requestComplete) {
					self.pageMap['step3.php'].buttons.right = "next";
					self.setHeaderButtons();
				}
				self.paintHeaderButtons();
				self.activateTable($(".table-two"));
				$("#tableTwo").html(self.allStatuses);
				if(self.ratingsActive) {
					self.activateTable($(".table-one"));
					$("#tableOne").html(self.allRatings);
				}
			}
		}
			
		/** 
		 * @name OOVACALL
		 * @description Object Oriented Version of Sevacall
		 * @author Stephen (Augie) Gardner
		 * @version 1.0
		 * @created 1/05/2013
		 * @updated 2/12/2012
		 */
		
		function OOVACall() {
			var self = this;
			this.step = 1;
			this.what = "Select Service Category";
			this.where = "";
			this.numCallsSaved = 0;
			this.mapSaved;
			
			this.options = {};  // options to be used for various instances around the object
			this.name = "";
			this.email = "";
			this.phone = "";
			this.companies = new Object();
			this.companiesArray = new Array();
			this.liveStatus = new Object();
			this.liveStatusIndex = 0;
			this.liveRequestStatusComplete  = false;
			this.requestID = "none";
			this.transitionCount = 0;
			
			this.description = "none";
			this.dataEntered = false;
			this.timesAvailable = [];
			this.statusThrottle = [];
			this.googleMap; // Google Map
			this.pageHistory = new Array("step1.php");
            
			this.cancelTouchMove = function( e ) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			};
	
			this.pageMap = 	{
							"step1.php" : 
								{
									page : "step1.php",
									map : { current : "step1.php", forward : "step2.php", back : "none"},
									buttons : { left : "blank", right : "blank" },
									action : function( e ) { return verifyInternet(function(){ return self.actionStep1( e );}); }//true;}//verifyInternet(function(){self.actionStep1( e );}); }
									
								},
									
							"step2.php" : 
								{
									page : "step2.php",
									map : { current : "step2.php", forward : "step2a.php", back : "step1.php", information : "information.php" },
									buttons : { left : "back", right : "blank" },
									action : function( e ) { return verifyInternet(function(){return self.actionStep2( e );}); }
									
								},
									
							"step2a.php" : 
								{
									page : "step2a.php",
									map : { current : "step2a.php", forward : "step2.php", back : "step2.php"},
									buttons : { left : "back", right : "blank" },
									action : function ( e ) { return verifyInternet(function(){ return self.actionStep2a( e );}); }
									
								},
									
							"step3.php" :
								{
									page : "step3.php",
									map : { current : "step3.php", forward : "final.php", back : "step2.php", information : "information.php" },
									buttons : { left : "blank", right : "loader" }
								},
								
							"final.php" :
								{
									page : "final.php",
									map : { current : "final.php", forward : "final.php", back : "step3.php"},
									buttons : { left : "back", right : "new" }
								},
								
							"information.php" :
								{
									page : "information.php",
									map : { current : "information.php", forward : "", back : "" },
									buttons : { left : "back", right : "blank" }
								},
									
							"recording.php" :
								{
									page : "recording.php",
									map : { current : "recording.php", forward : "step2.php", back : "step2.php" },
									buttons : { left : "back", right : "blank" },
									action : function( e ) { if(self.scr && self.scr.mediaRec) self.scr.mediaRec.stop(); self.scr.resetPlayback(); return self.xBack( e ); /*self.pageBack();*/}
								},
									
							"timetable.php" :
								{
									page : "timetable.php",
									map : { current : "timetable.php", forward : "step2.php", back : "step2.php" },
									buttons : { left : "back", right : "blank" },
									action : function( e ) { return self.actionTimetable( e ); }
								},
							"settings.php" :
								{
									page : "settings.php",
									map : { current : "settings.php", forward : "", back : "" },
									buttons : { left : "back", right : "blank" },
									action : function( e ) { return self.actionSettings( e )}
								}
							};
						this.init();
		}

		OOVACall.prototype = {
			
			/** 
			 * Initializes the OOVACALL object
			 *
			 * @constructor
			 * @this {OOVACALL}
			 * 
			 */
			init 			: 	function() {
									var self = this;
                					// populate the select dropdown
                                    //
									//createCategories();
									self.p = self.pageMap["step1.php"]; // page Object
									self.pC = self.p; // pageCurrent
									self.pP = "blank"; // pagePrevious
									self.pN = self.p.map.forward; // pageNext
									self.pagePrevious = "blank"; // there is no prior page yet
									// generate delegations for all future AJAX calls
									//
									self.bindButtons();
									self.bindTextAreas();
                					this.reviewLink = "";
                					if(isMobile.iOS())
                                    	this.reviewLink = "http://itunes.apple.com/genre/mobile-software-applications/id36?mt=8";
        							else if(isMobile.Android())
                                    	this.reviewLink = "market://details?id=423295476";
										
										//<table id="tableOne">
									self.mapTableOne = [];
									self.mapTableTwo = [];
									
								},
            
			reset			:	function() {
									var self = this;
									
									TT.daysSelected.length = 0;
									TT.emptyAll();
									
									this.step = 1;
									this.what = "Select Service Category";
									this.numCallsSaved = 0;
									this.mapSaved;
									this.requestComplete = false;
									
									this.companies = new Object();
									this.companiesArray = new Array();
									this.liveStatus = new Object();
									this.liveStatusIndex = 0;
									this.liveRequestStatusComplete  = false;
									this.requestID = "none";
									
									this.description = "none";
									this.dataEntered = false;
									this.timesAvailable = [];
									this.statusThrottle = [];
									this.googleMap; // Google Map
									this.pageHistory = new Array("step1.php");
									this.pageMap['step3.php'].buttons.right = "blank";
                					
									
									setTimeout(function(){
										// timeout so that page transitions before removing background
										self.removeRadialBackground();
									},1000);
									
								},
								
			bindPhonegapEvents:		function() {
										if(isPhoneGap) {
											function onPause() {
												TRACK("APPLICATION_PAUSED");
											}
											function onResume() {
                                            	if(!APIsLoaded)
                                                	loadHelperAPIs();
												TRACK("APPLICATION_RESUMED");
											}
											document.addEventListener("pause", onPause, false);
											document.addEventListener("resume", onResume, false);
										}
									},
									
			bindValidationTracking:	function() {
										// note by short-circuiting the && condition here, only .sentValidEvent becomes true if the first condition is met.  Smaller code.
										var self = this;
										$(document).bind("NameIsValid", function(){
											var pageName = self.pC.page.replace(".php", "");
											if(pageName == "step2a" && !OOvaCall.sentNameValidEventStep2A && (OOvaCall.sentNameValidEventStep2A = true)
												|| (pageName == "settings" && !OOvaCall.sentNameValidEventSettings && (OOvaCall.sentNameValidEventSettings = true)))
												TRACK(pageName + "_NAME_COMPLETED");
										});
										$(document).bind("EmailIsValid", function(){
											var pageName = self.pC.page.replace(".php", "");
											if(pageName == "step2a" && !OOvaCall.sentEmailValidEventStep2A && (OOvaCall.sentEmailValidEventStep2A = true)
												|| (pageName == "settings" && !OOvaCall.sentEmailValidEventSettings && (OOvaCall.sentEmailValidEventSettings = true)))
												TRACK(pageName + "_EMAIL_COMPLETED");
										});
										$(document).bind("PhoneIsValid", function(){
											var pageName = self.pC.page.replace(".php", "");
											if(( pageName == "step2a" && !OOvaCall.sentPhoneValidEventStep2A && (OOvaCall.sentPhoneValidEventStep2A = true)) 
												|| ( pageName == "settings" && !OOvaCall.sentPhoneValidEventSettings && (OOvaCall.sentPhoneValidEventSettings = true)))
												TRACK(pageName + "_PHONE_COMPLETED");
										});
								},
			
			bindSocialButtonTracking: function() {
										var self = this;
										$(document).delegate(".facebook-final, .facebook-info", "click", function(){
											var pageName = self.pC.page.replace(".php", "");
											TRACK(pageName + "_SCREEN_FACEBOOK_SHARE_BUTTON_PRESSED");
										});
										$(document).delegate(".twitter-final, .facebook-info", "click", function(){
											var pageName = self.pC.page.replace(".php", "");
											TRACK(pageName + "_SCREEN_TWITTER_SHARE_BUTTON_PRESSED");
										});
								},
								
			loadFacebook: 		function() {
									var self = this;
									if(!self.facebookInitialized && (self.facebookInitialized = true)) {
									/** IMPORTANT
									 * This phonegap usage of the facebook app is not necessarily complete.
									 * Heres the problem: I just want to publish a news story.  FB makes this so difficult you have to put their JS api on your webpage...
									 * And for mobile web, it auto detects someone is logged in, but it doesn't for the native app I don't believe.
									 * There are phonegap-facebook plugins, but frankly it is a lot of work for a low priority item and I haven't really heard otherwise.
									 **/
                                     /* Update, I'm using facebooks feed dialog.  It seems to work for now... */
										if(isPhoneGap) {
												$("body").delegate(".facebook-final", "click", function( e ) {
													var url = "http://facebook.com/dialog/feed";
														url += "?app_id=543995755650717";
														url += "&link=www.sevacall.com";
														url += "&name= Seva Call - Tell us what and when, we'll find the professionals!";
														url += "&description=Seva Call works to find local businesses that can help you with your service need instantly, like a free personal concierge service. Within minutes you will be connected to providers that can service your specific problem, on your schedule, at your location.";
														url += "&redirect_uri=http://sevacall.com";
														url += "#phonegap=external";
														console.log("popping up fb url: " + url);
														window.location = url;
												});
										}
										else {
										//window.fbAsyncInit = function() {
											// init the FB JS SDK
											FB.init({
											  appId      : '543995755650717',                       // App ID from the app dashboard
											  channelUrl : $root,//'http://www.test.s17.sevacall.com', 		// Channel file for x-domain comms
											  status     : true,                                 	// Check Facebook Login status
											  xfbml      : true                                  	// Look for social plugins on the page
											});

											// Additional initialization code such as adding Event Listeners goes here
											var feedObj = {
												method: 'feed',
												link: $root,
												picture: $root,
												name: 'Seva Call - Tell us what and when, we\'ll find the professionals!',
												caption: 'http://www.sevacall.com',
												description: 'Seva Call works to find local businesses that can help you with your service need instantly, like a free personal concierge service. Within minutes you will be connected to providers that can service your specific problem, on your schedule, at your location.;',
												actions: [
													{ name: 'text', link: $root }
												]
											};
											$("body").delegate(".facebook-final", "click", function( e ) {
												$("#fastclick").removeClass("GPUAccel"); // fixes problem where the facebook icon is underneath the page
												FB.getLoginStatus(function(response) {
													if (response.status === 'connected') {
														FB.ui(
															feedObj,
															function(response) {
																if (response && response.post_id) {
																	TRACK("STEP4_SCREEN_FACEBOOK_SHARE_COMPLETED");
																}
																else {
																	TRACK("STEP4_SCREEN_FACEBOOK_SHARE_CANCELLED");
																}
															}
														);
													}
													else{
														FB.login(function(response) {
															if (response.authResponse) {
																TRACK("STEP4_SCREEN_FACEBOOK_LOGIN_COMPLETED");
																FB.ui(
																	feedObj,
																	function(response) {
																		if (response && response.post_id) {
																			TRACK("STEP4_SCREEN_FACEBOOK_SHARE_COMPLETED");
																		}
																		else {
																			TRACK("STEP4_SCREEN_FACEBOOK_SHARE_CANCELLED");
																		}
																	}
																);
															} else {
																TRACK("STEP4_SCREEN_FACEBOOK_LOGIN_CANCELLED");
															}
														}, true);
													}
												});
											});
										};
									}
								},
					
			initializeTwitter:	function() {
									var self = this;
									if(!self.twitterInitialized && (self.twitterInitialized = true)) {
										// load the twitter api so we can tell if the user ended up tweeting something
										//
										window.twttr = (function (d,s,id) {
											var t, js, fjs = d.getElementsByTagName(s)[0];
											if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
											js.src="https://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
											return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
										}(document, "script", "twitter-wjs"));
										twttr.ready(function() {
											twttr.events.bind('click', function(){
												// tracked during bindSocialButtons TRACK("SETTINGS_SCREEN_TWITTER_SHARE_BUTTON_PRESSED");
											});
											twttr.events.bind('tweet', function (event) {
												TRACK("SETTINGS_SCREEN_TWITTER_SHARE_COMPLETED");
											});
										});
										function bindTwitterClick() {
											$("#twtShareLink").attr("target", "_blank");
											var twturl="https://twitter.com/intent/tweet?url="+encodeURIComponent("http://www.sevacall.com") + "&text=" + encodeURIComponent(TWITTER_MESSAGE) + "#phonegap=external";
											document.getElementById("twtShareLink").href = twturl;
										}
										$("body").delegate("#twtShareLink", "click", function(){
											bindTwitterClick();
										});
										return true;
									}
								},
								
			popupWindow		:	function(url, title, w, h) {
									// the twitter presets wont work for twitter intents here. 
									//
									
									// if not set, define presets:url = twturl="https://twitter.com/intent/tweet?url=" + encodeURIComponent(url);
									var url = url || "",
									
									title = title || "sevacall", 
									w = w || 500, 
									h = h || 260;
									
									wLeft = window.screenLeft ? window.screenLeft : window.screenX;
									wTop = window.screenTop ? window.screenTop : window.screenY;

									var left = wLeft + (window.innerWidth / 2) - (w / 2);
									var top = wTop + (window.innerHeight / 2) - (h / 2);
                					console.log("* Opening Popup *");
									return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
								},
								
			preloadVideo	:	function() {
									var self = this;
									self.video = $("<iframe src='http://player.vimeo.com/video/41472479?byline=0&amp;portrait=0&amp;color=ff9933&api=1'>").css({"width" : "100%", "border" : "2px solid #aaa", "position" : "absolute", "height" : "100%", "top" : "-200%", "opacity" : "0.1"}).appendTo(document.body);
									
								},
            
			pageSnapAnimate :	function() {
									//if(!window.location.hash) {
										// /Mobile/.test(navigator.userAgent) && !location.hash && 
										setTimeout(function () {
											$("body").animate({ scrollTop: 1 }, 400);
										}, 1);
									//}
									
            					},
            
			pageSnap		:	function( initialSnap ) {
										setTimeout( function(){
											pageSnap();
										}, 25);
								},
            
			updateGeoPosition : function( callback ) {
									var self = this;
									TRACK("STEP1_LOCATE_BUTTON_PRESSED");
                					//verifyInternet(function(){ // I have removed the verify internet feature here for now as it was not working
									// what would happen was, we would get all the way down to the geocoder.geocode()... and nothing would happen, it would never fire.
                                        self.activateSpinner();
                                        $(".where-text").val("");
                                        
                                        navigator.geolocation.getCurrentPosition(
                                            function( position ){
                                            	try {
													if (typeof google === 'object' && typeof google.maps === 'object') {
														TRACK("LOCATION_PERMISSION_GRANTED");
														var lat = position.coords.latitude;
														var lng = position.coords.longitude;
														var geocoder = new google.maps.Geocoder();
														var latlng = new google.maps.LatLng(lat, lng);
														
														geocoder.geocode({'latLng': latlng}, function(results, status) {
															if (status == google.maps.GeocoderStatus.OK) {
																var address = results[0].address_components;
																var newzip = address[address.length - 1].long_name;
																console.log("Geolocated to zipcode: " + newzip);
																
																self.deactivateSpinner();
																
																// match five digits
																//
																var matches = newzip.match(/\b\d{5}\b/g);
																if ( !(matches && matches.length >= 1)) {
																	TRACK("REVERSE_GEOCODING_DELEGATE_FAILED");
																	new xAlert("Unable to obtain location");
																}
																else {
																	self.where = newzip;
																	$(".where-text").val(self.where);
																	TRACK("REVERSE_GEOCODING_DELEGATE_SUCCESS");
																}
																
																if(callback)
																	callback();
															}
															else {
																TRACK("REVERSE_GEOCODING_DELEGATE_FAILED");
																self.deactivateSpinner();
																new xAlert("Unable to obtain location");
																console.log(results);
															}
														});
													}
													else {
														new xAlert("internet fail");
													}
                                                }
                                                catch(err) {
                                                    self.deactivateSpinner(); //failed here
                                                   	new xAlert("Could not obtain location");
                                                }
                                            },
                                            function( position ) {
												/*
												// This is a secondary API to grab location if the location services fails. 
												// I have commented it out because we have decided not to offer this functionality
												// This causes more confusion than it might otherwise solve.
                                                if(position.code == position.PERMISSION_DENIED)
                                                    TRACK("LOCATION_PERMISSION_DENIED");
                                                var selfCopy = self;
                                                $.getJSON(
                                                    "http://api.ipinfodb.com/v3/ip-city/?key=d339b41f11b65900658c0747d33c6c072241ffb2cb4c1c94d83430cdc310172f&format=json&callback=?",
                                                    function( data ) {
                                                        if( data.zipCode ) {
                                                            self.deactivateSpinner();
                                                            selfCopy.where = data.zipCode;
                                                            $(".where-text").val(self.where);
                                                        }
                                                        else {
												*/
                                                            self.deactivateSpinner();
                                                            new xAlert("Could not obtain location, check that your location permissions are enabled and try again");
                                                /*        }
                                                    }
                                                );
												*/
                                            },
                                            {	
                                                maximumAge:60000, 
                                                timeout:2000, 
                                                enableHighAccuracy:true
                                            }
                                        );
                                   // }, 1);

								},
								
			setOverlay 	: 		function() {
									var self = this;
					
									if(typeof(self.overlay == "undefined")){
										self.overlay = document.createElement("div");
										self.overlay.className = "spinner-overlay";
									
										// create semi-white overlay when transitioning
										//
										var bg =  "background: rgba(255, 255, 255, 0.5); pointer-events:none;";
										self.overlay.setAttribute("style", bg);
										document.getElementsByTagName('body')[0].appendChild(self.overlay);
									}
								},		
								
			disableScrolling : function() {
                					document.body.addEventListener("touchmove", this.cancelTouchMove);
            					},
            
            enableScrolling : function() {
               			 			document.body.removeEventListener('touchmove', this.cancelTouchMove);
            					},
            
			activateSpinner:	function() {
									var self = this;
                					if(!self.overlay){
                                        $("#ajaxLoader").show();
										self.deactivateButtons();
                                        self.setOverlay();
                                        self.disableScrolling();
                                    }
								},
			
			deactivateSpinner:	function(){
									var self = this;
									$("#ajaxLoader").hide();
                
                                    if(self.overlay) {
                                    	document.body.removeChild(self.overlay);
                                    	self.overlay = null;
                                    }
									self.activateButtons();
                					self.enableScrolling();
								},
								
			getInfoBoxDimensions: function( content ) {
									var sensor = $("<div>").html(content);
									$(sensor).appendTo("body").css({"position" : "absolute", "left" : "-900px"});
									var width = $(sensor).width();
									var height = $(sensor).height();
									$(sensor).remove();
									return new Array(width, height);
								},
								
			drawMap	:			function( mapLoadedCallback ) {
									var self = this;
									console.log("                    +++ Drawing Map +++                     ");
                
                					self.getLatLongByZip( function() {
                                        var mapOptions = {
                                                            center		: self.latLong,
                                                            zoom		: 12,
                                                            mapTypeId	: google.maps.MapTypeId.ROADMAP,
                                                            disableDefaultUI: true
                                                        };
                                                        
										try {
											self.googleMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
										}
										catch(err) {
											TRACK("STEP3_MAP_LOADING_FAILED");
										}          
										try {
                                            google.maps.event.addListenerOnce(self.googleMap, 'idle', function(){
                                                TRACK("STEP3_MAP_LOADING_SUCCESS");
                                                self.setCompanyMarkers();
                                                if(mapLoadedCallback)
                                                    mapLoadedCallback();
                                            });
                                        }
                                        catch(err) {
                                        	console.log("Error: " + err);
                                        }
                                    });
								},
			

			mapFitBounds : 	function() {
								var self = this;
									
								self.LatLngList = new Array();
								self.bounds = new google.maps.LatLngBounds();
								/*
								var newLatLng = new google.maps.LatLng(0,0);
								var newLatLng2 = new google.maps.LatLng(10, 10);
								self.bounds.extend(newLatLng);
								self.bounds.extend(newLatLng2);
								self.googleMap.fitBounds(self.bounds);
								google.maps.event.trigger(self.googleMap, "resize");
								*/
								for(var p in self.companies) {
									console.log(self.companies[p]);
									var newLatLng = new google.maps.LatLng(self.companies[p].lat, self.companies[p].lon);
									self.LatLngList.push( newLatLng );
									self.bounds.extend( newLatLng );
								}
								self.googleMap.fitBounds(self.bounds);
								
								//google.maps.event.trigger(self.googleMap, 'resize');
								//google.maps.event.notify(self.googleMap, 'mapTypeId');
								//}, 3000);
							},
			
			setInfoBox	:		function( companyObj ) {
									var self = this;
									console.log("                    +++ Setting InfoBox for: " + companyObj.name + " +++                     ");
									var icon = "";
									var companyName = companyObj.name;
									var companyStatus = companyObj.status;
									var nameOrStatus = companyObj.name;
									var shortAddrOrLongAddr = companyObj.city + ", " + companyObj.state;
									console.log("--OPENING InfoBox ( set with status: " + companyObj.status + " ) ");
									
									if(companyObj.status == "none") {
										/*
										var firstRow = '<div class="SCMapInfoBox-status">\
														' + companyName + '\
														</div>';
										*/
										var secondRow = "";
									}
									else {
										/*
										var firstRow = '<div class="SCMapInfoBox-status">\
														' + companyStatus + '\
														</div>';
										*/
										var secondRow = "<div class='SCMapInfoBox-company'>" + companyName + "</div>";
									}
									if(companyObj.status != "none"){
										icon = 	'			<div class="SCMapInfoBox-icon ' + companyObj.status.toLowerCase().replace(" ", "") + '">	';
										icon += '			</div>';
										nameOrStatus = companyObj.status;
										//shortAddrOrLongAddr = companyObj.city + ", " + companyObj.state;
									}
									else {
										nameOrStatus = companyObj.name;
										//shortAddrOrLongAddr = companyObj.city + ", " + companyObj.state;
									}
									
									var infoBoxContent = '\
									<table class="SCMapInfoBox clearfix">\
										<tbody>\
											<tr>\
												<td>\
													' + icon + '\
												</td>\
												<td>\
													<div class="SCMapInfoBox-status">\
														' + nameOrStatus + '\
													</div>\
													' + secondRow + '\
													<div class="SCMapInfoBox-location">\
														' + shortAddrOrLongAddr + '\
													</div>\
												</td>\
											</tr>\
										</tbody>\
									</table>\
									';
									var infoBoxDimensions = self.getInfoBoxDimensions(infoBoxContent);
									var infoBoxWidth = infoBoxDimensions[0];
									var infoBoxHeight = infoBoxDimensions[1];
									
									var infoBoxOffset = (104 - ((infoBoxWidth) / 2));
									
									//infoBoxContent = ' <div style="background:white;"><div style="background:white;"> Rajs fast plumbing services</div></div><div  style="background:blue; color:white"> washington DC </div> ';
									self.infoBox.setOptions({
												disableAutoPan : true,
												boxStyle				: {
																			"whiteSpace" : "nowrap"
																		  },
												content					: infoBoxContent,
												zIndex					: null,
												pixelOffset : new google.maps.Size(infoBoxOffset, -115),
												infoBoxClearance		: new google.maps.Size(-80,50),
												isHidden				: false,
												enableEventPropagation	: false
									
									});
									
									
									self.infoBox.open(self.googleMap, companyObj.marker);
									var loc  = self.infoBox.getPosition();


									google.maps.Map.prototype.panToWithOffset = function(latlng, offsetX, offsetY) {
										var map = this;
										var ov = new google.maps.OverlayView();
										ov.onAdd = function() {
											var proj = this.getProjection();
											var aPoint = proj.fromLatLngToContainerPixel(latlng);
											aPoint.x = aPoint.x+offsetX;
											aPoint.y = aPoint.y+offsetY;
											map.panTo(proj.fromContainerPixelToLatLng(aPoint));
										}; 
										ov.draw = function() {}; 
										ov.setMap(this); 
									};
									self.googleMap.panToWithOffset(loc, 0, -30);
								},
							
			setCompanyMarkers:	function( callback ) {
									var self = this;
									self.infoBox = new InfoBox();
									
									
									for( var p in self.companies ) {
										console.log("     setting marker for company: " + self.companies[p].name + " at " + self.companies[p].lat + ", " + self.companies[p].lon);
										
										self.companies[p].marker = new xMarker(new google.maps.LatLng(self.companies[p].lat, self.companies[p].lon), self.googleMap, self.companies[p], self.companies[p].markerNumber); 
										google.maps.event.addListener(self.companies[p].marker, "click", function() {
											self.setInfoBox(this.company);
										});
									}
									
									self.mapFitBounds();
									document.addEventListener("click", function() {
										self.infoBox.close();
									
									}, true);
                
                					if(callback)
                                    	callback();
                
								},
								
			addRadialBackground: function(transitionBox) {
									this.radialBackground = true;
									console.log("                    +++ Adding Radial Background +++                     ");
									//cross-browser/phone solution must use browser/phone width to set the radiality.
									transitionBox.css({"background-image" : "-webkit-gradient(radial, 50% 50%, 0, 50% 50%, " + window.screen.width + ", color-stop(0%, rgb(60, 100, 168)), color-stop(95%, rgb(0, 53, 97)))"});
								},
								
			removeRadialBackground: function() {	
									this.radialBackground = false;
									console.log("                    +++ Removing Radial Background +++                     ");
									$("#MAIN-TRANSITION").css({"background-image" : "", "overflow" : "hidden"});
									$("#MAIN").css({"background-image" : "", "overflow" : "hidden"});
								},
								
			requestCompleted:	function( callsSaved ) {
									var self = this;
									self.requestComplete = true;
									console.log("                    +++ Request Completed +++                     ");
									self.deactivateLoader();
									$(self.requestPing).remove();
									
									var pageNext = self.p.map.forward;
									
									if(!omitFinalPage) {
										self.changePage("final.php", "forward", function(){
											//self.addRadialBackground();
											console.log("Setting num calls to : " + self.numCallsSaved);
											$(".calls-saved-num").text(self.numCallsSaved);
										}, function(){
                                        	if(isPhoneGap && self.localStorage.getSubmitCount() > 0) {
                                        		console.log("asking to review the app");
                                                self.reviewAppAlert();
                                            }
                                            else {
                                            	console.log("Not asking to review the app");
                                            }
                                        });
									}
									
								},
								
			updateCompanyStatus:function( companyID ) {
									var self = this;
									if(self.companies[companyID]){
										var oldCompanyStatus = self.companies[companyID]["status"];
										var liveCompanyStatus = self.liveStatus[companyID]["status"];
										if(oldCompanyStatus != liveCompanyStatus) {
											
											
											console.log("Adding: " + self.companies[companyID]["name"] + " : " + self.liveStatus[companyID]["status"] + " to the status throttle");
											
											var companyDeepCopy = jQuery.extend(true, {}, self.companies[companyID]);
											companyDeepCopy.status = liveCompanyStatus;
											self.statusThrottle.push(companyDeepCopy);
										}
									}
									else {
										// Request is completed, the companyID attr was actually just a savedCalls number
										//
										var numSavedCalls = companyID;
										self.statusThrottle.push(numSavedCalls);
									}
									
								},
									
			activateTable		:	function( tableObj ) {
										$(".calling-companies-placeholder").remove();
										if(tableObj.jquery) {
											$(tableObj).css({"visibility" : "visible", "display" : "block"});
										}
										else if(tableObj.nodeType) {
											tableObj.style.visibility = "visible";
											tableObj.style.display = "block";
										}
								},
									
			getCompanyRating:		function( company, callback ) {
										var api_yelp =encodeURI($root + 'api/mobile/v2/getRating.php?source=yelp&companyName=' + company.name + '&companyZipcode=' + company.zip + '&companyPhone=' + company.phone);
										var api_citysearch =encodeURI($root + 'api/mobile/v2/getRating.php?source=citysearch&companyName='+company.name+'&companyZipcode=' + company.zip + '&companyPhone=' + company.phone);
										var api_yahoo =encodeURI($root + 'api/mobile/v2/getRating.php?source=yahoo&companyName=' + company.name + '&companyZipcode=' + company.zip + '&companyPhone=' + company.phone);
										
										console.log("Yelp Ratings Ping for " + company.name + " : " + api_yelp );
										console.log("CitySearch Ratings Ping for " + company.name + " : " + api_citysearch );
										console.log("Yelp Ratings Ping for " + company.name + " : " + api_yahoo );
										
										$.SCAjax(api_yelp, function(data) {
											console.log("    Yelp Data for " + company.name + " : " +  data);
											var resultNodes = data.split("|");
											company.ratingYelp = (resultNodes[0] > 0) ? resultNodes[0] : company.ratingYelp;
											company.numRatingsYelp = (resultNodes[1] > 0) ? resultNodes[1] : company.numRatingsYelp;
											company.linkYelp = (resultNodes[2]) ? resultNodes[2] : "";
											
											$.SCAjax(api_citysearch, function(data) {
												console.log("    Citysearch Data for " + company.name + " : " +  data);
												var resultNodes = data.split("|");
												company.ratingCitysearch = (resultNodes[0] > 0) ? resultNodes[0] : company.ratingCitysearch;
												company.numRatingsCitysearch = (resultNodes[1] > 0) ? resultNodes[1] : company.numRatingsCitysearch;
												company.linkCitysearch = (resultNodes[2]) ? resultNodes[2] : "";
												
												$.SCAjax(api_yahoo, function(data) {
													TRACK("STEP3_COMPANY_RATING_API_SUCCESS");
													console.log("    Yahoo Data for " + company.name + " : " +  data);
													var resultNodes = data.split("|");
													company.ratingYahoo = (resultNodes[0] > 0) ? resultNodes[0] : company.ratingYahoo;
													company.numRatingsYahoo = (resultNodes[1] > 0) ? resultNodes[1] : company.numRatingsYahoo;
													company.linkYahoo = (resultNodes[2]) ? resultNodes[2] : "";
													
													if( callback ) 
														callback();
												});
											});
										}, 
										function(){
											TRACK("STEP3_COMPANY_RATING_API_FAILURE");
										});
									},
									
			companyStatusAccepted: 	function( company ) {
										var self = this;
										var companyRatingColumnYahoo = $("<td>").attr("class", "company-rating-column-yahoo");
										var companyRatingColumnCitysearch = $("<td>").attr("class", "company-rating-column-citysearch");
										var companyRatingColumnYelp = $("<td>").attr("class", "company-rating-column-yelp");
										
										var companyRatingYahoo = $("<div>").attr("class", "company-rating-yahoo");
										var companyRatingCitysearch = $("<div>").attr("class", "company-rating-citysearch");
										var companyRatingYelp = $("<div>").attr("class", "company-rating-yelp");
										
										var companyRatingYahooText = $("<div>").attr("class", "company-rating-yahoo-text");
										var companyRatingCitysearchText = $("<div>").attr("class", "company-rating-citysearch-text");
										var companyRatingYelpText = $("<div>").attr("class", "company-rating-yelp-text");
										
										var companyNameColumn = $("<td>").attr("class", "company-name-column");
										var companyName = $("<div>").attr("class", "company-name").text(company.name);
										var companyLocation = $("<div>").attr("class", "company-location").text(company.city + ", " + company.state);
										
										var companyMarkerColumn = $("<td>").attr("class", "company-marker-column").append($("<div>").attr("rel", company.markerNumber));
										
										$(companyRatingColumnYahoo).append($(companyRatingYahoo)).append($(companyRatingYahooText));
										$(companyRatingColumnCitysearch).append($(companyRatingCitysearch)).append($(companyRatingCitysearchText));
										$(companyRatingColumnYelp).append($(companyRatingYelp)).append($(companyRatingYelpText));
										
										$(companyNameColumn).append($(companyName));
										$(companyNameColumn).append($(companyLocation));
										
										var newRow = $("<tr>");
										newRow.append($(companyMarkerColumn));
										newRow.append($(companyNameColumn));
										newRow.append($(companyRatingColumnYelp));
										newRow.append($(companyRatingColumnCitysearch));
										newRow.append($(companyRatingColumnYahoo));
										
										var starOffsetYelp = -4.25 + company.ratingYelp * 12.5;
										var starOffsetCitysearch = -4.25 + company.ratingCitysearch * 12.5;
										var starOffsetYahoo = -4.25 + company.ratingYahoo * 12.5;
										
										
										if(company.ratingYelp > 0 ) {
											$(companyRatingYelp).css({"display" : "block", "background-position" : "center " + starOffsetYelp + "%"});
											$(companyRatingYelpText).text(company.numRatingsYelp + " Ratings");
										}
										else {
											$(companyRatingYelpText).text("n/a").addClass("deactive");
										}
										
										if(company.ratingCitysearch > 0 ) {
											$(companyRatingCitysearch).css({"display" : "block", "background-position" : "center " + starOffsetCitysearch + "%"});
											$(companyRatingCitysearchText).text(company.numRatingsCitysearch + " Ratings");
										}
										else {
											$(companyRatingCitysearchText).text("n/a").addClass("deactive");
										}
										
										if(company.ratingYahoo > 0 ) {
											$(companyRatingYahoo).css({"display" : "block", "background-position" : "center " + starOffsetYahoo + "%"});
											$(companyRatingYahooText).text(company.numRatingsYahoo + " Ratings");
										}
										else {
											$(companyRatingYahooText).text("n/a").addClass("deactive");
										}
										
										self.activateTable($(".table-one"));
										self.ratingsActive = true; // for use when checking after the back button has been pressed if we need this
										
										self.mapTableOne.push(newRow.html());
										
										$(".table-one table tbody tr:first").after(newRow);
			
									},
									
			appendExistingStatuses: function() {
										var self = this;
										console.log(self.mapTableOne);
										for(var i = 0; i < self.mapTableOne.length; i++) {
											//console.log("APPENDING: " + self.mapTableOne[i]);
											$(".table-one table tbody tr:first").after($("<tr>").html(self.mapTableOne[i]));
										}
										for(var i = 0; i < self.mapTableTwo.length; i++) {
											console.log("PREPENDING: " + self.mapTableTwo[i]);
											$(".table-two table tbody").prepend($("<tr>").html(self.mapTableTwo[i]));
										}
									},
									
			throttleStatusPaint: function( company ) {
									var self = this;
									/*
									var myTable = document.getElementById('tableTwo'),
										tbody = myTable.tbodies[0],
										tr = tbody.insertRow(-1)  // puts it at the start
									;*/
									
									var tbody = document.getElementById('tableTwoBody');
									var tr = document.createElement("tr");
									 
									// class to give the status image
									//
									var iconStatusClass = company.status.toLowerCase().replace(" ", "");
									
									self.companies[company.id].status = company.status;
									var rawCompanyObject = self.companies[company.id];
									
									/*
									// build table cells the jQuery/DOM way (commented)
									//
									var companyMarkerColumn = $("<td>").attr("class", "company-marker-column");
									var companyMarker = $("<div>").attr("rel", company.markerNumber);
									var companyNameColumn = $("<td>").attr("class", "company-name-column");
									var companyName = $("<div>").attr("class", "company-name");
									var companyLocation = $("<div>").attr("class", "company-location"); 
									var companyStatusColumn = $("<td>").attr("class", "company-status-column");
									var companyStatusIconColumn = $("<td>").attr("class", "company-status-icon-column "+iconStatusClass+"");
									var newRow = $("<tr>");
									*/
									var innerHTMLString = "		<td class='company-marker-column'><div  rel='" + company.markerNumber + "'>&nbsp;</div></td>";
									innerHTMLString	+=	"		<td class='company-name-column'>";
									innerHTMLString +=	"		<div class='company-status-column'>";
									innerHTMLString +=			company.status;
									innerHTMLString +=	"		</div>";
									innerHTMLString +=	"		<div class='company-name' >" + company.name + "<br/></div>	";
									innerHTMLString +=	"		<div class='company-location' >" + company.city + ", " + company.state + "</div>	";
									innerHTMLString +=	"		</td>";
									innerHTMLString +=	"		<td class='company-status-icon-column " + iconStatusClass + "'>";
									innerHTMLString +=	"		</td>";
									
									//var testing = document.createElement("tr"); 
									//testing.innerHTML =  innerHTMLString;
									tr.innerHTML = innerHTMLString;
									
									self.mapTableTwo.push(innerHTMLString);
									
									tbody.insertBefore(tr, tbody.firstChild);
									self.activateTable($(".table-two"));
									$(".calling-companies-placeholder").remove();
									
									var objDiv = document.getElementById("tableTwoBody");
									/*
									// company marker and number
									//
									$(companyMarkerColumn).append($(companyMarker));
									
									
									// Company Name and Location
									//
									$(companyNameColumn).append($(companyName)).append($(companyLocation));
									$(companyName).text(company.name);
									$(companyLocation).text(company.city + ", " + company.state);
									$(companyStatusColumn).text(company.status);
									
									// build row
									//
									console.log("Painting: " + company.name + " : " + company.status);
									
									self.activateTable($(".table-two"));
									
									// append to the top of the table
									//
									$(newRow).append($(companyMarkerColumn));
									$(newRow).append($(companyNameColumn));
									$(newRow).append($(companyStatusColumn)[0].innerHTML= "???");
									$(newRow).append($(companyStatusIconColumn));
									$("#MAIN-TRANSITION").innerHTML = "???";
									$(".table-two table tbody")[0].insertBefore($("<div> ??? </div>")[0], $(".table-two table tbody")[0].firstChild);//.append(newRow);
									*/
									
									/*
									var tbody = document.getElementById("tableTwoBody");
									var firstChild = tbody.firstChild;
									tbody.insertBefore(testing, firstChild);
									*/
									
                                    self.setInfoBox(company);
									//self.infoBox.open(self.googleMap, company.marker);
									
									if(company.status == "Accepted") {
										self.getCompanyRating(company, function() {
											self.companyStatusAccepted(company);
										});
									}
									
									if(company.status == "Calling") {
										self.numCallsSaved++;
										console.log(  " * Num Calls Saved Increasing: * " + self.numCallsSaved);
									}
									
									if(company.status == "Accepted") {
										self.numCallsSaved--;
										console.log(  " * Num Calls Saved Decreasing: * " + self.numCallsSaved);
									}

								},
								
			activateLoader:	function() {
								var self = this;
								var headerButton2 = $(".header-button-right");
								$(headerButton2).addClass("active");
							},
							
			deactivateLoader: function() {
								var self = this;
								var headerButton2 = $(".header-button-right");
								$(headerButton2).removeClass("active");
							},
							
			throttleStatus: function( index ) {
									var self = this;
									var index = index ? index : 0;
									var throttle = self.statusThrottle;
									
									if(index == 0)
										console.log("**Begin Throttle Status**");
									
									if(throttle[index]) {
										
										// Request Completed
										//
										if( /^[\d]+$/.test(throttle[index])){
											console.log("Request throttle status has returned a digit, we are completing the request");
											self.requestCompleted();
											return;
										}
										// traversing through the throttle
										//
										console.log("Building row for: " + throttle[index]["name"] + " with status: " + throttle[index]["status"]);
										self.throttleStatusPaint(throttle[index]);
                                        console.log("after building row");
											setTimeout(function() {
												self.throttleStatus(++index);
											}, 1000);
									}
									
									else {
										// empty throttle and check for new statuses every 1 second
										//
										console.warn("Throttle is empty, going to check liveRequestStatus Again");
										self.statusThrottle = [];
										
										if(!self.requestTimedOut) {
											setTimeout(function() {
												if(self.liveRequestStatusComplete)
													self.liveRequestStatus();
												else 
													self.throttleStatus(index)
											}, 2000);
										}
									}
									
								},
            
			testSubmit	:	function() {
								var self = this;
								self.requestID = "87275";
								self.where = "20854";
								self.description = "I am testing sevacall to see if it works for me";
								
								IV.name = "augie";
								IV.email = "testing@testing.com";
								IV.phone = "3017047437";
								
								IV.isNameValid = true;
								IV.isEmailValid = true;
								IV.isPhoneValid = true;
								if( self.validateInformation() ) {
                                	// save last request location, going to omit this for testing
                                    //
                                	//self.localStorage.setLocation(self.where);
                                    self.submitRequest();
									self.getCompanyList(function(){
										self.options.drawMap = false;
										self.changePage("step3.php", "forward", function() {
                                            self.activateLoader();
                                            self.drawMap( function(){self.liveRequestStatus();} );
										});
									});
								}
								else {
									alert("fail");
								}
								return true;
							},
							
			actionStep1 : 	function( e ) {
									var self = this;
									TRACK("STEP1_NEXT_BUTTON_PRESSED");
									self.activateSpinner();
									self.deactivateButtons();
									
									var site = encodeURI($root + 'api/mobile/v2/searchAction1.php?search_location='+self.where+'&category_short='+self.what+'');
								
									if(testing) {
										self.testSubmit();
										return false;
									}
									
									$.SCAjax(site, function(data) {
										console.log("Request Category: " + self.what + ", Request Location: " + self.where + ", URL: " + site + ", status: " + data);
										
										var invalidRequestNumber = function(){
											TRACK("STEP1_SERVICE_SEARCH_DELEGATE_FAILED");
											if(data == "Invalid Service Category")
												TRACK("STEP1_INVALID_CATEGORY_NOTIFICATION");
											else if(data == "Invalid Location");
												TRACK("STEP1_INVALID_LOCATION_NOTIFICATION");
											self.deactivateSpinner();
											self.activateButtons();
											new xAlert(data);
											return false;
										}
										
										var validRequestNumber = function() {
											TRACK("STEP1_SERVICE_SEARCH_DELEGATE_SUCCESS");
											self.requestID = data.split("|")[1];
											console.log("Set our current requestID to: " +self.requestID);
											// have to do this inside the ajax call since it is asynchronous
											//
											self.changePage("step2.php", "forward");
											return true;
										}
										
										return (data.indexOf("|") == -1) ? invalidRequestNumber() : validRequestNumber(); 											
									});
									
								},
								
			getCompanyList:		function( callback ) {
									var self = this;
									var site =encodeURI($root + 'api/mobile/v2/getCompaniesList.php?requestID='+self.requestID);
									
									$.SCAjax(site, function(data) {
										TRACK("NOTIFY_COMPANY_LIST_SUCCESS");
										var companyNodes = data.split("|");
										console.log("Retrieved " + ((companyNodes.length)-1) + " companies in the CompanyList:");
										for(var i = 0; i < companyNodes.length-1; i++) {
											companyAttrs = companyNodes[i].split("^~^");
											self.companies[companyAttrs[0]] = new Object({ 
												name : companyAttrs[1], 
												id : companyAttrs[0], 
												lat : companyAttrs[2],
												lon : companyAttrs[3], 
												addr : companyAttrs[4], 
												city : companyAttrs[5].capitalize(), 
												state : companyAttrs[6], 
												zip : companyAttrs[7],
												phone : companyAttrs[8],
												markerNumber : (i+1),
												status : "none",
												marker : new Object(),
												infoBox : new Object(),
												infoBoxEvent : function(){ },
												ratingYelp	:	0,
												numRatingsYelp : "",
												ratingCitysearch	:	0,
												numRatingsCitysearch : "",
												ratingYahoo	:	0,
												numRatingsYahoo : ""
											});
											console.log("     " + self.companies[companyAttrs[0]]["id"] + ", " + self.companies[companyAttrs[0]]["name"] + ", " + self.companies[companyAttrs[0]]["lat"] + ", " + self.companies[companyAttrs[0]]["lon"] + ", " + self.companies[companyAttrs[0]]["addr"] + ", " + self.companies[companyAttrs[0]]["city"] + ", " + self.companies[companyAttrs[0]]["state"] + ", " + self.companies[companyAttrs[0]]["zip"] + ", " + self.companies[companyAttrs[0]]["phone"] + ", " + self.companies[companyAttrs[0]]["status"]);
											
											self.companiesArray[i] = self.companies[companyAttrs[0]];
										}
										if(callback)
											callback();
									}, function(){
										TRACK("NOTIFY_COMPANY_LIST_FAILED");
									});
								},
								
			actionStep2 :		function( e ) {
									TRACK("STEP2_CALL_COMPANIES_BUTTON_PRESSED");
									var self = this;
									if(! (self.validateTimes( e ) && self.validateDescription( e ))){
										return false;
									}
									TT.postify();
									self.deactivateButtons();
									
                                    self.getCompanyList(function(){
                                        self.getLatLongByZip();
                                    });
                
                					if(isPhoneGap && self.localStorage.full()) {
                                   		//alert("'" + self.localStorage.getName() + "'" + " '" + self.localStorage.getEmail() + "' " + " '" + self.localStorage.getPhone() + "'");
                                    	console.log("skipping to step 2a because we have details already");
                                    	self.actionStep2a();
                                        return false;
                                    }
                   					else {
                                    	console.log("Step 2 setting local storage");
                                    	self.setLocalStorage();
                                    }
                					console.log("after setting local storage in step 2");
                
                					if(IV.isEmailValid && IV.isNameValid && IV.isPhoneValid ) {
                                    	console.log("skipping to step 2a because we everything is valid");
                                    	self.actionStep2a();
                                        return false;
                                    }
                                    return true;
								},
            setLocalStorage : 	function() {
            						var self = this;
									//if(isPhoneGap) { // we're now using localstorage on browser mode as well!
										self.localStorage.setEmail(IV.email);
										self.localStorage.setName(IV.name);
										self.localStorage.setPhone(IV.phone);
									//}
            					},
            
			actionSettings :	function() {
            						var self = this;
            						if(self.validateInformation()) {
                                    	self.setLocalStorage();
										// NEW
										self.xBack();
										// OLD
                                        //self.pageBack();
                                    }
                					else
                                    	return false;
            					},
            
        	reviewAppAlert:		function() {
            						var self = this;
									// only show this for iPhones currently, until we get the other links submitted to the store
									//
									if(device.platform == "iPhone") {
										new xAlert("We hope you love Seva Call and how it saves you loads of time and hassle. Please let us and the rest of the world know how much it helped you. It won't take more than a minute. Thanks!",
										function(button) {
											if(button == 1) {
												self.localStorage.disableSubmitCount();
												//window.open(self.reviewLink);
												if(device.platform == "iPhone")
													window.open("itms-apps://itunes.apple.com");
												else if(device.platform == "Android") {
													// replace this with a link when android gets published
													window.open("itms-apps://itunes.apple.com");
												}
											}
											else if(button == 2) {
												self.localStorage.resetSubmitCount();
											}
											else if(button == 3) {
												self.localStorage.disableSubmitCount();
											}
										}, "Rate SevaCall",
										"Leave a Review,Remind Me Later,No Thanks"
										);
									}
            					},
            
            finalAlert :		function() {
            						var self = this;
                					new xAlert("Call companies now? You may receive up to three calls",
                                    	function( button ){
                                        	if(button == 2) {
												self.setLocalStorage();
												verifyInternet(function(){
													self.activateSpinner();
													self.deactivateButtons();
													self.submitRequest(); // moved flaggedTimeouts inside the change page function, to make sure for verifyInternet etc.
													TRACK(self.pC.page + "_CONFIRM_NOTIFICATION_YES");
													self.getCompanyList(function(){
														self.options.drawMap = false;
														self.changePage("step3.php", "forward", function() {
															// if no response after time period, notify user as to why
															self.requestFlaggedTimeout = setTimeout(function() {
																self.requestFlagged();
															}, 65000); // 65 seconds
															
															// if nor response after time period, stop pinging the DB for status updates
															self.requestTimeLimitTimeout = setTimeout(function() {
																self.requestTimeLimit();
															}, 3600000); // 15 minutes
															self.activateLoader();
															self.drawMap( function(){self.liveRequestStatus();} );
														});
													});
												});
                                            }
                                            else if(button == 1) {
                                            	TRACK(self.pC.page + "_CONFIRM_NOTIFICATION_NO");
                                                self.activateButtons();
                                            }
                                        },
                                        "",
                                        "Cancel,OK"
                                    );
            					},
            
			actionStep2a :		function( e ) {
									//TRACK("STEP2A_SAVE_INFO_BUTTON_PRESSED");
									var self = this;
									if( self.validateInformation() ) {
                                    	verifyInternet(function() {
											self.finalAlert();
										});
                                    }
									else{
										return false;
									}
									// do not change page after, we already handled that!
									return false;
								},
								
			getParamsToPostParams : function( _url ) {
										var vars = {}, hash;
										var hashes = _url.slice(_url.indexOf('?') + 1).split('&');

										for(var i = 0; i < hashes.length; i++)
										{
											hash = hashes[i].split('=');
											vars.push(hash[0]);
											vars[hash[0]] = hash[1];

										}

										return vars;
								},
								
			submitRequest:		function( callback ) {
									var self = this;
									IV.unMaskPhone();
									var firstThree = IV.phone.substring(0,3);
									var secondThree = IV.phone.substring(3,6);
									var lastFour = IV.phone.substring(6,10);
									this.mapTableOne = [];
									this.mapTableTwo = [];
									
									if(window.source) {
										TRACK("SUBMIT_FROM_" + window.source);
									}
									self.loadFacebook();
									self.initializeTwitter();
									if(isPhoneGap) {
										// increment submit count so that we may or may not remind you of leaving a review
										//
										self.localStorage.incrementSubmitCount();
										// set for future use only after submitting a request
										//
										self.localStorage.setLocation(self.where);
									}
									
                					var afterUpload = function() {
                                        var data_send = TT.postString + "&name="+IV.name+"&"+"email"+"="+IV.email+"&"+"phone1"+"="+firstThree+"&"+"phone2"+"="+secondThree+"&"+"phone3"+"="+lastFour+"&"+"description"+"="+self.description;
                                        
                                        var site = $root + 'api/mobile/v2/searchAction3.php?requestID='+self.requestID+'&demoNumber=3018764913'+data_send+'&boxType=get'+TT.postString;
                                        var data;
                                        
                                        console.log("***** Request Submitting. Submitting ping is: " + site + " *****");
                                        
                                        self.requestPing = $('<iframe />').attr('src', site).attr("name", "requestPing").attr('target', '_self').css({"width" : "1px", "height" : "1px", "position" : "absolute", "left" : "-900px"}).appendTo('body');
                                        
                                        if(callback) {
                                            callback();
                                        }
                                    };

									if(isPhoneGap && self.scr.recordingActive == 1) {
                                        self.description = DEFAULT_DESCRIPTION;
                                    	verifyInternet(function() {
                                        	self.scr.uploadVoice(function(){ afterUpload(); });
                                        });
                                    }
                					else
                                    	afterUpload();
                
								},
								
			requestFlagged	:	function() {
									new xAlert("To ensure the highest quality matches your request needs to be verified, which may take up to 15 minutes. If you need service right away please call us at 1-877-987-SEVA (7382)");
								},
								
			requestTimeLimit:	function() {
									var self = this;
									self.requestTimedOut = true;
									new xAlert("We're sorry, but your request was unsuccessful.  If you still need service you may try again, or call us at 1-877-987-SEVA (7382)");
								},
								
			liveRequestStatus:	function() {
									var self = this; 
									var site = encodeURI($root + 'api/mobile/v2/getRequestStatus.php?requestID='+self.requestID+'');
									
									console.log("Live Status API Ping is: " + site);
									
									$.SCAjax(site, function(data) {
										TRACK("STEP3_COMPANY_STATUS_API_SUCCESS");
										var pageNext = self.p.map.forward;
										var results = data;
										var statusNodes = results.split("|");
											
										// either a company status or "Request Completed" | 0 | "Completed"
										//
										for(var i = self.liveStatusIndex; i < statusNodes.length-1; i++) {
											clearTimeout(self.requestFlaggedTimeout);
											clearTimeout(self.requestTimeLimitTimeout);
											self.liveStatusIndex++;
											
											var statusAttrs = statusNodes[i].split("^~^");
											
											self.liveStatus[statusAttrs[1]] = new Object({
																							message : trimSpaces(statusAttrs[0]),
																							id		: statusAttrs[1],
																							status	: statusAttrs[2]
																						});
											
											console.log("LiveRequestStatus: " + self.liveStatus[statusAttrs[1]]["id"] + ", " + self.liveStatus[statusAttrs[1]]["message"] + ", " + self.liveStatus[statusAttrs[1]]["status"]);
											
											self.updateCompanyStatus(statusAttrs[1]);
										}
										self.throttleStatus();
										self.liveRequestStatusComplete = true;
                                    }, function(){
										self.liveRequestStatusComplete = true;
										self.throttleStatus();
										TRACK("STEP3_COMPANY_STATUS_API_FAILED");
									});
								},
            
			actionRecording :	function( e ) {
                                    var self = this;
                					console.log("actionRecording");
            						verifyInternet(function() {
                                    	//console.log("inside callback of actionrecording");
                                    	if(self.scr.state==2) {
                                        	console.log("recording state was 2");
                                            self.scr.deleteAlert(
                                            	function() {
                                                    if(self.scr.recordingActive == 0) {
                                                        self.scr.resetRecording();
                                                        self.xBack();
                                                        //self.pageBack();
                                                    }
                                                    else {
                                                        self.scr.resetRecording();
                                                        self.xBack();
                                                        //self.pageBack();
                                                    }
                                                    
                                                },
                                                function() {
                                                	return false;
                                            	}
                                            );
                                        }
                                        else {
                                        	console.log("going back");
                                            self.xBack();
                                        	//self.pageBack();
                                        }
                                    });
            
            					},
            
			actionTimetable :	function( e ) {
									var self = this;
									var pageNext = self.p.map.forward;
									self.processTimeTableSave();
									self.xBack();
									//self.changePage("step2.php", "back");
									//self.pageBack();
									return false;
								},
								
			getLatLongByZip : 	function( callback ) {
									var self = this;
									var geocoder = new google.maps.Geocoder();
									geocoder.geocode({ 'address': "20854" }, function( results, status ) {
										if ( status == google.maps.GeocoderStatus.OK ) {
											self.latLong = results[0].geometry.location;
                                            
                                            if(callback)
                                            	callback();
										}
									});
								},
								
			validateTimes	:	function( e ) {
									var self = this;
									console.log("validating times");
                                    if(self.timesAvailable.length > 0) {
                                    	console.log("Times: OK. they are: " + self.timesAvailable + " of length: " + self.timesAvailable.length);
										return true;
									}
									else {
										console.log("Times are not ok. they are: " + self.timesAvailable);
									}
									TRACK("STEP2_INVALID_TIME_NOTIFICATION");
                                    console.log("Alert : Please select a time");
									new xAlert("Please select a time");
									e.stopPropagation();
									e.preventDefault();
									return false;
								},
								
			validateInformation:function() {
									var self = this;
									var page = self.pC.page.replace(".php","");
                					if(self.localStorage.full()) {
                                    	return true; // the only way for the validation to be full is if it was successfully saved
                                    }
									if(!IV.isNameValid) {
										TRACK(page + "_INVALID_NAME_NOTIFICATION");
										new xAlert("Invalid Name");
										return false;
									}
									else if(!IV.isEmailValid) {
										TRACK(page + "_INVALID_EMAIL_NOTIFICATION");
										new xAlert("Invalid Email");
										return false;
									}
									else if(!IV.isPhoneValid) {
										TRACK(page + "_INVALID_PHONE_NUMBER_NOTIFICATION");
										new xAlert("Invalid Phone Number");
										return false;
									}
									return true;
								},
								
			validateWhat	:	function( e ) {
									var self = this;
									// a single word
									//
									var word = /\b[^\s]+\b/g;
									var matches = self.what.match(word);
									// match a single word
									//
									if(self.what == "none") {
										new xAlert("Invalid Service Category");
										return false;
									}
									return true;
								},
								
			validateWhere	:	function( e ) {
									var self = this;
									// five digits
									//
									var matches = self.where.match(/\b\d{5}\b/g);
									
									// match five digits
									//
									if ( matches && matches.length >= 1 ) {
										return true;
									}
									else {
										new xAlert("Invalid Zipcode");
										e.preventDefault();
										e.stopPropagation();
										return false
									}
								},
								
			validateDescription:function( e ) {
									var self = this;
                					// if recording saved, continue
                                    //
                                    console.log("Checking Description");
									if(isPhoneGap) {
										if(self.scr.recordingActive)
											return true;
									}
                
									// a single word
									//
									var word = /\b[^\s]+\b/g;
									if(document.getElementById("description-text").value != "" && document.getElementById("description-text").value != document.getElementById("description-text").getAttribute("rel")) {
										self.description = document.getElementById("description-text").value;
										if(self.description != "")
											var matches = self.description.match(word);
										
										// match 7 words
										//
										if ( matches && matches.length >= 7 && self.description != "Describe what you need help with in as much detail as possible...")
											return true;
									}
									else {
										TRACK("STEP2_DETAILS_TOO_SHORT_NOTIFICATION");
										new xAlert("Description must be at least 7 words");
										e.preventDefault();
										e.stopPropagation();
										return false;
									}
								},
								
			setVimeoActions :	function() {
									var self = this;
									if(!self.attachedVimeoActions && (self.attachedVimeoActions = true)) {
										// Listen for messages from the player
										if (window.addEventListener) {
											window.addEventListener('message', onMessageReceived, false);
										}
										else {
											window.attachEvent('onmessage', onMessageReceived, false);
										}

										// Handle messages received from the player
										function onMessageReceived(e) {
											var data = JSON.parse(e.data);
											
											switch (data.event) {
												case 'play':
													onPlay();
													break;
												case 'ready':
													onReady();
													break;
											}
										}

										// Helper function for sending a message to the player
										function post(action, value) {
											var data = { method: action };
											
											if (value) {
												data.value = value;
											}
											console.log(data);
											self.video[0].contentWindow.postMessage(JSON.stringify(data), self.video.attr("src"));
										}

										function onReady() {
											post('addEventListener', 'play');
										}
										function onPlay() {
											TRACK("INFORMATION_SCREEN_PLAY_VIDEO_BUTTON_PRESSED");
										}
									}
								},
								
			bindButtons 	: 	function() {
									var self = this;
									// delegate events to the main button click on each page
                                    // likely going to change pages
									//
									$("body").delegate("#actionbutton", "click", function( e ) {
										if((self.pC.page == "timetable.php" || self.pC.page == "step2.php") && TT.daysSelected.length == 0)
											self.timesAvailable.length = 0;
                                    	if(self.pC.page == "step2a.php")
                                        	TRACK("STEP2A_SAVE_BUTTON_PRESSED");
										var pageNext = self.p.map.forward;
                						// remove the keyboard
                                        //
                                        $('#actionbutton').focus();
                                        e.stopPropagation();
                                        e.preventDefault();
										if ( self.p.action(e) ) {
                                            self.changePage(pageNext, "forward");
                                            self.pageSnapAnimate();
                                        }
										else {
                                        	//console.log("action solved itself within its own method -- ajax calls handled async");
											return false;
										}
									});
									$("body").delegate(".info-icon", "click", function(){
										TRACK(self.pC.page.replace(".php", "") + "_INFO_BUTTON_PRESSED");
										var page = self.pC.page;
										
										self.changePage("information.php", "forward", function() {}, function(){
											// late callback appending the video so that the page doesn't transition choppily.
											/*
											$(".video-box").append(self.video);
											self.setVimeoActions();
											$(self.video).css({"top" : "0px"}).animate({
												opacity : 1
											}, 1500);
											*/
										});
									});
									
									$("body").delegate(".settings-icon", "click", function(){
										TRACK(self.pC.page.replace(".php", "") + "_SETTINGS_BUTTON_PRESSED");
										self.changePage("settings.php", "forward");
									});
									
									$("body").delegate(".header-button-left", "click", function(){
										self.processHB1Click();
									});
									
									$("body").delegate(".header-button-right", "click", function(){
										self.processHB2Click();
									});
									
									$("body").delegate("#description-button", "click", function(){
										self.changePage("recording.php", "forward");
									});
									
									$("body").delegate("#where-button", "click", function(){
										self.updateGeoPosition();
									});
									
									$("body").delegate("#timetable", "click", function(){
										self.changePage("timetable.php", "forward");
										// save the current days selected in order to process a CANCELLED timetable click after setting new values
										//
										TT.daysSelectedTemp = $.extend(true, [], TT.daysSelected);
									});
									
									$("body").delegate(".time-button", "click", function(){
										self.processTimeClick(this);
									});
                
									$("body").delegate("#info-phone_number, #info-email, #info-website", "click", function() {
										TRACK("INFORMATION_SCREEN_" + $(this).attr("id").replace("info-", "") + "_BUTTON_PRESSED");
									});
									/*
                                    $("body").delegate(".what-text", 'touchstart', function(){
                                        $("#what-text-overlay-fix").addClass("active");
                                    }).bind('touchend', function(){
                                        $("#what-text-overlay-fix").removeClass("active");
                                    });
									*/
								},
			
			toggleTimeAvailable :function( time ) {
									var self = this;
									
									// if another option is selected and we select one of the following, toggle the others off
									if(time == "now") {
										if(self.timesAvailable.indexOf("anytime") != -1) {
											self.timesAvailable.length = 0;
										}
									}
									
									if(time == "anytime") {
										if(self.timesAvailable.indexOf("now") != -1) {
											self.timesAvailable.length = 0;
										}
									}
									
									if(time.indexOf("timetable") != -1) {
										if(self.timesAvailable.indexOf("anytime") != -1) {
											self.timesAvailable.length = 0;
										}
									}
									
									// if the time is already in the array, delete it (toggle OFF)
									//
									if(self.timesAvailable.indexOf(time) != -1) {
										if(time == "timetable")
											TRACK("STEP2_PICKTIME_BUTTON_PRESSED");
										else
											TRACK("STEP2_" + time.toUpperCase() + "_BUTTON_DESELECTED");
											
										var index = self.timesAvailable.indexOf(time);
										self.timesAvailable.splice(time, 1);
										self.timesAvailable.filter(function (item) { return item != undefined }).join(); //reindex array
										return
									}
									else {
										if(time == "timetable")
											TRACK("STEP2_PICKTIME_BUTTON_PRESSED");
										self.timesAvailable.push(time);
									}
								
								},
								
			processTimeClick : 	function( timeButton ) {
									var self = this;
									var time = timeButton.id;
									
									if(time == "now" || time == "anytime") {
										TT.selectDate( timeButton );
									}
									
									if(time == "timetable") {
										$(".time-button").not($("#now")).removeClass("active").addClass("deactive");
										$(timeButton).toggleClass("deactive").toggleClass("active");
										// if there is a timetable time clicked, our time will be "timetable", don't toggle this time off, we're RETURNING to the timetable page, not deselecting it.
										if(self.timesAvailable == "timetable")
											return;
									}
									
									self.toggleTimeAvailable( time );
								
								},
			
			activateButtons		: function() {
									this.enableScrolling();
									$(".button, .header-button-right, .header-button-left, .settings-icon, .info-icon").css({"pointer-events" : "all"});
								},
			
			deactivateButtons	: function(cancelOption) {
									this.disableScrolling();
									$(".header-button-right, .header-button-left, .settings-icon, .info-icon").css({"pointer-events" : "none"});
                					if(cancelOption)
                                    	$(".button:not(#actionbutton)").css("pointer-events", "none");
                					else {
                                    	$(".button").css("pointer-events", "none");
									}
								},
										
			paintHeaderButtons : function() {
									var self = this;
									var headerButton1 = $(".header-button-left");
									var headerButton2 = $(".header-button-right");
									var classes1 = $(headerButton1).attr("class").split(' ');
									var classes2 = $(headerButton2).attr("class").split(' ');
									
									if(self.HB1 == "blank") {
										$("#header-button-left-text").fadeOut(500, function(){
											$(headerButton1).attr({"class" : classes1[0] + " header-button-" + self.HB1});
										});
									}
									else {
										$(headerButton1).attr({"class" : classes1[0] + " header-button-" + self.HB1});
										$("#header-button-left-text").show();
									}
									if(self.HB2 == "blank") {
										$("#header-button-right-text").fadeOut(500, function(){
											$(headerButton2).attr({"class" : classes2[0] + " header-button-" + self.HB2});
										});
									}
									else {
										$("#header-button-right-text").show();
										$(headerButton2).attr({"class" : classes2[0] + " header-button-" + self.HB2});
									}
										
									if(self.HB2 == "loader") 
										$(headerButton2).find("#header-button-right-text").hide();
									else 
										$(headerButton2).find("#header-button-right-text").show();
								},
			xBack			:	function() {
									var self = this;
									var page = self.pageMap[self.pC.page].map.back;
									self.changePage(page, "back");
								},
			processHB1Click :	function() {
									var self=this;
									
									if(self.HB1 == "back") {
										TRACK(self.pC.page.replace(".php", "") + "_BACK_BUTTON_PRESSED");
										if(self.pC.page == "timetable.php") {
											TT.cancelTimeTable();
										}
                                        if(isPhoneGap && self.pC.page == "recording.php") {
                                        	console.log("recording back button");
                                        	return self.actionRecording();
										}
										if(self.pC.page == "step2a.php") {
											IV.cancel();
										}
                                        if(self.pC.page == "settings.php") {
                                        	IV.cancel();
                                        }
										
										// NEW
										self.xBack();
										
										// OLD
										//self.pageBack();
										
									}
								},
			
			processHB2Click : 	function() {
									var self = this;
									TRACK(self.pC.page.replace(".php", "") + "_" + self.HB2 + "_BUTTON_PRESSED");
									if(self.HB2 == "save") {
										if(self.pC.page == "step2a.php") {
											self.pC.action();
										}
										
										if(self.pC.page == "recording.php") {
											self.xBack();
                                        	//self.pageBack();
										}
                                        
                                        if(self.pC.page == "settings.php") {
                                        	self.actionSettings();
                                        }
									}
									
									if(self.HB2 == "next" && self.pC.page == "step3.php") {
										self.requestCompleted();
									}
									
									if(self.HB2 == "new") {
                                    	if(isPhoneGap) {
                                            self.scr.state=0;
                                            self.scr.recordingActive=0;
                                            //resetRecording();
                                        }
										self.reset();
										self.changePage("step1.php", "back");
										return false;
									}
								},
			
			setHeaderButtons : 	function() {
									var self = this;
									self.HB1 = self.p.buttons.left;
									self.HB2 = self.p.buttons.right;
								},
			
			bindTextAreas 	: 	function() {
									var self = this;
                                    $("body").delegate(".description-text", "keyup", function(){
										if(!self.sentDetailsProvidedEvent && (self.sentDetailsProvidedEvent = true))
											TRACK("STEP2_TEXT_DETAILS_PROVIDED");
                                        self.description = $(".description-text").val();
                                    });
									
									$("body").delegate(".what-text", "change", function(){
										TRACK("STEP1_CATEGORY_SELECTED");
										self.what = $(".what-text").val();
										$("#what-text-overlay-fix").addClass("selected");
										$("#what-text-overlay-fix").text(self.what);
										$("#select-service-category").remove(); // remove the option because in mobile safari the disabled attr doesn't work.
									});
									
									$("body").delegate(".where-text", "keyup", function(){
										if(self.watchPositionVar)
											navigator.geolocation.clearWatch(self.watchPositionVar);
										self.where = $(".where-text").val();
									});
									
									// Cross Browser Placeholder
									//
									$("body").delegate("textarea", "focus", function(){
										if ($.trim($(this).val ()) ===  $(this).attr("rel")){
											this.value ='';
											$(this).removeClass("deactive");
										}
									});
									$("body").delegate("textarea", "blur", function(){
										if ($.trim ($(this).val ()) ===  ''){
											this.value = $(this).attr("rel");
											$(this).addClass("deactive");
										}
									});
									$("body").delegate("#isNameValid", "keyup", function() {
										self.name = $("#isNameValid").val();
									});
									
									$("body").delegate("#isEmailValid", "keyup", function() {
										self.email = $("#isEmailValid").val();
									});
									
									$("body").delegate("#isPhoneValid", "keyup", function() {
										self.phone = $("#isPhoneValid").val();
									});
									
									$("body").delegate("input[type='tel']", "blur", function() {
										// was considering making a form.submit here, but shouldn't.
									});
                
                                    $("body").delegate(".recording-circle", "click", function() {
                                        self.scr.onClick();
                                        // was considering making a form.submit here, but shouldn't.
                                    });
                
                                    $("body").delegate(".recording-status.play, .recording-status.pause", "click", function() {
                                         self.scr.statusClick();
                                        // was considering making a form.submit here, but shouldn't.
                                    });
								},
								
			pageBack 		: 	function( options ) {
									/*
									var self = this;
                					var page = self.pC.map.current;
									var callback, lateCallback = function(){};
									
									alert("back");
									history.back();
									return;
									if(self.pC.page == "information.php") {
										lateCallback = function() {
											$("body").append(self.video.css({"position" : "absolute", "top" : "-200%", "opacity" : ".1"}));
										};
									}
                					console.log("PageBack()");
                					if(page == "recording.php")
                                    	self.scr.resetPlayback();
										
									OOvaCall.changePage(pageObject.page, "back", callback, lateCallback);
									*/
									
									/*
									self.pageHistory.pop();
									
									if(options && options.skip) {
										for( var i = 0; i < options.skip; i++ ) {
											self.pageHistory.pop();
										}
									}
									
									self.changePage(self.pageHistory[self.pageHistory.length -1], "back", callback, lateCallback);
									*/
								},
								
			pushHistory		:	function(type) {
									// type, inherited from LoadPage, is "back" or "forward", (== direction)
									var self = this;
									++currentStateID;
									currentState = { page : self.pC.page, direction : type, id : currentStateID};
									
									history.pushState({ page : self.pC.page, direction : type, id : currentStateID }, "", "#!" + self.pC.page);
								},
								
			changePage 		: 	function( page, direction, callback, lateCallback, opt_cameFromPushState) {
									var self = this;
									self.pageSnapAnimate();
									verifyInternet(function(){
										// set the page to return to if the screen back button is clicked (not the browsers, that's controlled differently), since the settings and information page can be accessed from multiple pages
										//
										if(page == "settings.php" || page == "information.php") {
											self.pageMap[page].map.back = self.pC.page;
										}
                                    	self.pP = self.pC;
										self.pC = self.pageMap[page];
										self.p = self.pageMap[page];
										
										if(direction == "forward") {
											self.pageHistory.push(self.pC.map.current);
										}
										else if(direction == "back") {
											self.pageHistory.pop();
										}
										loadPage(page, direction, callback, lateCallback, opt_cameFromPushState);
                                    }, 1);
									
								},
			
			processTimeTableSave: function() {
									TT.repaintTable();
								},
								
			repaintPageVars:	function(page) {
									var self = this;
									var page = self.pC.map.current;
									
									if(page == "timetable.php") {
										$("#tt").append(TT.subject);
									}
									
                                    if(page == "information.php") {
                                        $("#info-review").click(function(){
                                        	window.open(self.reviewLink);
                                        });
                                    }
                
									if(page == "step1.php") {
										createCategories();
										if(self.what != "Select Service Category") {
											$("#select-service-category").remove();
										}
										$(".where-text").val(self.where);
										if(self.what != "Select Service Category") {
											$("#what-text-overlay-fix").text(self.what).addClass("selected");
										}
										$("#what-select").val(self.what);
										
									}
                
									if(page == "recording.php" && isPhoneGap && self.scr)
                                    	self.scr.repaint();
                
									if(page == "step2.php") {
										$("#time").append(TT.mainButtons);
                                        if(isPhoneGap && self.scr && self.scr.recordingActive) {
                                            $(".description-text").prop("disabled", true).val("Recording Saved");
                                        }
                                        else {
                                            if(self.description != "none" && self.description != $(".description-text").attr("crossBrowserPlaceholder") && self.description && self.description != "")
                                                $(".description-text").val(self.description).removeClass("deactive");
                                            }
                                    }
                
									
									if(page == "step2a.php" || page == "settings.php") {
										
										$("#info").append(IV.subject);
										$("#isNameValid").val(IV.name);
                                        $("#isEmailValid").val(IV.email);
                                        $("#isPhoneValid").val(IV.phone);
                                        IV.paint();
										
									}
				
								},
							
			setNextPage : 	function() {
								var self = this;
								var cp = self.pC;
								
								self.pN = self.p.map.forward;
								
								if(cp == "information.php" || cp == "recording.php" || cp == "timetable.php") {
									self.pN = self.p.map.current;
								}
							},
							
			trackPageOpened:function() {
							var self = this;
							var pageString = self.pC.page.replace(".php", "");
							TRACK(pageString + "_SCREEN_OPENED");
								
			}
		}
		
window.OOvaCall = new OOVACall();

// If the user landed here on the index.php page because they came from an alternate source, like the blog.
// For reference, the .html version is only solely necessary for the phonegap version.
//
if(window.defaultCategory) {
	$(".what-text").val(window.defaultCategory);
	$(".what-text").trigger("change");
}

String.prototype.reverse=function(){return this.split("").reverse().join("");}

	// ====================================== TIME TABLE =========================================

		function timetable() {
			this.subject = $("<table cellspacing='0' cellpadding='0' class='timetable'>");
			this.topRow = $("<tr>");
			this.body = $("body");
			this.daysOfWeek = new Array();
			this.daysOfMonth = new Array();
			this.months = new Array();
			this.year = new Date().getFullYear();
			this.daysSelected = new Array();
			this.tableCellDateStrings = new Array();
			this.tableCells = new Array();
			this.hourOfDay = new Date().getHours();
			this.mainButtons = $('<div class="time-buttons clearfix">');
			this.postString = "";
			this.init();
		}

		timetable.prototype = {
			init : function() {
				var self = this;
				self.createTopRow();
				self.setTableDays();
				self.createBodyRows();
				self.setMainButtons();
				self.deactivateDays();
				self.delegateTableClick();
			},
			
			emptyAll : function() {
				var self = this;
				self.nowButton.removeClass("active");
				self.anytimeButton.removeClass("active");
				self.pickTimeButton.removeClass("active");
				for(var i = 0; i < self.tableCells.length; i++) {
					$(self.tableCells[i]).removeClass("active");
				}
			},
			
			cancelTimeTable : function() {
				var self = this;
				// reset to what the days were right when the timetable was opened
				//
				self.daysSelected = self.daysSelectedTemp;
				
				// repaint
				//
				self.repaintTable();
			},
			
			repaintTable : function() {
				var self = this;
				var length = self.tableCells.length;
				for(var i = 0; i < length; i++) {
					if(self.daysSelected.indexOf(self.tableCells[i].attr("id")) != -1) {
						$(self.tableCells[i]).removeClass("deactive").addClass("active");
					}
					else
						$(self.tableCells[i]).removeClass("active");
				}
				if(self.daysSelected.length == 0 || self.daysSelected == "now" || self.daysSelected == "anytime")
					self.pickTimeButton.removeClass("active").addClass("deactive");
			},
			
			// Convert days selected into a GET string "&..=...&..=..&..=.."
			//
			postify	:	function() {
				var self = this;
				self.postString = "";
				var daysSelectedTemp = new Array();
				for(var i = 0; i < self.daysSelected.length; i++) {
					if(self.daysSelected[i] == "now")
						daysSelectedTemp.unshift("now");
					else if(self.daysSelected[i] == "anytime")
						daysSelectedTemp.unshift("anytime");
					else {
						daysSelectedTemp.push(self.daysSelected[i].reverse());
					}
				}
				daysSelectedTemp = daysSelectedTemp.sort();
				for( var i = 0; i < daysSelectedTemp.length; i++ ) {
					var orig = daysSelectedTemp[i].reverse();
					if( daysSelectedTemp[i] == "now" )
						self.postString = "&box41=now" + self.postString;
					else if( daysSelectedTemp[i] == "anytime" )
						self.postString = "&box41=anytime" + self.postString;
					else {
						for( var j = 0; j < self.tableCells.length; j++ ) {
							if($(self.tableCells[j]).attr("id") == orig) {
								self.postString+="&box" + orig.replace("-", "") + "=" + $(self.tableCells[j]).attr("dateString");
							}
						}
					}
				}
				console.log("PSOTSTRING: ");
				console.log(self.postString);
			},
			
			setMainButtons : function() {
				var self = this;
				self.nowButton = $('<div id="now" class="time-button deactive">NOW</div>');
				self.anytimeButton = $('<div id="anytime" class="time-button deactive">ANYTIME</div>');
				self.pickTimeButton = $('<div id="timetable" class="time-button deactive">PICK TIME</div>');
				self.mainButtons.append(self.nowButton).append(self.anytimeButton).append(self.pickTimeButton);
			},
			
			setTableDays : function() {
				var self = this;
				var today = new Date();
				var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
				
				for(var i = 0; i<7; i++) {
					var currentDate = new Date();
					currentDate.setDate(today.getDate() + i);
					
					var dayShort = days[(currentDate.getUTCDay())];
					var dateNumber = currentDate.getUTCDate();
					var monthShort = currentDate.getUTCMonth() + 1;
					self.daysOfWeek.push(dayShort);
					self.daysOfMonth.push(dateNumber);
					self.months.push(monthShort);
				}
			
			},
			
			deactivateDays: function() {
				var self = this;
				if(self.hourOfDay >= 11)
					self.tableCells[0].addClass("cancel");
				if(self.hourOfDay >= 15)
					self.tableCells[1].addClass("cancel");
				if(self.hourOfDay >= 19) 
					self.tableCells[2].addClass("cancel");
					
			},
			
			createTopRow : function() {
				var self = this;
				var blankHead = $("<td>").appendTo(self.topRow);
				var firstHead = $("<td class='head'>").html("<strong>Morning</strong><br />8-11AM").appendTo(self.topRow);
				var secondHead = $("<td class='head'>").html("<strong>Afternoon</strong><br />12-4PM").appendTo(self.topRow);
				var thirdHead = $("<td class='head'>").html("<strong>Evening</strong><br />5-8PM").appendTo(self.topRow);
				self.topRow.appendTo(self.subject);	
			},
			
			selectDate	: function(domobj) {
				var self = this;
				var hasActive = $(domobj).hasClass("active");
				var id = $(domobj).attr("id");
				var length = self.daysSelected.length;
				if(length > 4 && !hasActive && id!="anytime") {
					TRACK("CALENDER_MAX_TIME_SLOTS_NOTIFICATION");
					new xAlert("Maximum number of time slots selected");
				}
				else {
					// main page Now Anytime Pick Time buttons
					//
					$(".time-button").not(domobj).not("#timetable").removeClass("active").addClass("deactive");
					$(domobj).removeClass("deactive").toggleClass("active");
					
					hasActive = $(domobj).hasClass("active");
					
					if(id == "anytime" && hasActive) {
						self.daysSelected = ["anytime"];
						self.repaintTable();
					}
					else if(hasActive) {
						var index = self.daysSelected.indexOf("anytime");
						if(index != -1) {
							// Re-arrange the daysSelected array
							self.daysSelected.splice(index, 1);
							self.daysSelected.filter(function (item) { return item != undefined }).join();
						}
						// make sure we are dealing specifically with the time table cells, not the NOW / ANYTIME buttons
						var attr = $(domobj).attr("rowIndex");
						if(typeof attr !== 'undefined' && attr !== false) {
							TRACK("CALENDAR_TIME_SELECTED");
							self.daysSelected.unshift( (($(domobj).attr("colIndex")) + "-" + ($(domobj).attr("rowIndex"))));
						}
						// only for main BUTTONS, not table cells
						else {
							self.daysSelected.unshift(($(domobj).attr("id")));
						}
					}
					else {
						// make sure we are dealing specifically with the time table cells, not the NOW / ANYTIME buttons
						var attr = $(domobj).attr("rowIndex");
						if(typeof attr !== 'undefined' && attr !== false) {
							TRACK("CALENDAR_TIME_DESELECTED");
						}
						var index = self.daysSelected.indexOf($(domobj).attr("id"));
						self.daysSelected.splice(index, 1);
						self.daysSelected.filter(function (item) { return item != undefined }).join(); //reindex array
						
					}
				}
			
			},
			
			createBodyRows : function () {
				var self = this;
				for(var row = 0; row < 7; row++) {
					for(var col = -1; col < 3; col++) {
						var newRow;
						if(col == -1) {
							newRow = $("<tr>").append(($("<td class='lefthead'>")).html("<strong>" + self.daysOfWeek[row] + " </strong> <br/>" + self.months[row] + "/" + self.daysOfMonth[row]));
						}
						else {
							var MyDateString = self.year + '-' + ( ('0' + self.months[row].toString()).slice(-2) ) + '-' + ( ('0' + self.daysOfMonth[row].toString()).slice(-2));
							var newCol = (($("<td id=" + ( col + 1 ) + "-" + ( row + 1 ) + " class='blank'>").attr("rowIndex", (row+1)).attr("colIndex", (col+1)).attr("dateString", MyDateString)).append($("<div style='position:relative'>"))).appendTo(newRow);
							
							var self = this;
							self.tableCells.push(newCol);
						}			
						self.subject.append(newRow);
					}
				}
			
			},
			
			delegateTableClick : function() {
				var self = this;
				$("body").delegate("#tt td:not(.head, .lefthead, .cancel)", "click", function(){self.selectDate(this);});
			}
		}
		var TT = new timetable();

		// =============================================== RECORDING ================================================
		
		function SCRecording() {
            // Declare global variables
            this.state = 0; // 0 record, 1 stop (there is a recording available)
            this.liveStatus; // updates live, by the Media function
            this.statusState = 0; // 0 play, 1 pause
            // this.src = "recording.aiff"; // name of auio file
            if(device.platform == "Android") {
          	  	this.src = "recording.amr"; // name of auio file
            	this.mimeType = "audio/AMR";
            }
            else {
          	  	this.src = "recording.wav"; // name of auio file
            	this.mimeType = "audio/aiff";
            }
            this.mediaRec; // the object for recording and play sound
            this.directory; // holds a reference for directory reading
            this.recordingActive = 0;
            this.init();
        }
        
        SCRecording.prototype = {
			// Wait for PhoneGap to load
        	init : function() {
        		var self = this;
          		//document.addEventListener("deviceready", function(){self.ready()}, false);
                self.ready();
                //self.ready();//init();
            },
        
            // PhoneGap is ready
            ready : function() {
        		var self = this;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){self.onFileSystemSuccess(fileSystem);}, function(){self.onError});
            },
            
			// clicking of the record button
			//
            onClick : function() {
            	TRACK("DETAILS_RECORDING_SCREEN_RECORD_BUTTON_PRESSED");
        		var self = this;
              	console.log("onClick() "+self.state);
              	switch(self.state) {
                	case 0:
                    	self.startRecording();
                        break;
                    case 1:
                       	self.stopRecording();
                        break;
                    case 2:
                    	self.deleteAlert(function(){self.resetRecording();});
                    	break;
                    default:
                    	console.log("Recycling State");
                    	self.state = 0;
                        break;
            	}
				return false;
            },
            
            
            uploadVoice : function( callback ) {
            	var self = this;
                console.log("uploadVoice();");
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = self.src;
                options.mimeType = self.mimeTYpe;

                var params = new Object();
                params.value1 = "test";
                params.value2 = "param";
                
				var win = function(r) {
                	TRACK("DETAILS_RECORDING_SCREEN_AMAZON_UPLOAD_AUDIO_SUCCESS");
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                    console.log("Final url was: " + $root + "augie/s3test2.php?reqID="+OOvaCall.requestID+"");
                    $.ajax({
                    url : $root + "api/mobile/v2/encodeAudio.php?requestID="+OOvaCall.requestID,
                    success : function(data) {
                		TRACK("DETAILS_RECORDING_SCREEN_AMAZON_ENCODE_AUDIO_SUCCESS");
						console.log("Successful ajax encoding audio, now calling back");
                    	if(callback)
                    		callback();
                    },
                    error: function(xhr, responseText, error){
                		TRACK("DETAILS_RECORDING_SCREEN_AMAZON_ENCODE_AUDIO_FAILED");
                       // alert(responseText);
                    }
                    
                    });
                }

                var fail = function(error) {
                	TRACK("DETAILS_RECORDING_SCREEN_AMAZON_UPLOAD_AUDIO_FAILED");
                   // alert("An error has occurred: Code = " = error.code);
                }
                
                options.params = params;

                var ft = new FileTransfer();
                ft.upload(self.directory.fullPath+"/"+self.src, $root + "augie/s3test2.php?reqID="+OOvaCall.requestID+"", win, fail, options);
            },
            
            deleteAlert : function(okCallback, cancelCallback) {
            					new xAlert("Are you sure you want to delete the details recording",
                                function( button ) {
                                	if(button == 1) {
                                    	TRACK("DETAILS_RECORDING_SCREEN_DELETE_NOTIFICATION_OK");
                                        if(okCallback)
                                        	okCallback();
                                    }
                                    else if(button == 2) {
                                    	TRACK("DETAILS_RECORDING_SCREEN_DELETE_NOTIFICATION_CANCEL");
                                        if(cancelCallback)
                                            cancelCallback();
                                    }
                                    
                                },
                                "",
                                "Ok,Cancel"
                                );
            
            },
            
            statusClick : function() {
            	var self = this;
              	console.log("statusClick() " + self.statusState);

              	switch(self.statusState) {
                	case 0:
                    	self.statusState++;
                    	self.playRecording();
                        break;
                    case 1:
                    	self.statusState--;
                       	self.pauseRecording();
                        break;
                    default:
                    	self.statusState = 0;
                        break;
            	}
            },
            
            repaint : function() {
            	var self = this;
                if( self.recordingActive ) {
                	$(".recording-status")[0].className = "recording-status play";
                    $(".recording-time").show();
                    self.setAudioPosition(self.length);
                }
            },
            
            resetRecording : function() {
            	var self = this;
				console.log("Resetting the recording");
            	$(".recording-time").text("0:00").hide();
                self.state = 0;
                $(".recording-button")[0].className = "recording-button";
                $(".recording-status")[0].className = "recording-status";
                self.recordingActive = 0;
            },
            
            startRecording : function() {
            	var self = this;
                $(".recording-time").show();
                $(".recording-button").addClass("stop");
                self.state = 1;
				
				OOvaCall.deactivateButtons(true);
                
                self.saveDuringRecord = function(){
                	return self.stopRecording();
                }
                
                $("#actionbutton").bind("click", self.saveDuringRecord);
				
                console.log("");
                console.log("startRecording() with path: " + self.directory.fullPath+"/"+self.src +"");
                self.fullPath = self.directory.fullPath+"/"+self.src;
                // Create your Media object
                setTimeout(function(){
                    self.mediaRec = new Media(self.directory.fullPath+"/"+self.src,
                    // Success callback
                    function() {
                        console.log("mediaRec -> success");
                        /*
                      	  	var uploadURL = $root + "augie/upload.php";
               				var fileName = "recording.amr";
                			var fileMime = "audio/AMR";
                			var dirName = self.directory.name;
                        	//self.uploadVoice(fileName, dirName, fileMime, uploadURL);
                            console.log("done");
                            */
							return true;
                    },
                    // Error callback
                    function(err) {
                        console.log("mediaRec -> error: "+ err.code);
                    },
                    function(status){
                    	self.liveStatus = status;
                    });
                    // Record audio
                    self.mediaRec.startRecord();
                    self.length = 0;
                    self.setAudioPosition(self.length);
                    self.startRecordTimeoutCounter = 0;
					var recordInterval = setInterval(function(){
						if(self.liveStatus == 1 || self.liveStatus == 2) {
							self.mediaRec.getCurrentPosition(function(position) {
								if(position >= 0)
									self.setAudioPosition((position));
								console.log("Recording length: " + position + " seconds" );
							}, function(e) {
							
							});
						}
						else {
							self.startRecordTimeoutCounter++;
							if(self.startRecordTimeoutCounter == 20) {
								alert("done");
								clearInterval(recordInterval);
							}
							//self.resetPlayback();
						}
					}, 250);
					/*
                    self.recInterval = setInterval(function() {
                    	self.length++;
                        self.setAudioPosition(self.length);
                        console.log("Recording length: " + self.length + " seconds" );
                    }, 1000);
					*/
                    
                },5);
            },
             
            stopRecording : function() {
            	var self = this;
                self.state = 2;
                OOvaCall.activateButtons();
				
                $("#actionbutton").unbind("click", self.saveDuringRecord);
				
                self.clearInterval();
                self.recInterval = null;
                console.log("stopRecording()");
                self.mediaRec.stopRecord();
                $(".recording-time").text("0:"+(self.length < 10 ? '0' : '') + self.length);
                
                if(self.length < 3) {
                	TRACK("DETAILS_RECORDING_SCREEN_RECORDING_TOO_SHORT_NOTIFICATION");
                	new xAlert("Recording must be at least three seconds");
                	self.resetRecording();
					return false;
                }
                else {
                	//self.uploadVoice();
               	 	$(".recording-button").removeClass("stop");
               	 	$(".recording-status").removeClass("pause").addClass("play");
                	self.recordingActive = 1;
					return true;
                }
            },
            
            pauseRecording: function() {
            	TRACK("DETAILS_RECORDING_SCREEN_PAUSE_BUTTON_PRESSED");
            	var self = this;
                clearInterval(self.recInterval); // do not set to null
                $(".recording-status").removeClass("pause").addClass("play");
                self.mediaRec.pause();
            },
            
            setAudioPosition: function(position) {
            	var position = (position) ? position : 0;
                $(".recording-time").text("0:"+(position < 10 ? '0' : '') + Math.floor(position));
            },
            
            clearInterval : function(){
            	var self = this;
            	clearInterval(self.recInterval);
                self.recInterval = null;
            },
            
            resetPlayback : function() {
            	var self = this;
                self.statusState = 0;
                self.clearInterval();
                if(self.mediaRec) {
                	self.mediaRec.stop();
                    if($(".recording-status").hasClass("pause"))
                		$(".recording-status").removeClass("pause").addClass("play");
                }
            },
            
            playRecording : function() {
            	var self = this;
            	TRACK("DETAILS_RECORDING_SCREEN_PLAY_BUTTON_PRESSED");
                console.log("playRecording()");
				
				self.mediaRec = new Media(self.directory.fullPath+"/"+self.src, function() {}, function(err) {}, function(status){self.liveStatus = status;});
				self.mediaRec.play();
				
				var playInterval = setInterval(function(){
					if(self.liveStatus == 1 || self.liveStatus == 2) {
						$(".recording-status").removeClass("play").addClass("pause");
                    	self.mediaRec.getCurrentPosition(function(position) {
							if(position >= 0)
								self.setAudioPosition((position));
							console.log("Playing length: " + position + " seconds" );
						}, function(e) {
						
						});
					}
					else {
						clearInterval(playInterval);
						self.resetPlayback();
					}
				}, 250);
                $(".recording-status").removeClass("play").addClass("pause");
				
            },
             
            onFileSystemSuccess : function(fileSystem) {
            	var self = this;
                console.log("filesystem is: " + fileSystem);
                console.log("onFileSystemSuccess()");
                // Get the data directory, creating it if it doesn't exist.
                fileSystem.root.getDirectory("",{create:true}, function(d){self.onDirectory(d)}, function(error){self.onError(error)});
                
                // Create the lock file, if and only if it doesn't exist.
                fileSystem.root.getFile(self.src, {create: true, exclusive: false}, function(){self.onFileEntry()}, function(error){self.onError(error)});
                
            },
             
            onFileEntry : function() {
              console.log("onFileEntry()");
            },
             
            onDirectory : function(d) {
            	var self = this;
                console.log("onDirectory()");
                console.log("Directory created: '" + d.name );
                self.directory = d;
                var reader = d.createReader();
                reader.readEntries(function(entries){self.onDirectoryRead(entries)}, function(error){self.onError(error)});
            },
             
            // Helpful if you want to see if a recording exists 
            onDirectoryRead : function(entries) {
            	var self = this;
                console.log("The dir has "+entries.length+" entries.");
                // Scan for audio src
                for (var i=0; i<entries.length; i++) {
                	console.log(entries[i].name+' dir? '+entries[i].isDirectory);
                	if(entries[i].name == self.src) {
                  		console.log("file found");
                 	}
                }
            },
             
            onSuccess : function() {
              console.log("onSuccess()");
            },
             
            onError : function(error) {
              alert('onError(): '    + error.code    + '\n' + 
              'message: ' + error.message + '\n');
            }
        }
        
        
        // =========================================== Local Device Storage ===========================================
        
        function SCStorage() {
        	var self = this;
			console.log("going to try and get name");
        	this.name = self.getName();
            this.email = self.getEmail();
            this.phone = self.getPhone();
            this.location = self.getLocation();
            this.submitCount = self.getSubmitCount();
            self.init();
            
        }
        
        SCStorage.prototype = {
        
        	init : function() {
            	var self = this;
                if(IV){
                    // setting both of these for now, should only be doing one of
                    // them but i am spaghetti coding it because GP is rushing me
                    //
                    self.setName(self.name);
                    self.setEmail(self.email);
                    self.setPhone(self.phone);
                    self.setLocation(self.location);
                    self.setSubmitCount(0);
                    IV.name = self.getName();
                    IV.email = self.getEmail();
                    IV.phone = self.getPhone();
                    IV.paint();
                }
                else {
                	setTimeout(function(){
                    	self.init();
                    }, 200);
                }
                
            },
            
            empty : function() {
            	return this.getName() || this.getEmail() || this.getPhone();
            },
            
            full : function() {
            	return this.getName() && this.getEmail() && this.getPhone();
            },
            
            getVars : function() {
            },
            
            setName : function( name ) {
            	this.name = name;
                console.log("set window storage Name to : " + name);
            	window.localStorage.setItem("Name", name);
            },
            
            setEmail : function( email ) {
            	this.email = email;
                console.log("set window storage Email to : " + email);
            	window.localStorage.setItem("Email", email);
            },
            
            setPhone : function( phone ) {
            	this.phone = phone;
                console.log("set window storage Phone to : " + phone);
            	window.localStorage.setItem("Phone", phone);
            },
            
            setLocation : function( location ) {
            	this.location = location;
                console.log("set window storage Location to : " + location);
            	window.localStorage.setItem("Location", location);
            },
            
            setSubmitCount: function( count ) {
            	this.submitCount = count;
                console.log("set window storage Submit Count to : " + count);
            	window.localStorage.setItem("SubmitCount", count);
            },
            
            incrementSubmitCount: function(){
            	this.setSubmitCount(this.getSubmitCount() + 1);
            },
            
            resetSubmitCount :	function() {
            	this.setSubmitCount(0);
            },
            
            disableSubmitCount : function() {
            	// will not ask to leave a review until this submit count is >= 1
            	this.setSubmitCount(-10);
            },
            
            getName : function() {
            	var name = window.localStorage.getItem("Name") ? window.localStorage.getItem("Name") : "";
                console.log("retrieved Name : " + name + " from local storage")
            	return name;
            },
            
            getEmail : function() {
            	var email = window.localStorage.getItem("Email") ? window.localStorage.getItem("Email") : "";
                console.log("retrieved Email : " + email + " from local storage")
            	return email;
            },
            
            getPhone : function() {
            	var phone = window.localStorage.getItem("Phone") ? window.localStorage.getItem("Phone") : "";
                console.log("retrieved Phone : " + phone + " from local storage")
            	return phone;
            },
            
            getLocation : function() {
            	var location = window.localStorage.getItem("Location") ? window.localStorage.getItem("Location") : "";
                console.log("retrieved Location : " + location + " from local storage")
            	return location;
            },
            
            getSubmitCount: function() {
            	var count = window.localStorage.getItem("SubmitCount") ? window.localStorage.getItem("SubmitCount") : 0;
                console.log("retrieved SubmitCount : " + count + " from local storage")
            	return count;
            }
        }
        
        var preloads = "images/arrow-right-active.png, images/arrow-left-active.png, images/call_answered.png, images/call_hungup.png, images/microphone.png, images/stripes.png, images/bg.png, images/ajax_loader.gif, images/videoPlaceholder.png".split(",")
        var tempImg = [];
    
		// We switched to use localstorage on both phonegap and non phonegap versions.
		OOvaCall.localStorage = new SCStorage();
		
        if(isPhoneGap) {
        	// BLIPS COMPLETE
            //
                $(document).on("blipsComplete", function(){
                	blipsCompleteExecutedSuccessfully = true;
                    var checkForOOvaCall = setInterval( function(){
                        if(OOvaCall) {
                            OOvaCall.preloadVideo(); 
                            /*  
                            Begin iPhone Cache Fix:
                            iPhone caches .ajax POST calls, surprisingly.
                            issue documented: http://stackoverflow.com/questions/12506897/is-safari-on-ios-6-caching-ajax-results
                            this is the simplest workaround I can observe.
                            */
                            $.ajaxSetup({
                                type: 'POST',
                                headers: { "cache-control": "no-cache" }
                            });
                            /* End iPhone Cache Fix */
                
                            // changing links to open in web browser
                            //
                            document.addEventListener('click', function(e) {
                                if (e.srcElement.target === "_blank" && e.srcElement.href.indexOf("#phonegap=external") === -1) {
                                    e.srcElement.href = e.srcElement.href + "#phonegap=external";
                                }
                            }, true);
							
                            // load the storage system on native phones
                            //
                            OOvaCall.localStorage = new SCStorage();
                            
                            // create custom recording object on native phones
                            //
                            OOvaCall.scr = new SCRecording();
                            
                            // use old location from prior completed request if available
                            //
                            OOvaCall.where = OOvaCall.localStorage.getLocation();
                            $(".where-text").val(OOvaCall.where);
                            
                            // preload images from above
                            //
                            for(var x=0;x<preloads.length;x++) {
                                tempImg[x] = new Image()
                                tempImg[x].src = preloads[x]
                            }
                            clearInterval(checkForOOvaCall);
                        }
                        else {
                            alert("no oova yet");
                        }
                    }, 500);
                //}
              //  });
            });
        }
        
        // Desktop version
        //
        else {
        	OOvaCall.preloadVideo();
            for(var x=0;x<preloads.length;x++) {
                tempImg[x] = new Image()
                tempImg[x].src = preloads[x]
            }
        }
        
	}
    
	else {
		setTimeout(function() {
			// has not loaded yet, cycle back through and check again after one second
			//
			DeviceReady();
		}, 1000);
	}
    
    // ========================================== HELPERS =============================================
    
    // remove leading or trailing spaces 
    function trimSpaces(s) { 
        s = s.replace(/(^\s*)|(\s*$)/gi,"");
        s = s.replace(/[ ]{2,}/gi," ");
        s = s.replace(/\n /,"\n"); return s;
    }

    String.prototype.capitalize = function() {
       return this.toLowerCase().replace(/^.|\s\S/g, function(a) { return a.toUpperCase(); });
    }
	
	var SCAjaxErrorCount = 0;
	var start_time = new Date().getTime();
    $.SCAjax = function(url, callback, errorCallback) {
        if (!url || !callback) {
            throw new Error('$.SCAjax(): Parameters may be undefined');
        }
		
		if(SCAjaxErrorCount == 0)
			start_time = new Date().getTime();
			
        verifyInternet(function() {
			console.log("done checking internet");
            $.ajax({
                url : url,
                success : function(data) {
					SCAjaxErrorCount = 0;
					var request_time = new Date().getTime() - start_time;
					// Track the ajax time for each page load. could use my custom TRACK function, or this for simplicity
					_gaq.push(['_trackEvent', "v3test", "SCAjaxLoaded", url, request_time]);
				
                    console.log("SCAjax: successfully retrieved url: " + url);
                    if(callback)
                        callback(data);
                },
                
                error : function(xhr, textResponse, errorNode) {
					SCAjaxErrorCount++;
                    console.error("SCError - SCAjax: url: ' " + url + " ' threw an ajax error with response: " + textResponse);
					if((url.indexOf("getRequestStatus") == -1 && SCAjaxErrorCount == 3) || (url.indexOf("getRequestStatus") != -1 && SCAjaxErrorCount == 10)) {
						OOvaCall.deactivateSpinner();
						OOvaCall.activateButtons();
						SCAjaxErrorCount = 0;
						new xAlert("Connection interrupted, please try again");
						//new xAlert("SCErro222r - SCAjax: url: ' " + url + " ' threw an ajax error with response: " + textResponse);
					}
					else {
						if(errorCallback) {
							errorCallback();
						}
						else {
							$.SCAjax(url, callback, errorCallback);
						}
					}
                },
				timeout : 7000 // timeout after 25 seconds of unsuccesful fetching.
            });
        }, 1);
    }
	if(callback)
		callback();
}