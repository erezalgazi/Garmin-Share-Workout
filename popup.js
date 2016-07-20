
var workoutFlowArray = [];
var workoutFlow;

//this event handles the file loading and its content (data in the json file)
document.getElementById('fileinput').addEventListener('change', function () {
  var file = document.getElementById('fileinput').files[0];
  // console.log(file);
  if (!file) {
    document.getElementById('btnLoad').style.display = "none";
    workoutFlow = '';  
    // console.log('ttt');
  }
  else if (file.name.indexOf('.json') != -1) {
    document.getElementById('btnLoad').style.display = "block";
    document.getElementById('btnShare').style.display = "none";
    document.getElementById('only-running').style.display = "none";
    document.getElementById('more-than2-not-yet-supported').style.display = "none";
    document.getElementById('not-logged-in-error').style.display = "none";
    document.getElementById('general-error').style.display = "none";
    document.getElementById('only-json').style.display = "none";
    document.getElementById('download-success').style.display = 'none';
    var fr = new FileReader();
    fr.readAsText(file);
    // console.log(fr)
    fr.onload = function() {
      workoutFlow = fr.result;
      workoutFlow = workoutFlow.replace(/^"(.*)"$/, '$1');
      // workoutFlow = JSON.parse(workoutFlow);
      // console.log(workoutFlow);
    };
  }
  else if (file.name.indexOf('.json') === -1) {
    // console.log('dddd');
    $('#fileinput').val('');
    document.getElementById('btnLoad').style.display = "none";
    document.getElementById('only-json').style.display = "block";
    document.getElementById('alerts-div').style.margin = "5px 0px -25px";
  }
});

//this event simply redirects when the go to workout link on the explanations is clicked
document.getElementById('goto-workouts').addEventListener('click', function(){
  chrome.tabs.getSelected(null, function(tab) {
    // console.log(tab);
    if (tab.url.substring(0 ,34) === "https://connect.garmin.com/modern/") {
      chrome.tabs.update(tab.id, {url:"https://connect.garmin.com/modern/workouts"});
      // document.getElementById('btnShare').disabled = false;
    }
    else {
      chrome.tabs.create({url:"https://connect.garmin.com/modern/workouts", active: true});
    }
  });
});

//this events shows the share button when on a legitimate workout, and extract all the data from this workout to be put in a file
chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
  if ((tabs[0].url.substring(0 ,42) === "https://connect.garmin.com/modern/workout/") && (!(isNaN(Number(tabs[0].url.substring(42,43)))))) {
    // document.getElementById('btnShare').disabled = false;
    document.getElementById('btnShare').style.display = "block";
    // var onlyRunning = "var workoutTypes = []; workoutTypes.push(document.getElementsByClassName('icon-activity-running')[0]); workoutTypes.push(document.getElementsByClassName('icon-activity-cycling')[0]); workoutTypes";
    // chrome.tabs.executeScript(null, {code: onlyRunning}, function(types) {
    //   // console.log(types);
    //   if (types[0][0] === null) {
    //     document.getElementById('btnShare').style.display = "none";
    //     document.getElementById('only-running').style.display = 'block';
    //     document.getElementById('alerts-div').style.margin = '5px 0px -25px';
    //   }
    // });
    var workoutHackCode = "var data = []; data.push(document.getElementsByClassName('workout-summary')[0].innerHTML); ";
    workoutHackCode += "for (var k=0; k<document.getElementsByClassName('block-repeat').length; k++) {data.push(document.getElementsByClassName('block-repeat')[k].innerHTML);} ";
    workoutHackCode += "data.push(document.getElementsByClassName('inline-edit-target')[0].innerHTML); ";
    workoutHackCode += "var workoutTypes = []; workoutTypes.push(document.getElementsByClassName('icon-activity-running')[0]); workoutTypes.push(document.getElementsByClassName('icon-activity-cycling')[0]); ";
    workoutHackCode += "data.push(workoutTypes); data";
    chrome.tabs.executeScript(null, {code: workoutHackCode}, function(results) {
      // console.log(results);
      if ((results[0][results[0].length-1][0] === null) && (results[0][results[0].length-1][1] === null)) {
        document.getElementById('btnShare').style.display = "none";
        document.getElementById('only-running').style.display = 'block';
        document.getElementById('alerts-div').style.margin = '5px 0px -25px';        
      }
      arrrangeWorkout(results[0]);
    });
  }
});

