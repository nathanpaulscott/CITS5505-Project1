//this is global code
//#################################################################################
//Tag Collapse Code
//#################################################################################
function collapse_all(){
	//code to handle the collapse all function
	var x = document.getElementsByClassName("multicollapse");
	for (var i=0;i<x.length;i++){
		if (x[i].classList.contains("show")){
			x[i].classList.remove("show");
		}
	}
}


function expand_all(){
	//code to handle the expand all function
	var x = document.getElementsByClassName("multicollapse");
	for (var i=0;i<x.length;i++){
		if (!x[i].classList.contains("show")){
			x[i].classList.add("show");
		}
	}	
}

//assign event handlers to the collapsible elements
document.getElementById("collapse_text").onclick = collapse_all;
document.getElementById("expand_text").onclick = expand_all;



//This code is specific to the project1-js.html sheet
$(document).ready(function() {
	if (window.location.pathname.search(/\/project1-js\.html$/i) != -1) {
		//#################################################################################
		//Ajax code
		//#################################################################################
		function getData() {
			//AJAX async get function
			console.log("starting new Ajax update");
			var req = new XMLHttpRequest();
			req.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var data = JSON.parse(this.responseText);
					document.getElementById("ajax").innerHTML = data['latest']['deaths'];
					ajax_element_update_finish();
					//write some debug info for interests sake
					document.getElementById("ajax_debug").innerHTML = "Successfully Updated via Ajax";
				}
			};
			document.getElementById("ajax_debug").innerHTML = "Starting Ajax Update";
			ajax_element_update_start();
			req.open("GET", "https://coronavirus-tracker-api.herokuapp.com/v2/locations", true);
			req.send();
		}


		function ajax_element_update_finish() {
			//Fade the data text to white slowly
			var elem = document.getElementById("ajax")
			elem.style.color="rgb(230,230,230)";
			elem.style.transitionTimingFunction="ease-in-out";
			elem.style.transitionDelay="0s";
			elem.style.transitionDuration="5s";
		}

		function ajax_element_update_start() {
			//reset the data text to red quickly
			var elem = document.getElementById("ajax")
			elem.style.color="red";
			elem.style.fontWeight=700;
			elem.style.transitionTimingFunction="ease-in-out";
			elem.style.transitionDelay="0s";
			elem.style.transitionDuration="0.4s";
		}


		//This code is for starting the 5s ajax refresh timer when the section is expanded and stops it when collapsed.  
		//It basically polls the state of the tag every second and acts based on it's state.  
		//Probably a bad idea to have it polling anything so frequently, but this is just an example
		//#############################################################
		function addClassListener(elemId, callback1, callback2) {
			//ref:https://stackoverflow.com/questions/10612024/event-trigger-on-a-class-change?lq=1
			//this adds a listener to the tag with the given id and polls it every 1 sec for a class change which will trigger an callback
			//the time units for the polling are ms
			var elem = document.getElementById(elemId);
			var prevClassList = elem.classList.value;
			poller = window.setInterval( function() {   
				if (elem.classList.contains("show") && elem.classList.value !== prevClassList) {
					prevClassList = elem.classList.value;
					callback1();   
				}
				else if (!elem.classList.contains("show") && elem.classList.value !== prevClassList) {
					prevClassList = elem.classList.value;
					callback2();
				}
			},1000);
		}

		function addTimer() {
			//starts the data refresh interval timer
			console.log("start data refresh timer");
			getData();
			refresher = window.setInterval(getData, 5000);
		}

		function remTimer() {
			//stops the data refresh interval timer
			console.log("stop data refresh timer");
			try{
				clearInterval(refresher);
			}
			catch(err){}
		}

		//This adds the class change listener to the "p3" tag, so if the section is expanded, the timer starts, 
		//if the section is collapsed, it is removed
		//#################################################################################
		addClassListener("p3", function(){addTimer("refresher");}, function(){remTimer("refresher");});
		//#################################################################################



		//#################################################################################
		//jquery-ui sortable code
		//#################################################################################

		//this enables the drag and drop functionality for the sortable list
		$(function() {
			$("#sortable").sortable();
			$("#sortable").disableSelection();
		});

		//This does the refreshing of the list translation after an update
		$(function() {
			$('#sortable').sortable({
					update: function() {
						refresh_list();
					}
			});
		});

		//this refreshes the horizontal list from the vertical list in the sortable example
		document.body.addEventListener("load", refresh_list());
		function refresh_list() {
			var x = document.getElementById("sortable").getElementsByTagName("li");
			var list = '[' + x[0].innerHTML + ', ';
			for (var i=1;i<x.length-1;i++){
				list = list + x[i].innerHTML + ', ';	
			}
			list = list + x[x.length-1].innerHTML + ']';	
			$("#list").text(list);
		};

		//#################################################################################
		//#################################################################################



		//#################################################################################
		//validation code
		//#################################################################################
		//sets up the instruction pop-over for the validation demo
		//$(function () {
		$('.instructions-pop').popover({
			container: 'body',
			html: true,
			trigger: 'click, hover',
			placement: 'top',
			title: 'Instructions',
			content: function() {return $('#instructions-pop-content').html();}
		})

		//assign the onchange event listener and handler to process the file selected from the file select button
		document.getElementById('textfile').onchange = function() {
			//this code basically parses the text file and does validation
			var file = this.files[0];
			var reader = new FileReader();
			
			function is_eol(x){
				//checks if we got an End of Line character
				if (x == '\n' | x == '\r') {
					return true;
				}
			}
			
			reader.onload = function(event) {
				//this parses the text file the hard way, i.e. char by char, I could not find any way to do it line by line
				//setup our variables
				var params = {"Name":false,"DOB":false,"Citizenship":false,"Age":false}  //these are our desired params to find
				var line_data = '';
				var file_data = event.target.result;
				var dump_flag = false;
				var len = file_data.length;
				//read each char and process accordingly
				for (var i=0; i<len; i++) {
					//check for end of line and accumulate data
					if (is_eol(file_data[i]) & line_data.length > 0) {
						//set the dump flag
						dump_flag = true;
					}
					else if (!is_eol(file_data[i])) {
						//accumulate the line
						line_data += file_data[i];
						//check for the case we got to the end of file with no new line char
						if (i == len-1) {
							dump_flag = true;
						}
					}
					
					//dump line if required
					if (dump_flag) {
						//dump the line
						//clean up the line
						line_data = line_data.trim();
						
						//line validation here
						if (line_data.search(/^(Name|DOB|Citizenship|Age):[A-Za-z0-9_\s\/]*$/i) == -1){
							$("#bulk-input").html('A line in your file has incorrect format: ' + line_data);
							return;    // inform user and abort
						}
						
						//value validation here
						if (line_data.search(/^Name:/i) !== -1) {
							params["Name"] = line_data.slice(5,);   //no validation required, we already did the allowed character check in the line validation
						}
						else if (line_data.search(/^DOB:/i) !== -1) {
							params["DOB"] = line_data.slice(4,);
							var test = params["DOB"].split('/')
							if (test.length !== 3 | isNaN(Date.parse(test[1] + '/' + test[0] + '/' + test[2]))) {
								$("#bulk-input").html('Your DOB is not an accepted date format (dd/mm/yyyy): ' + params["DOB"]);
								return;  // inform user and abort
							}
							if (Date.parse(test[1] + '/' + test[0] + '/' + test[2]) > Date.now()) {
								$("#bulk-input").html('Your DOB is in the future: ' + params["DOB"]);
								return;  // inform user and abort
							}
							if (Date.now() - Date.parse(test[1] + '/' + test[0] + '/' + test[2]) > 110*3600*1000*24*365) {
								$("#bulk-input").html('Your DOB is over 110 year ago: ' + params["DOB"]);
								return;  // inform user and abort
							}
						}
						else if (line_data.search(/^Citizenship:/i) !== -1) {
							params["Citizenship"] = line_data.slice(12,);
							var country_list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
							if (!country_list.includes(params["Citizenship"])) {
								$("#bulk-input").html('Your citizenship needs to be to a known country: ' + params["Citizenship"]);
								return;  // inform user and abort
							}
						}
						else if (line_data.search(/^Age:/i) !== -1) {
							params["Age"] = line_data.slice(4,);
							var test = parseInt(params["Age"],10);
							if (test < 0 | test > 110) {
								$("#bulk-input").html('Your Age is not realistic: ' + params["Age"]);
								return;  // inform user and abort
							}
							
						}
						
						//reset the line var
						dump_flag = false;
						line_data = '';
					}
				}

				//check we filled all required fields in our params object
				var unfilled = Object.keys(params).filter(function (x) {return params[x] == false});
				if (unfilled.length > 0) {
					//document.getElementById('bulk_input').innerHTML = 'Missing field/s: ' + unfilled.toString();
					$("#bulk-input").html('Missing field/s: ' + unfilled.toString());
					return  // inform user and abort
				}
				
				//if we got here, we passed our validation checks, so we accept the data
				var d = JSON.stringify(params);
				d = d.replace(/,/g,'<br/>');
				$("#bulk-input").html('input ok<br/>-----------<br/>' + d);
			};
			
			//read the file
			reader.readAsText(file);
		};
	}
})
