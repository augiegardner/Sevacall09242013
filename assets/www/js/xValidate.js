
/*

xMask : Does not work on MOBILE only.

Instantiated with:
			var mask = new infoMask($(input), "(___) ___-____");

function setCaratPosition(elemId, caretPos) {
    var elem = elemId;//document.getElementById(elemId);

    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
}

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

(function($) {
	$.fn.getCursorPosition = function() {
		var input = this.get(0);
		if (!input) return; // No (input) element found
		if (document.selection) {
			// IE
		   input.focus();
		}
		return 'selectionStart' in input ? input.selectionStart:'' || Math.abs(document.selection.createRange().moveStart('character', -input.value.length));
	}
})(jQuery);

function infoMask(inputObj, mask) {
	this.subject = inputObj;
	this.value = ($(this.subject)[0]).value;
	this.mask = mask;
	this.position = 0;
	this.skippedCharacters = ["(", ")", " ", "-"];
	this.validCharacters = ["0","1","2","3","4","5","6","7","8","9"];
	this.init();
}

infoMask.prototype =  {

	init 			: function() {
						var self = this;
						$(self.subject).val(self.mask);
						
						$(self.subject).click(function(){self.position = ($(this).getCursorPosition());});
						$(self.subject).keyup(function(){self.position = ($(this).getCursorPosition());});
						
						$(self.subject).keypress(function( e ) {
							var key = String.fromCharCode( e.which );
							
							if(self.validCharacters.indexOf(key) != -1) {
								var currChar = self.getCharacter();
								
								if (e.which !== 0) {
									while(self.skippedCharacters.indexOf(currChar) != -1){
										self.skipCharacter();
										currChar = self.getCharacter();
									}
									
									self.typeCharacter( key );
									self.checkLength();
								}
							}
							e.stopPropagation;
							return false;
						});
						
						$(self.subject).keydown(function( e ) {
							var text = document.activeElement.value;
							var selection = text.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
							
							if(e.which == "8") {
								if(selection.length > 0) {
									self.deleteSelection();
								}
								if(self.position <= 1) {
									e.stopPropagation;
									return false;
								}
								else {
									var currChar = self.getCharacter("backwards");
									while(self.skippedCharacters.indexOf(currChar) != -1){
										self.skipCharacter("backwards");
										currChar = self.getCharacter("backwards");
									}
									self.deleteBackwards();
								}
								e.stopPropagation;
								return false;
							
							}
							
							if(e.which == "46") {
								if(selection.length > 0) {
									self.deleteSelection();
								}
								else
									self.deleteForwards();
								e.stopPropagation;
								return false;
							}
						
						});
					},
	deleteSelection : function() {
						var self = this;
						var x = window.getSelection();
						var length = x.toString().length;
						self.position+=length;
						
						for(var i = 0; i < length; i++) {
							var currChar = self.getCharacter("backwards");
					
							while(self.skippedCharacters.indexOf(currChar) != -1){
								self.skipCharacter("backwards");
								currChar = self.getCharacter("backwards");
							}
							self.deleteBackwards();
						}
					},
	checkLength		: function() {
						var self = this;
						if(($(self.subject)[0]).value.length > 14)
							($(self.subject)[0]).value = ($(self.subject)[0]).value.substring(0,14);
					},
					
	getCharacter	: function(backwards) {
						var self = this;
						var value = $(self.subject)[0].value;
						if(backwards)
							return value.charAt((self.position - 1));
						else 
							return value.charAt((self.position));
					},
					
	deleteForwards : function() {
						var self = this;
						($(self.subject)[0]).value = ($(self.subject)[0]).value.splice(self.position, 1, "_");
						setCaratPosition($(self.subject)[0], self.position);
	
					},
					
	deleteBackwards	: function() {
						var self = this;
						if(self.position > 1) {
							($(self.subject)[0]).value = ($(self.subject)[0]).value.splice(self.position-1, 1, "_");
							setCaratPosition($(self.subject)[0], --self.position);
						}
					},
					
	typeCharacter : function( key ) {
						var self = this;
						($(self.subject)[0]).value = ($(self.subject)[0]).value.splice(self.position, 1, key);
						setCaratPosition($(self.subject)[0], ++self.position);
						self.checkLength();
				},
	skipCharacter : function(backwards) {
					var self = this;
					if(backwards) 
						setCaratPosition($(self.subject)[0], --self.position);
					else
						setCaratPosition($(self.subject)[0], ++self.position);
				}
}

*/
function infoValidate(){
	this.subject = $("<div class='info-box sep'>");
	this.rows = [{name :"Name", type: "name", domel: ""}, {name :"E-mail", type: "email", domel: ""}, {name :"Phone", type: "phone", domel : ""}/*, {name :"iCal", type: "ical", domel : ""}*/];
	this.inputs = [{name : "Name", boolVar : "isNameValid", input: "", valid : ""}, {name : "E-mail", boolVar : "isEmailValid", input: "", valid : ""}, {name : "Phone", boolVar : "isPhoneValid", input: "", valid : ""}/*, {name : "iCal", boolVar : "isiCalValid", input: "", valid : ""}*/];
	this.emailValidate = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;;
	this.phoneValidate = /^(((\([\d]{3}\))( [\d]{3}-)))[\d]{4}|^[\d]{10}$/;
	this.nameValidate = /[a-zA-Z]{2,}/;
		
		this.name = "";
		this.email = "";
		this.phone = "";
	this.isNameValid = false;
	this.isEmailValid = false;
	this.isPhoneValid = false;
	this.previous = {};
    
	this.init();
}

