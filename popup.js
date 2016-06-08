
var mapTableType = function (convert) {
  if (convert === 'warm') {return "'warmup'";}
  else if (convert === 'run') {return "'interval'";}
  else if (convert === 'recover') {return "'recovery'";}
  else if (convert === 'rest') {return "'rest'";}
  else if (convert === 'cool') {return "'cooldown'";}
  else if (convert === 'other') {return "'other'";}
};

var mapTableDuration = function (convert) {
  if (convert.indexOf(' min:sec') != -1) {
    var durationVal = convert.substring(convert.indexOf('-') + 2, convert.lastIndexOf(' '));
    return {durationType: "'time'", durationVal: "'" + durationVal + "'"};
  }
  else if ((convert.indexOf(' km') != -1)||((convert.indexOf(' m') != -1))) {
    var durationVal = convert.substring(convert.indexOf('-') + 2, convert.lastIndexOf(' '));
    if (convert.indexOf(' km') != -1) {
      return {durationType: "'distance'", durationVal: "'" + durationVal + "'", durationUnits: "'kilometer'"};
    }
    else if (convert.indexOf(' mi') != -1) {
      return {durationType: "'distance'", durationVal: "'" + durationVal + "'", durationUnits: "'mile'"}; 
    }
    else {
      return {durationType: "'distance'", durationVal: "'" + durationVal + "'", durationUnits: "'meter'"};
    }
  }
  else if (convert.indexOf(' Lap Button Press') != -1) {
    return {durationType: "'lap.button'"};
  }
  else if (convert.indexOf(' Calories') != -1) {
    var durationVal = convert.substring(convert.indexOf('-') + 2, convert.lastIndexOf(' '));
    return {durationType: "'calories'", durationVal: "'" + durationVal + "'"};
  }
  else if (convert.indexOf(' bpm') != -1) {
    var durationVal = convert.substring(convert.indexOf('-') + 8, convert.lastIndexOf(' '));
    if (convert.indexOf(' Above ') != -1) {
      return {durationType: "'heart.rate.zone'", durationVal: "'" + durationVal + "'", durationUnits: "'gt'"};
    }
    else {
      return {durationType: "'heart.rate.zone'", durationVal: "'" + durationVal + "'", durationUnits: "'lt'"};
    }
  }
};

  // chrome.tabs.getSelected(null, function(tab) {

    // chrome.tabs.update(tab.id,{url:"https://connect.garmin.com/modern/workouts"});
  // });
chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
    // console.log(tabs);
      // alert(tabs[0].url);
      // console.log(tabs[0].url.substring(0,42), Number(tabs[0].url.substring(42,43)));
      if ((tabs[0].url.substring(0 ,42) === "https://connect.garmin.com/modern/workout/") && (!(isNaN(Number(tabs[0].url.substring(42,43)))))) {
        document.getElementById('save-html').disabled = false;
      }
      if ((tabs[0].url.substring(0 ,42) === "https://connect.garmin.com/modern/")) {
        document.getElementById('btnLoad').disabled = false;
      }
   }
);


$('body').on('click', '#save-html', function() {
  var workoutHackCode = "var data = []; data.push(document.getElementsByClassName('workout-summary')[0].innerHTML); ";
  workoutHackCode += "for (var k=0; k<document.getElementsByClassName('block-repeat').length; k++) {data.push(document.getElementsByClassName('block-repeat')[k].innerHTML);} data";
  chrome.tabs.executeScript(null, {code: workoutHackCode},
   function(results) {
    arrrangeWorkout(results[0]);
   });
});