$('body').on('click', '#btnShare', function() {
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workoutFlowArray)); 
  // console.log(data);
  $('<a href="data:' + data + '" download = "' + workoutFlowArray[workoutFlowArray.length-2].workoutName + '.json" id="dl-id">download JSON</a>').appendTo('#dl');
  document.getElementById('dl-id').click();
  document.getElementById('btnShare').style.display = 'none';
  setTimeout(function(){
    document.getElementById('download-success').style.display = 'block';
    document.getElementById('alerts-div').style.margin = "5px 0px -25px";
  },300);
});



var arrrangeWorkout = function (savedHtmlArray) {
  // console.log(savedHtmlArray);
  var stepsArray = [];
  var stepsNumberInRepeat = [];
  var count = 0;
  var counter = 0;
  var regexRepeat = /block-repeat/gi, result, repeats = [];
  // this block collects all the repeats main block indexes and also an array of the repeats with number of steps 
  // and first index (out of all the steps of the workout) in each of them
  while ((result = regexRepeat.exec(savedHtmlArray[0]))) {
    count++;
    repeats.push(result.index);
    stepsNumberInRepeat.push({len: (savedHtmlArray[count].match(/workout-step-inner/g)||[]).length, firstIndex: null});
    if (stepsNumberInRepeat[count-1].len>2) {
      document.getElementById('btnShare').style.display = "none";
      document.getElementById('more-than2-not-yet-supported').style.display = 'block';
      document.getElementById('alerts-div').style.margin = '5px 0px -25px';
    }
  }
  // this block collects all the indexes of all the steps types of the workout, including repeats
  var regexType = /workout-step /gi, result, indices = [];
  while ( (result = regexType.exec(savedHtmlArray[0])) ) {
    indices.push(result.index);
  }
  // this block collects all the indexes of all the steps durations of the workout, including repeats
  var regexDuration = /workout-step-inner/gi, result, durations = [];
  while ( (result = regexDuration.exec(savedHtmlArray[0])) ) {
    durations.push(result.index);
  }
  // console.log('types: ', indices, 'durations: ', durations, 'repeats: ', repeats, 'steps each repeat: ', stepsNumberInRepeat);
  // this loop finds the where the first index of each repeat is located relative to all the steps of the workout (sorting in
  // other words)
  for (var r=0; r<repeats.length; r++) {
    var low=0; var high = indices.length;
    while(low != high) {
      var mid = Math.floor((low+high)/2);
      if (indices[mid] <= repeats[r]) {low = mid +1;}
      else {high = mid;}
    }
    stepsNumberInRepeat[r].firstIndex = low;
    // indices.splice(low,stepsNumberInRepeat[r]);
    // durations.splice(low,stepsNumberInRepeat[r]);
  }
  // console.log('types: ', indices, 'durations: ', durations, 'repeats: ', repeats, 'steps each repeat: ', stepsNumberInRepeat);
  for (var i=0; i<indices.length; i++) {
    var type = savedHtmlArray[0].substring(indices[i]+35, indices[i]+43);
    // console.log(type);
    type = type.substring(0, type.lastIndexOf('"'));
    type = mapTableType(type);
    var duration = savedHtmlArray[0].substring(durations[i]+20, durations[i]+50);
    duration = duration.substring(0, duration.lastIndexOf('/')-1);
    // console.log(duration);
    duration = mapTableDuration(duration);
    // console.log(duration);
    // console.log(type, duration);
    if (counter < stepsNumberInRepeat.length && i >= stepsNumberInRepeat[counter].firstIndex && i <= (stepsNumberInRepeat[counter].firstIndex+stepsNumberInRepeat[counter].len-1)) {
      stepsArray.push({stepType: type, stepDuration: duration});
      if (i === stepsNumberInRepeat[counter].firstIndex+stepsNumberInRepeat[counter].len-1) {
        var repeat = savedHtmlArray[0].substring(repeats[counter]+135, repeats[counter]+138);
        repeat = repeat.substring(0, repeat.lastIndexOf('<'));
        // console.log(repeat);
        workoutFlowArray.push({steps: stepsArray, repeat: Number(repeat)});
        stepsArray = [];
        counter++;
      }      
    }
    else {
      stepsArray.push({stepType: type, stepDuration: duration});
      workoutFlowArray.push({steps: stepsArray, repeat: 1});
      stepsArray = [];
    }
  }
  workoutFlowArray.push({workoutName: savedHtmlArray[savedHtmlArray.length-2]});
  if (savedHtmlArray[savedHtmlArray.length-1][0] != null) {
    workoutFlowArray.push({workoutType: 'running'});
  }
  else if (savedHtmlArray[savedHtmlArray.length-1][1] != null) {
    workoutFlowArray.push({workoutType: 'cycling'});
  }
  else {
    workoutFlowArray.push({workoutType: 'not-supported-yet'});
  }
  // console.log(workoutFlowArray);
  // $.post( "localhost:8000/workouts", JSON.stringify(stepsArray));
  // console.log(workoutFlowArray);

  // saveToLocalStorage(stepsArray);
  // JSON(stringify(stepsArray));
  // console.log(JSON.stringify(workoutFlowArray));
};





