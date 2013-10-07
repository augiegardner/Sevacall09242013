/*! A fix for the iOS orientationchange zoom bug.
 Script by @scottjehl, rebound by @wilto.
 MIT / GPLv2 License.
*/
(function(w){
	//testing purposes, known bug: release finger while scrolling fast and tilt the screen immediately.  attempted to fix: failed.
	//window.onscroll = function( e ){ disableZoom(); alert(document.getElementById("actionbutton")); document.getElementById("actionbutton").innerHTML += "!!!"  };
	//document.addEventListener("touchmove", function(){ disableZoom(); document.body.style.color = "red" });
	// This fix addresses an iOS bug, so return early if the UA claims it's something else.
	var ua = navigator.userAgent;
	if( !( /iPhone|iPad|iPod/.test( navigator.platform ) && /OS [1-5]_[0-9_]* like Mac OS X/i.test(ua) && ua.indexOf( "AppleWebKit" ) > -1 ) ){
		return;
	}

    var doc = w.document;

    if( !doc.querySelector ){ return; }

    var meta = doc.querySelector( "meta[name=viewport]" ),
        initialContent = meta && meta.getAttribute( "content" ),
        disabledZoom = initialContent + ",maximum-scale=1",
        enabledZoom = initialContent + ",maximum-scale=10",
        enabled = true,
		x, y, z, aig;

    if( !meta ){ return; }

    function restoreZoom(){
		//setTimeout(function(){
			meta.setAttribute( "content", enabledZoom );
			enabled = true;
		//, 500);
    }

    function disableZoom(){
		meta.setAttribute( "content", disabledZoom );
		enabled = false;
    }

    function checkTilt( e ){
		aig = e.accelerationIncludingGravity;
		x = Math.abs( aig.x );
		y = Math.abs( aig.y );
		z = Math.abs( aig.z );

		// If portrait orientation and in one of the danger zones
        if( (!w.orientation || w.orientation === 180) && ( x > 6 || ( ( z > 5 && y < 9 || z < 9 && y > 5 ) && x > 4 ) ) ){
			
			if( enabled ){
				//testing purposes
				//document.body.style.color = "red";
                /*
 document.getElementById("head").style.position = "absolute";
 document.getElementById("head").style.top = window.pageYOffset;
 */
                //$("#head").css({"position", "absolute", "background" : "red"});
				disableZoom();
			}        	
        }
		else if( !enabled ){
 /*
 document.getElementById("head").style.position = "fixed";
 document.getElementById("head").style.top = "0px";
 */
			//testing purposes
			//document.body.style.color = "black";
            //document.
             //   $("#head").css({"position", "fixed", "background" : "blue"});
			restoreZoom();
        }
    }

	w.addEventListener( "orientationchange", restoreZoom, false );
	w.addEventListener( "devicemotion", checkTilt, false );

})( this );