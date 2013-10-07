<?php
	/* The php version of the mobile web will input a users category immediately */
	$category = isset($_GET['category']) ? urldecode($_GET['category']) : false;
	$source = isset($_GET['source']) ? urldecode($_GET['source']) : false;

?><!DOCTYPE html>
<html>
	<head>
		<link href="css/style.css" type="text/css" rel="stylesheet" />
		<script src='js/ios-orientationchange-fix.js'></script>
		<meta name="viewport" id="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0" >
		<link href="css/style.css" type="text/css" rel="stylesheet" />
		<link href="css/buttons.css" type="text/css" rel="stylesheet" />
		<link href="css/alert.css" type="text/css" rel="stylesheet" />
        
		<script src="cordova-1.8.1.js"></script>
		<script src='js/jQuery-1.9.1.js'></script>
		<script src="js/xValidate.js"></script>
		<script src='js/OOVACall.js'></script>
		<script src="js/xAlert.js"></script>
		<!--<script src="js/infobox.js"></script>-->
		<!--<script src="js/xMarker.js"></script>-->
		<script src="js/ios-orientationchange-fix.js"></script>
		<script src="//connect.facebook.net/en_US/all.js"></script>
		<script type="text/javascript">
			<?php if($category) { ?>
				window.defaultCategory = "<?php print $category ?>";
			<?php } ?>
			<?php if($source) { ?>
				window.source = "<?php print $source ?>";
			<?php } ?>
			var TRACKING = true;
			var GA_TRACKING_ID = "UA-33990542-1";
			var isPhoneGap = false;
            var APIS_COMPLETE = false; // becomes true when all APIs are loaded
            var $root = isPhoneGap ? "http://test.s17.sevacall.com/" : location.protocol + '//' + location.host + "/"; // hardcoded test.s17 into phonegap version for now
			if(!isPhoneGap) {
				var fileref=document.createElement("link");
				fileref.setAttribute("rel", "stylesheet");
				fileref.setAttribute("type", "text/css");
				fileref.setAttribute("href", "css/noPhoneGap.css");
				document.getElementsByTagName("head")[0].appendChild(fileref);
			}
			if(isPhoneGap) {
				var fileref=document.createElement("link");
				fileref.setAttribute("rel", "stylesheet");
				fileref.setAttribute("type", "text/css");
				fileref.setAttribute("href", "css/phoneGap.css");
				document.getElementsByTagName("head")[0].appendChild(fileref);
			}
		</script> 
		<style type="text/css">
		.platform_dialog_fullheight_page  {
			-webkit-transform: rotateZ(360deg);
			-webkit-backface-visibility: hidden;
			-webkit-transform-style: preserve-3d;
		}.fb_dialog {
			-webkit-transform: rotateZ(360deg);
			-webkit-backface-visibility: hidden;
			-webkit-transform-style: preserve-3d;z-index: 1900200 !important;}
		</style>
	</head>