// var templateNoRepeat = function (type, val, unitVal, unitType) {
//   var hackCode = "var " + type +" = document.querySelectorAll('*[id^=\"duration-"+type+"-001\"]'); "+type+"["+type+".length-1].classList.add('dur-"+type+"-' + ("+type+".length-1)); ";
//   hackCode += "document.getElementsByClassName('dur-"+type+"-' + ("+type+".length-1))[0].value = " + val + "; ";
//   if (unitVal) {
//     hackCode += "document.getElementsByName('"+unitType+"')["+type+".length-1].value = " + unitVal + "; ";
//   }
//   return hackCode;    
// };


// var buildWorkout = function () {
//   // var theHackCode = "console.log('Hey You! motherfucker'); setTimeout(function () { "; 
//   // var theHackCode = "console.log('Hey You! motherfucker');  while (document.getElementsByClassName('step-delete')[0] === undefined) {setTimeout(function () {console.log('hi');},1000);} "; 
//   var theHackCode = "console.log('Hey You! motherfucker'); document.body.addEventListener('DOMNodeInserted', function(e){if (e.target.className==='workout-step workout-step-cool'){";
//   // var theHackCode = "console.log('Hey You! motherfucker'); $('body').on('DOMNodeInserted', '.workout-step-cool', function(){console.log('hi');";
//   theHackCode += "for (var j=0; j<3; j++) {document.getElementsByClassName('step-delete')[0].click();} ";
//   for (var i=0; i<workoutFlow.length; i++) {
//     if (workoutFlow[i].repeat === 1) {
//       theHackCode += "document.getElementById('new-step').click(); ";
//       theHackCode += "document.getElementsByClassName('select-step-type')[(document.getElementsByClassName('select-step-type').length-1)].value = " + workoutFlow[i].steps[0].stepType + "; ";
//       theHackCode += "document.getElementsByClassName('select-step-duration')[(document.getElementsByClassName('select-step-type').length-1)].value = " + workoutFlow[i].steps[0].stepDuration.durationType + "; ";
//       if (workoutFlow[i].steps[0].stepDuration.durationType === "'distance'") {
//         theHackCode += templateNoRepeat('distance', workoutFlow[i].steps[0].stepDuration.durationVal, workoutFlow[i].steps[0].stepDuration.durationUnits,'distanceUnit');
//         // console.log(theHackCode);
//       }
//       else if (workoutFlow[i].steps[0].stepDuration.durationType === "'heart.rate.zone'") {
//         theHackCode += templateNoRepeat('hr', workoutFlow[i].steps[0].stepDuration.durationVal, workoutFlow[i].steps[0].stepDuration.durationUnits, 'heart-rate-select');
//       }
//       else if (workoutFlow[i].steps[0].stepDuration.durationType === "'time'") {
//         theHackCode += templateNoRepeat('time', workoutFlow[i].steps[0].stepDuration.durationVal);
//         // theHackCode += "console.log(time);" ;
//       }
//       else if (workoutFlow[i].steps[0].stepDuration.durationType === "'calories'") {
//         theHackCode += templateNoRepeat('cal', workoutFlow[i].steps[0].stepDuration.durationVal);
//       }
//       // chrome.tabs.executeScript(tab.id, {code: theHackCode}, function(results) {
//       // });
//     }
//     else {
//       var stepsLen = workoutFlow[i].steps.length;
//       theHackCode += "document.getElementById('new-repeat').click(); ";
//       if (workoutFlow[i].repeat > 2) {
//         for (var q=0; q<(workoutFlow[i].repeat-2); q++) {
//           theHackCode += "document.getElementsByName('repeat-more')[(document.getElementsByName('repeat-more').length-1)].click(); ";
//         }
//       }
//       if (stepsLen === 1 || stepsLen === 2) {
//         if (stepsLen === 1) {
//           theHackCode += "document.getElementsByClassName('step-delete')[document.getElementsByClassName('step-delete').length-1].click(); ";
//           // console.log(theHackCode);
//           // debugger;
//         }
//         for (var y=0; y<stepsLen; y++) {
//           // debugger;
//           theHackCode += "document.getElementsByClassName('select-step-type')[(document.getElementsByClassName('select-step-type').length-"+(stepsLen-y)+")].value = " + workoutFlow[i].steps[y].stepType + "; ";
//           theHackCode += "document.getElementsByClassName('select-step-duration')[(document.getElementsByClassName('select-step-duration').length-"+(stepsLen-y)+")].value = " + workoutFlow[i].steps[y].stepDuration.durationType + "; ";
//           if (workoutFlow[i].steps[y].stepDuration.durationType === "'distance'") {
//             theHackCode += "var dist = document.querySelectorAll('*[id^=\"duration-distance-001\"]'); dist[dist.length-"+(stepsLen-y)+"].className='input-small dur-dist-' + (dist.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-dist-' + (dist.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
//             theHackCode += "document.getElementsByName('distanceUnit')[dist.length-"+(stepsLen-y)+"].value = " + workoutFlow[i].steps[y].stepDuration.durationUnits + "; "; 
//           }
//           else if (workoutFlow[i].steps[y].stepDuration.durationType === "'heart.rate.zone'"){
//             theHackCode += "var hr = document.querySelectorAll('*[id^=\"duration-hr-001\"]'); hr[hr.length-"+(stepsLen-y)+"].className='input-mini dur-hr-' + (hr.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-hr-' + (hr.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
//             theHackCode += "document.getElementsByName('heart-rate-select')[hr.length-"+(stepsLen-y)+"].value = " + workoutFlow[i].steps[y].stepDuration.durationUnits + "; ";
//           }
//           else if (workoutFlow[i].steps[y].stepDuration.durationType === "'time'") {
//             theHackCode += "var time = document.querySelectorAll('*[id^=\"duration-time-001\"]'); time[time.length-"+(stepsLen-y)+"].className='input-small duration-time dur-time-' + (time.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-time-' + (time.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
//           }
//           else if (workoutFlow[i].steps[y].stepDuration.durationType === "'calories'") {
//             theHackCode += "var cal = document.querySelectorAll('*[id^=\"duration-cal-001\"]'); cal[cal.length-"+(stepsLen-y)+"].className='input-mini dur-cal-' + (cal.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-cal-' + (cal.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";            
//           }
//         }
//       }
//       else {
//         theHackCode += "var selected = null; "; 
//         for (var x=2; x<stepsLen; x++) {
//           theHackCode += "document.getElementById('new-step').click(); ";
//         }
//         // theHackCode += "define([\"localizer\",\"pages/workouts/util/Types\",\"pages/workouts/util/StepUtil\"],function(e,t,n){function r(e){this.heartZones=e,this.heartZones&&(this.stepUtil=new n({sportType:t.SportTypes.Running,heartZones:this.heartZones}))}return r.prototype.getOptions=function(){return{AutoAddRestStepAfterSteps:!1,CanDeleteStepsInsideRepeater:!0,CanSortStepsInsideRepeater:!0,MaxSteps:50,MaxNestedRepeats:0,DefaultRepeatIteration:3,MinRepeatIteration:2,MaxRepeatIteration:40}},r.prototype.getHeartRateGroupOptions=function(){var r=[],i=this.stepUtil.getZones(this.userZones,t.SportTypes.Running);if(i){var s=this.stepUtil.getHeartRateZoneCount();for(var o=1,u=s;o<u;o+=1)r.push({value:t.TargetTypes.Heart_Rate_Zone,text:e.localize(\"workout.step.target.type.heart.zone.list.no.zone.value\",o,e.localize(\"workout.step.target.heart.zone.name.\"+o)),\"class\":\"\",data:o})}return r},r.prototype.getStepSelectOptions=function(){return{StepType:{Warm_Up:{value:t.StepTypes.Warm_Up,text:\"workout.stepType.warmup\",\"class\":\"\",data:\"workout-step-warm\"},Interval:{value:t.StepTypes.Interval,\"class\":\"workout-step-run\",text:\"workout.run\",data:\"interval\"},Recovery:{value:t.StepTypes.Recovery,text:\"workout.stepType.recovery\",\"class\":\"\",data:\"workout-step-recover\"},Rest:{value:t.StepTypes.Rest,text:\"workout.stepType.rest\",\"class\":\"\",data:\"workout-step-rest\"},Cool_Down:{value:t.StepTypes.Cool_Down,text:\"workout.stepType.cooldown\",\"class\":\"\",data:\"workout-step-cool\"},Other:{value:\"other\",text:\"workout.step.type.other\",\"class\":\"\",data:\"workout-step-other\"}},Duration:{No_Duration:{value:t.DurationTypes.No_Duration,text:\"workout.step.duration.type.no.duration\",\"class\":\"\",data:\"\"},Time:{value:t.DurationTypes.Time,text:\"workout.step.duration.type.time\",\"class\":\"\",data:\"time\"},Distance:{value:t.DurationTypes.Distance,text:\"workout.step.duration.type.distance\",\"class\":\"\",data:\"distance\"},Lap_Button:{value:t.DurationTypes.Lap_Button,text:\"workout.step.duration.type.lap.button\",\"class\":\"\",data:\"lap-button\"},Calories:{value:t.DurationTypes.Calories,text:\"workout.step.duration.type.calorie\",\"class\":\"\",data:\"cal\"},Heart_Rate_Zone:{value:t.DurationTypes.Heart_Zone,text:\"workout.step.duration.heart.rate.zone\",\"class\":\"\",data:\"-1\"}},Target:{No_Target:{value:t.TargetTypes.No_Target,text:\"workout.step.target.no.target\",\"class\":\"\",data:\"\"},Pace_Zone:{value:t.TargetTypes.Pace_Zone,text:\"workout.step.target.pace\",\"class\":\"\",data:\"pace\"},Speed_Zone:{value:t.TargetTypes.Speed_Zone,text:\"workout.step.target.speed\",\"class\":\"\",data:\"speed\"},Cadence:{value:t.TargetTypes.Cadence,text:\"workout.step.target.cadence\",\"class\":\"\",data:\"cadence\"},Heart_Rate_Zone:{value:t.TargetTypes.Heart_Rate_Zone,text:\"workout.step.target.custom.zones\",\"class\":\"\",data:\"-1\",groupData:this.getHeartRateGroupOptions(),groupLabel:\"workout.step.target.heart.rate.zones\",groupHelpText:\"workout.step.target\",groupClass:\"\"}}}},r.prototype.getTooltip=function(e){return null},r});";
//         for (var y=0; y<stepsLen; y++) {
//           // debugger;
//           theHackCode += "document.getElementsByClassName('select-step-type')[(document.getElementsByClassName('select-step-type').length-"+(stepsLen-y)+")].value = " + workoutFlow[i].steps[y].stepType + "; ";
//           theHackCode += "document.getElementsByClassName('select-step-duration')[(document.getElementsByClassName('select-step-duration').length-"+(stepsLen-y)+")].value = " + workoutFlow[i].steps[y].stepDuration.durationType + "; ";
//           if (workoutFlow[i].steps[y].stepDuration.durationType === "'distance'") {
//             theHackCode += "var dist = document.querySelectorAll('*[id^=\"duration-distance-001\"]'); dist[dist.length-"+(stepsLen-y)+"].className='input-small dur-dist-' + (dist.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-dist-' + (dist.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
//             theHackCode += "document.getElementsByName('distanceUnit')[dist.length-"+(stepsLen-y)+"].value = " + workoutFlow[i].steps[y].stepDuration.durationUnits + "; "; 
//           }
//           else if (workoutFlow[i].steps[y].stepDuration.durationType === "'heart.rate.zone'"){
//             theHackCode += "var hr = document.querySelectorAll('*[id^=\"duration-hr-001\"]'); hr[hr.length-"+(stepsLen-y)+"].className='input-mini dur-hr-' + (hr.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-hr-' + (hr.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
//             theHackCode += "document.getElementsByName('heart-rate-select')[hr.length-"+(stepsLen-y)+"].value = " + workoutFlow[i].steps[y].stepDuration.durationUnits + "; ";
//           }
//           else if (workoutFlow[i].steps[y].stepDuration.durationType === "'time'") {
//             theHackCode += "var time = document.querySelectorAll('*[id^=\"duration-time-001\"]'); time[time.length-"+(stepsLen-y)+"].className='input-small duration-time dur-time-' + (time.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-time-' + (time.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
//           }
//           else if (workoutFlow[i].steps[y].stepDuration.durationType === "'calories'") {
//             theHackCode += "var cal = document.querySelectorAll('*[id^=\"duration-cal-001\"]'); cal[cal.length-"+(stepsLen-y)+"].className='input-mini dur-cal-' + (cal.length-"+(stepsLen-y)+"); ";
//             theHackCode += "document.getElementsByClassName('dur-cal-' + (cal.length-"+(stepsLen-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";            
//           }
//         }
//         // theHackCode += "var my_awesome_script3 = document.createElement('script');my_awesome_script3.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js');setTimeout(function(){document.body.appendChild(my_awesome_script3);}, 1000); ";
//         // theHackCode += "var my_awesome_script2 = document.createElement('script');my_awesome_script2.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js');setTimeout(function(){document.body.appendChild(my_awesome_script2);}, 2000); ";
//         // theHackCode += "var my_awesome_script = document.createElement('script');my_awesome_script.setAttribute('src','https://rawgit.com/jquery/jquery-ui/1-11-stable/external/jquery-simulate/jquery.simulate.js');setTimeout(function(){document.body.appendChild(my_awesome_script);}, 3000); ";
//         theHackCode += "document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1].id='draggable'; document.getElementsByClassName('child-steps')[document.getElementsByClassName('child-steps').length-1].id='droppable'; ";
//         theHackCode += "setTimeout(function() {document.getElementsByClassName('drag-handle')[document.getElementsByClassName('drag-handle').length-1].onclick = function () {console.log('here'); var draggable = $('#draggable').draggable(),droppable = $('#droppable').droppable(), droppableOffset = droppable.offset(),draggableOffset = draggable.offset(),dx = droppableOffset.left - draggableOffset.left, dy = droppableOffset.top - draggableOffset.top; draggable.simulate('drag', {dx: dx,dy: dy}); console.log('hello')};}, 4000); ";
//         theHackCode += "setTimeout(function(){document.getElementsByClassName('drag-handle')[document.getElementsByClassName('drag-handle').length-1].click()},5000); ";
//         theHackCode += "setTimeout(function(){document.getElementsByClassName('child-steps')[document.getElementsByClassName('child-steps').length-1].appendChild(document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1])},6000); ";