var arrrangeWorkout = function (savedHtmlArray) {
  var stepsArray = [];
  var workoutFlowArray = [];
  var stepsNumberInRepeat = [];
  var count = 0;
  var counter = 0;
  var regexRepeat = /block-repeat/gi, result, repeats = [];
  while ((result = regexRepeat.exec(savedHtmlArray[0]))) {
    count++;
    repeats.push(result.index);
    stepsNumberInRepeat.push({len: (savedHtmlArray[count].match(/workout-step-inner/g)||[]).length, firstIndex: null});
  }
  var regexType = /workout-step /gi, result, indices = [];
  while ( (result = regexType.exec(savedHtmlArray[0])) ) {
    indices.push(result.index);
  }
  var regexDuration = /workout-step-inner/gi, result, durations = [];
  while ( (result = regexDuration.exec(savedHtmlArray[0])) ) {
    durations.push(result.index);
  }
  // console.log('types: ', indices, 'durations: ', durations, 'repeats: ', repeats, 'steps each repeat: ', stepsNumberInRepeat);
  for (var r=0; r<repeats.length; r++) {
    var low=0; var high = indices.length;
    while(low != high) {
      var mid = Math.floor((low+high)/2);
      if (indices[mid] <= repeats[r]) {low = mid +1;}
      else {high=mid;}
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
    // var objToPush = mapTableType(type, durations);
    var duration = savedHtmlArray[0].substring(durations[i]+20, durations[i]+50);
    duration = duration.substring(0, duration.lastIndexOf('/')-1);
    duration = mapTableDuration(duration);
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
  // console.log(workoutFlowArray);
  // debugger;
  // $.post( "localhost:8000/workouts", JSON.stringify(stepsArray));
  // console.log(workoutFlowArray);
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workoutFlowArray)); 
  $('<a href="data:' + data +'" download="garmin_workout.json" id="dl-id">download JSON</a>').appendTo('#dl');
  // // setTimeout(function(){document.getElementById("dl").click()}, 2000);
  // debugger;
  document.getElementById('dl-id').click();
  // saveToLocalStorage(stepsArray);
  // JSON(stringify(stepsArray));
  // console.log(JSON.stringify(workoutFlowArray));
};


// document.addEventListener('DOMContentLoaded', function() {
//   var link = document.getElementById('fileinput');
//   link.addEventListener('click', function(){
//     chrome.tabs.getSelected(null, function(tab) {
//       chrome.tabs.update(tab.id,{url:"https://connect.garmin.com/modern/workouts"});
//     });
//   });
// });