<body>
		
		<span id="fastclick" style="height:100%;">
			<div id="fb-root"></div>
			
			<div id="splashBackground" style="position:fixed; width:100%; height:100%; z-index:100000; left: -999999px; background:#194f8f;">
				<img id="splashImg-iPhone4" src="images/splash-iphone4-4.jpg" style="position:fixed; z-index:100000; width:100%; height:100%; top:0px; left: -9999999px"/>
				<img id="splashImg-iPhone5" src="images/splash-iphone5-4.jpg" style="position:fixed; z-index:100000; width:100%; height:100%; top:0px; left: -9999999px"/>
			</div>
			
			<div id="ajaxLoader">
				<img src="images/ajax_loader.gif" alt="Be patient..." />
			</div>
			
			<!--
			<div style="position:absolute; top:0px; bottom:-60px; left:0; right:0; overflow-x:hidden;">
			-->
				<div id="head" class="header">
					<div style="margin: 0 auto; height:100%">
						<div class="padded headerpadding" >
							
							<table id="header-button-left-wrapper">
								<tr>
									<td class="header-button-left header-button-blank">
										<span id="header-button-left-text"></span>
									</td>
								</tr>
							</table>
							<table id="header-button-right-wrapper">
								<tr>
									<td class="header-button-right header-button-blank">
										<span id="header-button-right-text"></span>
									</td>
								</tr>
							</table>
							
							<div class="logo-white">&nbsp;
							</div>
							
						</div>
					</div>
				</div><!-- style="position:absolute; height:100%; width:100%; overflow-x:hidden;"><!--style="position:absolute; top:0px; bottom:-60px; left:0; right:0;overflow-x:hidden;">-->
				<div id="MAIN" class="GPUAccel padded sep-bottom">
					<!-- Begin Step 1 -->
					<form style="" action="javascript: OOvaCall.actionStep1();">
					
						<div class="what-box sep-text noGPUAccel" style="position:relative;">
							<span class="title-box">I NEED A</span>
							<div id="what-text-overlay-fix">Select Service Category</div>
							<select id="what-select" placeholder="Select Service Category" class="what-text nativeSelect touchandclickevent">
								<option id="select-service-category"><span class="testing">Select Service Category</span></option>
							</select>
						</div>
						
						<div class="where-box sep-text">
							<span class="title-box">NEAR</span>
							<div class="noGPUAccel where-text-wrap">
								<div class="noGPUAccel where-text-innerwrap">
									<input class="where-text" type="text" placeholder="Zipcode" style="width:100%;"/>
								</div>
							</div>
							<div class="button" id="where-button">
								<a href="#"></a>
							</div>
						</div>
						
						<div class="subtext sep-shadow">
							We'll connect you with local businesses instantly!
						</div>
						
						<table id="footer-table" class="sep">
							<tr>
								<td class="footer-icon-wrapper">
									<div id="info-icon" class="info-icon">
									&nbsp;
									</div>
								</td>
								<td>
									<input type="submit" id="actionbutton" class="button" value="Next"/>
								</td>
								<td class="footer-icon-wrapper">
									<div id="settings-icon" class="settings-icon">
									&nbsp;
									</div>
								</td>
							</tr>
						</table>
						
					</form>
					<!-- End Step 1 -->
				</div>
				<div id="MAIN-TRANSITION" class="hidden GPUAccel padded ready-right sep-bottom">
				</div>
				<div id="MAP-SAVED">
				</div>
			<!--
			</div>
			-->
		</span>
		<script type="text/javascript">
			// the following script is a hardcoded set of categories that used to be part of OOVACall
			// we removed them from OOVACall so we will load this Synchronously with the page, and populate the categories dropdown immediately
			// previously, we had a small delay between when the page rendered and when oovacall loads (asynchronously) so it was an undesirable look
			
			/* Call to retrieve categories, if we want to hardcode them, this will output to the console the correct javascript object to use when hardcoding.
			   Do not delete
			 */
			$.ajax({
				type : "JSON",
				url : "http://test.s17.sevacall.com/api/mobile/v2/getConstants.php",
				success : function(data){
					var startingIndex = data.indexOf("6745^ Test Spin^ Test Spin");
					var splitByPipe = data.slice(startingIndex).split("|");
					var categoryObjects = [];
					for(var i = 0; i < splitByPipe.length; i++) {
						var splitByCarrot = splitByPipe[i].split("^");
						var newCategoryObject = {"id" : splitByCarrot[0], "category" : splitByCarrot[1]};
						categoryObjects.push(newCategoryObject);
					}
					
					var stringToBuild = "";
					for(var i = 0; i < categoryObjects.length-1; i++){
						stringToBuild += "{ id : '" + categoryObjects[i]['id'] + "', category : '" + categoryObjects[i]['category'].replace(" ", "") + "'},\n" ;
					}
					console.log(stringToBuild);
				}
			});
			
			var categories = [
				{ id : '6745', category : 'Test Spin'},
				{ id : '13', category : 'Accountants'},
				{ id : '244', category : 'Appliances Repair'},
				{ id : '6746', category : 'Auto Glass Repair'},
				{ id : '479', category : 'Auto Repair'},
				{ id : '6747', category : 'Bail Bonds'},
				{ id : '6748', category : 'Bus Rental'},
				{ id : '6749', category : 'Car Wash'},
				{ id : '1075', category : 'Carpet Cleaners'},
				{ id : '4629', category : 'Chiropractors'},
				{ id : '1543', category : 'Computer Repair'},
				{ id : '1886', category : 'Dentists'},
				{ id : '6750', category : 'Electricians'},
				{ id : '2512', category : 'Florists'},
				{ id : '6752', category : 'Furniture Upholstery'},
				{ id : '6753', category : 'Garage Door'},
				{ id : '6754', category : 'Garbage Removal'},
				{ id : '2886', category : 'Gyms & Fitness'},
				{ id : '6771', category : 'Handyman'},
				{ id : '2999', category : 'Heating and Cooling'},
				{ id : '3515', category : 'Landscapers'},
				{ id : '364', category : 'Lawyers - Bankruptcy'},
				{ id : '360', category : 'Lawyers - Family'},
				{ id : '6755', category : 'Lawyers - Traffic'},
				{ id : '6756', category : 'Limo Rental'},
				{ id : '3674', category : 'Locksmiths'},
				{ id : '3735', category : 'Maid Services'},
				{ id : '3810', category : 'Massage Therapy'},
				{ id : '6757', category : 'Moving & Storage'},
				{ id : '6758', category : 'Notaries'},
				{ id : '4338', category : 'Painters'},
				{ id : '6759', category : 'Party Planners'},
				{ id : '4391', category : 'Party Rental'},
				{ id : '4431', category : 'Personal Trainers'},
				{ id : '6760', category : 'Pest Control'},
				{ id : '4509', category : 'Physical Therapy'},
				{ id : '4764', category : 'Plumbers'},
				{ id : '4990', category : 'Real Estate'},
				{ id : '6762', category : 'Rent Office Furniture'},
				{ id : '5223', category : 'Roofers'},
				{ id : '5609', category : 'Snow Removal'},
				{ id : '6764', category : 'Tailors'},
				{ id : '6765', category : 'Tax Preparation'},
				{ id : '5947', category : 'Taxicabs'},
				{ id : '6766', category : 'Towing'},
				{ id : '6770', category : 'Tree Removal'},
				{ id : '6767', category : 'Tutors'},
				{ id : '6008', category : 'TV Repair'},
				{ id : '6768', category : 'Veterinarians'},
				{ id : '6769', category : 'Window Replacement'}
			];
			
			function createCategories() {
				for(var i = 0; i < categories.length; i++) {
					// non jquery way
					var option = document.createElement("option");
					option.value = categories[i].category;
                    var textValue = categories[i].category.length > 30 ? categories[i].category.slice(0, 30) + "..." : categories[i].category;
					option.text = textValue;
					if(categories[i].disabled == "disabled")
						option.disabled = "disabled";
					var select = document.getElementById("what-select");
					select.appendChild(option);
						
				}
			}
            
			createCategories();
            
			function pageSnap(){
                setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
			}
            
			pageSnap();
		</script>

        <script type="text/javascript">
        	blipsCompleteExecutedSuccessfully = false;
            
            function afterBlipping() {
                var splash = document.getElementById("splashBackground");
                splash.parentNode.removeChild(splash);
                DeviceReady();
                verifyInternet(function() {
                    $(document).trigger("blipsComplete");
                });
                
            }
            
            function blipsRotate() {
            
                if(screen.height <= 480) { // iphone 4 == 480
                	var splash = document.getElementById("splashImg-iPhone4");
             		var blipImages = [
                    				'images/splash-iphone4-1.jpg',
                                    'images/splash-iphone4-2.jpg',
                                    'images/splash-iphone4-3.jpg',
                                    'images/splash-iphone4-4.jpg'
                                	];
                }
                else {
                	var splash = document.getElementById("splashImg-iPhone5");
                	var blipImages = [
                    				'images/splash-iphone5-1.jpg',
                                    'images/splash-iphone5-2.jpg',
                                    'images/splash-iphone5-3.jpg',
                                    'images/splash-iphone5-4.jpg'
                              	 	];
                }
                splash.style.left = 0;
                var index = 0;
                var blipping = setInterval(function() {
                    if( index == 0 ) {
                        splash.src=blipImages[0];
                        if(navigator.splashscreen) {
                            navigator.splashscreen.hide();
                        }
                    }
                    else if( index == blipImages.length ) {
                        clearInterval(blipping);
                        afterBlipping();
                    }
                    else {
                        splash.src=blipImages[index];
                    }
                    index++;
                }, 400);
            }
            
        </script>
  	  <script type="text/javascript">
        	Array.prototype.diff = function(a) {
    			return this.filter(function(i) { return !(a.indexOf(i) > -1); });
			};
        	document.addEventListener("deviceready", onDeviceReady, false);
          
            // check connection function from phonegap api
            //
            function checkConnection() {
					if(!isPhoneGap)
						return navigator.onLine;
					var networkState = navigator.network.connection.type;

					var states = {};
					states[Connection.UNKNOWN]  = -1;	// 'Unknown connection';
					states[Connection.NONE]     = 0; 	// 'No network connection';
					states[Connection.ETHERNET] = 1;	// 'Ethernet connection';
					states[Connection.WIFI]     = 2; 	// 'WiFi connection';
					states[Connection.CELL_2G]  = 3; 	// 'Cell 2G connection';
					states[Connection.CELL_3G]  = 4; 	// 'Cell 3G connection';
					states[Connection.CELL_4G]  = 5; 	// 'Cell 4G connection';
					
					return states[networkState];
            }
            
            // verify the internet works so that we can process whatever request the user sent
            //
            function verifyInternet( successCallback ) {
            	if(checkConnection() <= 0) {
                    if(successCallback) {
                        new xAlert("Please verify that you are connected to the internet and retry",
                            function( button ){
                                if(button == 2) {
                                    return verifyInternet( successCallback );
                                }
                                else if(button == 1) {
                                    return false
                                }
                            },
                            "",
                            "Cancel,Retry"
                        );

                    }
					else{
                   		return false
                    }
                }
                else {
            		if(successCallback)
                		return successCallback();
                   	else
                   		return true;
                }
            }
            
            // phonegap's ready function.  Immediately begin blipping the sevacall loader
            //
        	function onDeviceReady(){
				if(isPhoneGap)
					blipsRotate();
                else
                	DeviceReady();
                // load a script asynchronously
                //
            	function async(u, c) {
                    var d = document, 
                    t = 'script',
        			z = 'text/javascript';
                    s = d.getElementsByTagName(t)[0];
                    o = d.createElement(t);
                    o.type = z;
                    o.src = u;
                    if (c) { o.addEventListener('load', function (e) { APIsLoaded.push(u); c(null, e); }, false); }
                    s.parentNode.insertBefore(o, s);
                }
                
                // load scripts asynchronously in succession (halting each other, but not the page)
                //
                function asyncInSuccession(list, callback, opt_recurseIndex) {
                    var index = opt_recurseIndex ? opt_recurseIndex : 0;
					if(index < list.length) {
						async(list[index], function(){
							console.log("loaded");
							asyncInSuccession(list, callback, ++index);
							if(callback && index == list.length) {
									callback();
							}
						});
					}
                }
                
                // load scripts asynchronously in parallel (neither halting each other nor the page
                //
                function asyncInParallel(list, callback) {
                    var numLoaded = 0,
                        length = list.length;
                    for(var i = 0; i < length; i++){
                        var scr = list[i];
                        async(scr, function(scr) {
                            numLoaded++;
                            console.log("another api loaded");
                            if((numLoaded == length) && callback){
                                callback();
                            }
                        });
                    }
                }
                
                // must load jQuery, then OOVACall, then google maps, then everything else in parallel
                //
            	var toLoadInSuccession = [
            		//'js/jQuery-1.9.1.js',
               		//'js/OOVACall.js',
                	//'http://maps.google.com/maps/api/js?key=AIzaSyBHtVxQeYDw2uzrMXpbkqnfqkftcjo-B3Y&sensor=false&callback=loadAllOtherAPIs'
                ];
                
                // none of these rely on each other so load them all at the same time
                //
                var toLoadInParallel = [
                    //'js/xMarker.js',
                    //'js/fastClickUnaltered.js',
                    //'js/xValidate.js',
                    //'js/xAlert.js',
                    //'js/infobox.js',
                    //'js/ios-orientationchange-fix.js',
					//'//connect.facebook.net/en_US/all.js'
                ];
            }
        	
			if(!isPhoneGap) {
				window.onload = function(){
					onDeviceReady();
				}
			}
            
			//onDeviceReady();
		</script>
		<script type="text/javascript">
            function loadMapsPlugins(){
            	$.getScript("js/infobox.js", function(){
                	$.getScript("js/xMarker.js");
                })
            }
            // my custom tracking method which logs when a track is taking place
            //
			function TRACK(action, category, opt_label, opt_value, opt_noninteraction) {
				// note action and category are backwards so that my TRACK method only has to submit the ACTION as a single parameter.
				if(TRACKING) {
					console.log("tracking: " + action.replace("timetable", "calendar").replace("final","step4").toUpperCase());
					_gaq.push(['_trackEvent', (category || "v3test"), action.replace("timetable", "calendar").replace("final","step4").toUpperCase(), opt_label, opt_value, opt_noninteraction]);
				}
			}
            
            // if tracking set to true, load up google analytics
            //
			if(TRACKING) {
				var _gaq = _gaq || [];
				_gaq.push(['_setAccount', GA_TRACKING_ID]);
				_gaq.push(['_trackPageview']);
				
				(function() {
					var ga = document.createElement('script'); 
					ga.type = 'text/javascript'; 
					ga.async = true;
					ga.src = "js/ga.js";
					var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
				})();
			}
		</script>
		<script src="http://maps.google.com/maps/api/js?v=3.13&key=AIzaSyBHtVxQeYDw2uzrMXpbkqnfqkftcjo-B3Y&sensor=false&callback=loadMapsPlugins"></script>
    
		<script src="js/fastClickUnaltered.js"></script>
        <script type="text/javascript">
            var loadFastClick = setInterval(function(){
                if(typeof FastClick == "function"){
                    console.log("FastClick instantiated");
                    new FastClick(document.querySelector("body"));
                    clearInterval(loadFastClick);
                }
                else {
                    console.log("FastClick not instantiated yet, checking again...");
                }
            }, 1000);
        </script>
</body>
</html>