//         // theHackCode += "document.getElementsByClassName('drag-handle')[document.getElementsByClassName('drag-handle').length-1].click(); ";
//         // theHackCode += "console.log('here'); ";
//         // theHackCode += "document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-2].insertAdjacentHTML('afterend', '<div class=\"workout-placehold\"></div>'); ";
//         // theHackCode += "console.log(document.all); ";
//         // theHackCode += "document.getElementById('place-holder').appendChild(document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1]); ";
//         // theHackCode += "document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1].parentNode.insertBefore(document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1],document.getElementsByClassName('workout-placehold')[0]); ";
//         // theHackCode += "document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1].classList.add('ui-sortable-helper'); ";
//         // theHackCode += "document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1].style.top= 370 + 'px'; ";
//         // theHackCode += "setTimeout(function() {document.getElementsByClassName('workout-step')[document.getElementsByClassName('workout-step').length-1].classList.remove('ui-sortable-helper');}, 5000); ";
//         // theHackCode += "console.log(renderChildSteps); ";
//       }
//     }
//   }
//   // theHackCode += "document.getElementById('save-workout').click(); ";
//   // theHackCode += "setTimeout(function() {document.getElementById('save-and-review').click();}, 500); console.log('bye'); ";
//   // theHackCode += "}, 8000); ";
//   theHackCode += "}}); ";
//   // console.log(theHackCode);
//   return theHackCode;
// };