$('body').on('click', '#btnLoad', function() {
  var templateNoRepeat = function (type, val, unitVal, unitType) {
    var hackCode = "var " + type +" = document.querySelectorAll('*[id^=\"duration-"+type+"-001\"]'); "+type+"["+type+".length-1].className='input-small dur-"+type+"-' + ("+type+".length-1); ";
    hackCode += "document.getElementsByClassName('dur-"+type+"-' + ("+type+".length-1))[0].value = " + val + "; ";
    if (unitVal) {
      hackCode += "document.getElementsByName('"+unitType+"')["+type+".length-1].value = " + unitVal + "; ";
    }
    return hackCode;    
  };

  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.update(tab.id, {url: "https://connect.garmin.com/modern/workout/create/running"});
  });

  setTimeout(function() {
    input = document.getElementById('fileinput');
    file = input.files[0];
    fr = new FileReader();
    fr.readAsText(file);
    fr.onload = function() {
      var workoutFlow = fr.result;
      workoutFlow = workoutFlow.replace(/^"(.*)"$/, '$1');
      workoutFlow = JSON.parse(workoutFlow);
      // console.log(workoutFlow);
      // debugger;
      // var selectWorkoutHackCode = "document.getElementsByName('select-workout')[0].value = 'running'; ";
      // selectWorkoutHackCode += "document.getElementsByClassName('create-workout')[0].disabled = false; ";
      // // selectWorkoutHackCode += "document.getElementsByClassName('create-workout')[0].click(); ";
      // chrome.tabs.executeScript(null, {code: selectWorkoutHackCode}, function (res) {
      //   console.log(res);
      //   // debugger;
      // });    
      var deleteCurrentHackCode = "for (var j=0; j<3; j++) {document.getElementsByClassName('step-delete')[0].click();}";
      // setTimeout(function(){chrome.tabs.executeScript(null, {code: deleteCurrentHackCode}, function (res) {console.log(res);});},5000); 
      chrome.tabs.executeScript(null, {code: deleteCurrentHackCode}, function (res) {});
      for (var i=0; i<workoutFlow.length; i++) {
             // console.log(workoutFlow);
        // debugger;
        if (workoutFlow[i].repeat === 1) {
          var theHackCode = "document.getElementsByClassName('new-workout-step')[0].click(); ";
          theHackCode += "document.getElementsByClassName('select-step-type')[(document.getElementsByClassName('select-step-type').length-1)].value = " + workoutFlow[i].steps[0].stepType + "; ";
          theHackCode += "document.getElementsByClassName('select-step-duration')[(document.getElementsByClassName('select-step-type').length-1)].value = " + workoutFlow[i].steps[0].stepDuration.durationType + "; ";
          if (workoutFlow[i].steps[0].stepDuration.durationType === "'distance'") {
            theHackCode += templateNoRepeat('distance', workoutFlow[i].steps[0].stepDuration.durationVal, workoutFlow[i].steps[0].stepDuration.durationUnits,'distanceUnit');
            // console.log(theHackCode);
            // debugger;
            // theHackCode += "var dist = document.querySelectorAll('*[id^=\"duration-distance-001\"]'); dist[dist.length-1].className='input-small dur-dist-' + (dist.length-1); ";
            // theHackCode += "document.getElementsByClassName('dur-dist-' + (dist.length-1))[0].value = " + workoutFlow[i].steps[0].stepDuration.durationVal + "; ";
            // theHackCode += "document.getElementsByName('distanceUnit')[dist.length-1].value = " + workoutFlow[i].steps[0].stepDuration.durationUnits + "; ";
          }
          else if (workoutFlow[i].steps[0].stepDuration.durationType === "'heart.rate.zone'") {
            theHackCode += templateNoRepeat('hr', workoutFlow[i].steps[0].stepDuration.durationVal, workoutFlow[i].steps[0].stepDuration.durationUnits, 'heart-rate-select');
            // theHackCode += "var hr = document.querySelectorAll('*[id^=\"duration-hr-001\"]'); hr[hr.length-1].className='input-mini dur-hr-' + (hr.length-1); ";
            // theHackCode += "document.getElementsByClassName('dur-hr-' + (hr.length-1))[0].value = " + workoutFlow[i].steps[0].stepDuration.durationVal + "; ";
            // theHackCode += "document.getElementsByName('heart-rate-select')[hr.length-1].value = " + workoutFlow[i].steps[0].stepDuration.durationUnits + "; ";
          }
          else if (workoutFlow[i].steps[0].stepDuration.durationType === "'time'") {
            theHackCode += templateNoRepeat('time', workoutFlow[i].steps[0].stepDuration.durationVal);
            // theHackCode += "var time = document.querySelectorAll('*[id^=\"duration-time-001\"]'); time[time.length-1].className='input-small duration-time dur-time-' + (time.length-1); ";
            // theHackCode += "document.getElementsByClassName('dur-time-' + (time.length-1))[0].value = " + workoutFlow[i].steps[0].stepDuration.durationVal + "; ";      
          }
          else if (workoutFlow[i].steps[0].stepDuration.durationType === "'calories'") {
            theHackCode += templateNoRepeat('cal', workoutFlow[i].steps[0].stepDuration.durationVal);
            // theHackCode += "var cal = document.querySelectorAll('*[id^=\"duration-cal-001\"]'); cal[cal.length-1].className='input-mini dur-cal-' + (cal.length-1); ";
            // theHackCode += "document.getElementsByClassName('dur-cal-' + (cal.length-1))[0].value = " + workoutFlow[i].steps[0].stepDuration.durationVal + "; ";
          }
          // console.log(theHackCode);
          chrome.tabs.executeScript(null, {code: theHackCode}, function(results) {
            // console.log(results);
          });
        }
        else {
          var theHackCode = "document.getElementsByClassName('new-workout-repeat')[0].click(); ";
          if (workoutFlow[i].repeat > 2) {
            for (var q=0; q<(workoutFlow[i].repeat-2); q++) {
              theHackCode += "document.getElementsByName('repeat-more')[(document.getElementsByName('repeat-more').length-1)].click(); ";
            }
          }
          for (var y=0; y<workoutFlow[i].steps.length; y++) {
            // debugger;
            theHackCode += "document.getElementsByClassName('select-step-type')[(document.getElementsByClassName('select-step-type').length-"+(workoutFlow[i].steps.length-y)+")].value = " + workoutFlow[i].steps[y].stepType + "; ";
            theHackCode += "document.getElementsByClassName('select-step-duration')[(document.getElementsByClassName('select-step-duration').length-"+(workoutFlow[i].steps.length-y)+")].value = " + workoutFlow[i].steps[y].stepDuration.durationType + "; ";
            if (workoutFlow[i].steps[y].stepDuration.durationType === "'distance'") {
              theHackCode += "var dist = document.querySelectorAll('*[id^=\"duration-distance-001\"]'); dist[dist.length-"+(workoutFlow[i].steps.length-y)+"].className='input-small dur-dist-' + (dist.length-"+(workoutFlow[i].steps.length-y)+"); ";
              theHackCode += "document.getElementsByClassName('dur-dist-' + (dist.length-"+(workoutFlow[i].steps.length-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
              theHackCode += "document.getElementsByName('distanceUnit')[dist.length-"+(workoutFlow[i].steps.length-y)+"].value = " + workoutFlow[i].steps[y].stepDuration.durationUnits + "; "; 
            }
            else if (workoutFlow[i].steps[y].stepDuration.durationType === "'heart.rate.zone'"){
              theHackCode += "var hr = document.querySelectorAll('*[id^=\"duration-hr-001\"]'); hr[hr.length-"+(workoutFlow[i].steps.length-y)+"].className='input-mini dur-hr-' + (hr.length-"+(workoutFlow[i].steps.length-y)+"); ";
              theHackCode += "document.getElementsByClassName('dur-hr-' + (hr.length-"+(workoutFlow[i].steps.length-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
              theHackCode += "document.getElementsByName('heart-rate-select')[hr.length-"+(workoutFlow[i].steps.length-y)+"].value = " + workoutFlow[i].steps[y].stepDuration.durationUnits + "; ";
            }
            else if (workoutFlow[i].steps[y].stepDuration.durationType === "'time'") {
              theHackCode += "var time = document.querySelectorAll('*[id^=\"duration-time-001\"]'); time[time.length-"+(workoutFlow[i].steps.length-y)+"].className='input-small duration-time dur-time-' + (time.length-"+(workoutFlow[i].steps.length-y)+"); ";
              theHackCode += "document.getElementsByClassName('dur-time-' + (time.length-"+(workoutFlow[i].steps.length-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";
            }
            else if (workoutFlow[i].steps[y].stepDuration.durationType === "'calories'") {
              theHackCode += "var cal = document.querySelectorAll('*[id^=\"duration-cal-001\"]'); cal[cal.length-"+(workoutFlow[i].steps.length-y)+"].className='input-mini dur-cal-' + (cal.length-"+(workoutFlow[i].steps.length-y)+"); ";
              theHackCode += "document.getElementsByClassName('dur-cal-' + (cal.length-"+(workoutFlow[i].steps.length-y)+"))[0].value = " + workoutFlow[i].steps[y].stepDuration.durationVal + "; ";            
            }
          }
          if (workoutFlow[i].steps.length === 1) {
            theHackCode += "document.getElementsByClassName('step-delete')[document.getElementsByClassName('step-delete').length-2].click(); ";
            // console.log(theHackCode);
          }
          chrome.tabs.executeScript(null, {code: theHackCode}, function (results) {
            // console.log(results);
          });
        }
      }
      var saveHackCode = "document.getElementById('save-workout').click(); ";
      chrome.tabs.executeScript(null, {code: saveHackCode}, function(result) {
        // console.log(result);
      });
      var reviewHackCode = "document.getElementById('save-and-review').click(); ";
      setTimeout(function(){chrome.tabs.executeScript(null, {code: reviewHackCode}, function(result) {console.log(result);});},1000);
    };
  }, 4000);
});