infoValidate.prototype = {

	init	:	function() {
		var self = this;
		for(var i = 0; i < this.rows.length; i++) {	
			this.setInputType(this.inputs[i]);
			this.setValidType(this.inputs[i]);
			
			this.rows[i].domel = $("<div class='info-item "+this.inputs[i].name+" sep-text'>").append($("<div class='title-box'>").text(this.inputs[i].name)).append(this.inputs[i].input).append(this.inputs[i].valid);
			this.subject.append(this.rows[i].domel);
		}
		$("body").delegate("#isNameValid", "keyup", function() {
			self.name = $("#isNameValid").val();
			self.validate(self.inputs[0]); 
		});
		
		$("body").delegate("#isEmailValid", "keyup", function() {
			self.email = $("#isEmailValid").val();
			self.validate(self.inputs[1]); 
		});
		
		$("body").delegate("#isPhoneValid", "keyup", function() {
			self.phone = $("#isPhoneValid").val();
			self.validate(self.inputs[2]); 
		});
		
		// mask the phone input to look like a standard US number ((###) ###-####) ONLY after the user has left the input field, not during.
		// this InfoValidate object's self.phone value (the value we submit with OOvaCall) will still read the standard ########## number
		// because the only time the self.phone value changes is on keyup, but the keyups always occur when the number is formated as ##########.
		$("body").delegate("#isPhoneValid", "blur focus", function(e){
			var $this = $(this);
			if(e.type == "focusout") {
				$this.attr("data-raw", $(this).val());
				if($this.val().length == 10) {
					$this.val($this.val().replace(/([\d]{3})([\d]{3})([\d]{4})/, '($1) $2-$3'));
				}
			}
			else if(e.type == "focusin") {
				if($this.val().length == 10)
					$this.attr("data-raw", $this.val());
				$this.val($this.attr("data-raw"));
			}
		});
		
	},
    maskPhone		: function() {
						if(this.phone > 0 && this.phone != "" && this.phone != "NaN")
							this.phone = this.phone.replace(/([\d]{3})([\d]{3})([\d]{4})/, '($1) $2-$3');
						if(this.phone == "NaN")
							this.phone = "";
					},
					
    unMaskPhone		: function() {
    					if(this.phone != "")
							this.phone = String(parseInt(this.phone.replace(/[)( -]/g, "")));
					},
					
    cancel			:	function() {
    						var self = this;
                            self.name = self.previous.name;
                            self.email = self.previous.email;
                            self.phone = self.previous.phone;
                            self.paint();
    					},
                        
	paint 			:	function() {
    						var self = this;
                            self.inputs[0].input = self.name != null ? self.name : "";
                            self.validate(self.inputs[0]);
                            self.inputs[1].input = self.email != null ? self.email : "" ;
                            self.validate(self.inputs[1]);
                            self.inputs[2].input = self.phone != null ? self.phone : "";
                            self.validate(self.inputs[2]);
                            self.previous = { name : self.name, email : self.email, phone : self.phone };
							self.unMaskPhone();
							$("#isPhoneValid").attr("data-raw", self.phone);
							self.maskPhone();
    					},
                        
	setValidType : function(inputObj) {
                        var valid = $("<i>");
                        if(inputObj.name == "iCal") {
                            $(valid).attr("class", "iCal");
                        }
                        
                        inputObj.valid = valid;
                    },
	
	setInputType : function(inputObj) {
						var self = this;
                        var input = $("<div class='info-box-info-wrapper'>").append($("<input id = '" +inputObj.boolVar+"' class='info-box-text'/>"));
						
                        if(inputObj.name == "Phone") {
                            $(input).children().attr({"type" : "tel"});
                            $(input).children().attr({"maxlength" : "10"});
                        }
                        else if(inputObj.name == "Name") {
                            $(input).children().attr({"type" : "text"});
                            $(input).children().attr({"maxlength" : "100"});
                        }
                        else if(inputObj.name == "E-mail") {
                            $(input).children().attr({"type" : "email"});
                            $(input).children().attr({"maxlength" : "100"});
                        }
                        else {
                            input = "";
                        }
                        inputObj.input = input;
                    },
	
	setValid : function(inputObj) {
                    var self = this;
                    self[inputObj.boolVar] = true;
                    $(inputObj.valid).addClass("valid");
					$(document).trigger(inputObj.name + "IsValid");
                },
	
	setInvalid : function(inputObj) {
                    var self = this;
                    self[inputObj.boolVar] = false;
                    $(inputObj.valid).removeClass("valid");
                },
	
	validate : function(inputObj) {
                    var self = this;
                    var value, valid;
                    
                    if(inputObj.name == "Name") {
                        value = self.name;
                        valid = self.nameValidate;
                    }
                    else if(inputObj.name == "E-mail") {
                        value = self.email;
                        valid = self.emailValidate;
                    }
                    else if(inputObj.name == "Phone") {
                        value = self.phone;
                        valid = self.phoneValidate;
                    }
                    else 
                        return true;
                    
                    if(typeof value == "undefined" || value == null) {
                        self.setInvalid(inputObj);
                        return false;
                    }
                        
                    valid = valid.test(value);
                    
                    if(valid) {
                        self.setValid(inputObj);
                        return true;
                    }
                    else {
                        self.setInvalid(inputObj);
                        return false;
                    }
                },
    
	delegateKeyup : function (inputObj, type) {
                        var self = this;
                        $("body").delegate(inputObj.input, "keyup", function() {
                            self.validate(inputObj); 
                        });
                    }
}

// moved instantiation to document ready function, so that we are guaranteeing there is a body element before these items are delegated to the body.  This was a problem in phonegap specifically
//var IV = new infoValidate();