var executeCodeAndJquery = function (tab) {
  // console.log('8');
  setTimeout(function(){chrome.tabs.executeScript(null, {file: "jquery-3.0.0.min.js"});},10);
  setTimeout(function(){chrome.tabs.executeScript(null, {file: "jquery_1113.js"});},20);
  setTimeout(function(){chrome.tabs.executeScript(null, {file: "simulate.js"});},30);
  // setTimeout(function(){chrome.tabs.executeScript(tabId, {code: buildWorkout()});},40);
  setTimeout(function(){
    chrome.tabs.executeScript(tab.id, {code: 'var workoutFlow = ' + workoutFlow}, function () {
      chrome.tabs.executeScript(tab.id, {file: "hackCode.js"});
      if (tab.active === false) {
        chrome.tabs.update(tab.id, {active: true});
      }
      else {
        window.close();
      }
    });},40);
};

function onUpdated (tabId, changeInfo, tab2) {
  // console.log(tab2);
  if (changeInfo.status === "complete" && (tab2.url === "https://connect.garmin.com/modern/workout/create/running" || tab2.url === "https://connect.garmin.com/modern/workout/create/cycling")) {
    // console.log('hiiii');
    executeCodeAndJquery(tab2);
  }

  else if (changeInfo.status === "complete" && (tab2.url.indexOf('signin')) != -1) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('general-error').style.display = 'none';
    document.getElementById('redirecting').style.display = 'none';
    // document.getElementById('alerts-div').style.margin = '10px 0px 0px';
    document.getElementById('not-logged-in-error').style.display = 'block';
    // document.getElementById('not-logged-in-error').style.margin = '5px 0px 0px';
    document.getElementById('alerts-div').style.margin = '9px 0px 0px';
    $('#redirect-to-login').click(function() {
      chrome.tabs.update(tab2.id, {active: true});
    });
  }
  // if ((changeInfo.status === "complete") && (tab2.url.substring(0 ,42) === "https://connect.garmin.com/modern/workout/") && (!(isNaN(Number(tab2.url.substring(42,43)))))) {
  //   // setTimeout(function(){
  //   //   document.getElementById('loading').style.display = 'none';
  //   //   document.getElementById('successful').style.display = 'inline-block'; 
  //   // },500);
  //   if (tab2.active === false) {
  //     setTimeout(function(){chrome.tabs.update(tabId, {active: true});}, 1500);
  //   }
  // }
};

function updatePage(tab){
  // console.log('6');
  // if (tab.active === true) {
  chrome.tabs.onUpdated.addListener(onUpdated);
  // }
  // else {    
    // executeCodeAndJquery(tab);
  // } 
  // console.log('7');
};

$('body').on('click', '#btnLoad', function() {
  var localWorkouFlow = JSON.parse(workoutFlow);
  // console.log('1');
  document.getElementById('btnLoad').style.display = 'none';
  document.getElementById('fileinput').style.display = 'none';
  document.getElementById('loading').style.display = 'inline-block';
  document.getElementById('redirecting').style.display = 'inline-block';
  document.getElementById('alerts-div').style.margin = '-10px 0px -9px';
  chrome.tabs.getSelected(null, function(tab) {
    // console.log('3');
    if (tab.url.substring(0 ,34) === "https://connect.garmin.com/modern/") {
      if (localWorkouFlow[localWorkouFlow.length-1].workoutType === 'running') {
        chrome.tabs.update({url: "https://connect.garmin.com/modern/workout/create/running"}, updatePage);
      }
      else if (localWorkouFlow[localWorkouFlow.length-1].workoutType === 'cycling') {
        chrome.tabs.update({url: "https://connect.garmin.com/modern/workout/create/cycling"}, updatePage);
      }
      // console.log('4');
    }
    else {
      // console.log('4');
      // chrome.tabs.getAllInWindow(function(tabs) {
      //   for (var i=0; i<tabs.length; i++) {
      //     if (tabs[i].url.substring(0,34) === "https://connect.garmin.com/modern/") {
      //       chrome.tabs.update(tabs[i].id, {url: "https://connect.garmin.com/modern/workout/create/running", active: false});
      //       chrome.tabs.onUpdated.addListener(function (tabId, changeInfo){
      //         if (changeInfo.status === "complete") {
      //           chrome.tabs.executeScript(tabId, {code: buildWorkout()});
      //           chrome.tabs.update(tabId, {active: true});
      //         }         
      //       });
      //       break;
      //     }
      //   }
        // if (i === tabs.length) {
      // console.log(localWorkouFlow);
      if (localWorkouFlow[localWorkouFlow.length-1].workoutType === 'running') {
        chrome.tabs.create({url: "https://connect.garmin.com/modern/workout/create/running", active: false}, updatePage);
      }
      else if (localWorkouFlow[localWorkouFlow.length-1].workoutType === 'cycling') {
        chrome.tabs.create({url: "https://connect.garmin.com/modern/workout/create/cycling", active: false}, updatePage);
      }

       // function (tab) {
       //  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab2){        
       //    if (changeInfo.status === "complete" && tab2.url === "https://connect.garmin.com/modern/workout/create/running") {
       //      executeCodeAndJquery(tabId);
       //      // setTimeout(function(){chrome.tabs.update(tabId, {active: true});},50);
       //    }
       //  });
      // });
        // }
      // });
    }
    // console.log('5');
  });
  // console.log('2');
  setTimeout(function(){
    if (document.getElementById('not-logged-in-error').style.display === 'none') {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('redirecting').style.display = 'none';
      document.getElementById('general-error').style.display = 'block';
      document.getElementById('alerts-div').style.margin = '9px 0px 0px';
      $('#fileinput').val('');
    } 
  }, 13000);
});


//Looking good

$( "#shareWorkout" ).click(function() {
  $( "#shareInstructions" ).slideToggle( "slow", function() {
    // Animation complete.
  });
});

$( "#getWorkout" ).click(function() {
  $( "#getInstructions" ).slideToggle( "slow", function() {
    // Animation complete.
  });
});






