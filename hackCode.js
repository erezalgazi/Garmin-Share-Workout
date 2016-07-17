// var templateNoRepeat = function (type, val, unitVal, unitType) {
//   var hackCode = "var " + type +" = document.querySelectorAll('*[id^=\"duration-"+type+"-001\"]'); "+type+"["+type+".length-1].className='input-small dur-"+type+"-' + ("+type+".length-1); ";
//   hackCode += "document.getElementsByClassName('dur-"+type+"-' + ("+type+".length-1))[0].value = " + val + "; ";
//   if (unitVal) {
//     hackCode += "document.getElementsByName('"+unitType+"')["+type+".length-1].value = " + unitVal + "; ";
//   }
//   return hackCode;    
// };
// style="height: 140%; padding-top: 70px; padding-left: 50%;"
var pageLoadedIndicator = false;
var saveSuccess = false
console.log('Hey You!');
if (window.innerWidth > 1100) {
  document.getElementsByClassName('header')[0].insertAdjacentHTML('afterbegin', '<span><img id="loading-workout" style="height: 90%; padding-left: 20%;" src="https://healthy.kaiserpermanente.org/consumernet/themes/html/consumernet/js/gensys-click2chat/img/ajax-loader.gif"><h4 id="successfulness" style="display:none; color:green; padding-top: 55px; padding-left: 17%;">Process complete!</h4><h5 id="failure" style="display:none; color:red; padding-top: 10px;">Looks like Garmin website is experiencing connectivity problems. Please try agian later.</h5></span>');
}
else if (window.innerWidth <= 1100 && window.innerWidth > 930) {
  document.getElementsByClassName('header')[0].insertAdjacentHTML('afterbegin', '<span><img id="loading-workout" style="height: 90%; padding-left: 15%;" src="https://healthy.kaiserpermanente.org/consumernet/themes/html/consumernet/js/gensys-click2chat/img/ajax-loader.gif"><h4 id="successfulness" style="display:none; color:green; padding-top: 55px; padding-left: 12%;">Process complete!</h4><h5 id="failure" style="display:none; color:red; padding-top: 10px;">Looks like Garmin website is experiencing <br> connectivity problems. Please try agian later.</h5></span>');
}
else if (window.innerWidth <= 930 && window.innerWidth > 830) {
  document.getElementsByClassName('header')[0].insertAdjacentHTML('afterbegin', '<span><img id="loading-workout" style="height: 90%; padding-left: 10%;" src="https://healthy.kaiserpermanente.org/consumernet/themes/html/consumernet/js/gensys-click2chat/img/ajax-loader.gif"><h4 id="successfulness" style="display:none; color:green; padding-top: 55px; padding-left: 5%;">Process complete!</h4><h5 id="failure" style="display:none; color:red; padding-top: 10px;">Looks like Garmin website is experiencing <br> connectivity problems. Please try agian later.</h5></span>');  
}
else if (window.innerWidth <= 830 && window.innerWidth > 679) {
  document.getElementsByClassName('header')[0].insertAdjacentHTML('afterbegin', '<span><img id="loading-workout" style="height: 90%; padding-left: 5%;" src="https://healthy.kaiserpermanente.org/consumernet/themes/html/consumernet/js/gensys-click2chat/img/ajax-loader.gif"><h4 id="successfulness" style="display:none; color:green; padding-top: 55px;">Process complete!</h4><h5 id="failure" style="display:none; color:red; padding-top: 10px;">Looks like Garmin website is <br> experiencing connectivity problems. <br>Please try agian later.</h5></span>');
}
else {
  document.getElementsByClassName('header')[0].insertAdjacentHTML('afterbegin', '<span><img id="loading-workout" style="height: 90%;" src="https://healthy.kaiserpermanente.org/consumernet/themes/html/consumernet/js/gensys-click2chat/img/ajax-loader.gif"><h5 id="successfulness" style="display:none; color:green; padding-top: 55px; margin-left: -15%;">Process complete!</h5><h5 id="failure" style="display:none; color:red; padding-top: 10px; padding-left: 50%;">Looks like Garmin website is <br> experiencing connectivity problems. <br>Please try agian later.</h5></span>');
}
console.log(workoutFlow);

document.body.addEventListener('DOMNodeInserted', createWorkout);
function createWorkout(e) {
  // console.log(e.target.className);
  if (e.target.className=== 'workout-step workout-step-cool') {
    document.body.removeEventListener('DOMNodeInserted', createWorkout);
    for (var j=0; j<3; j++) {
      document.getElementsByClassName('step-delete')[0].click();
    }
    for(var i=0; i<(workoutFlow.length-1); i++) {
      if (workoutFlow[i].repeat === 1) {
        document.getElementById('new-step').click();
        document.getElementsByClassName('select-step-type')[(document.getElementsByClassName('select-step-type').length-1)].value = workoutFlow[i].steps[0].stepType;
        document.getElementsByClassName('select-step-duration')[(document.getElementsByClassName('select-step-type').length-1)].value = workoutFlow[i].steps[0].stepDuration.durationType;
        if (workoutFlow[i].steps[0].stepDuration.durationType === 'distance') {
          var distance = document.querySelectorAll('*[id^="duration-distance-001"]');
          distance[distance.length-1].classList.add('dur-distance-' + (distance.length-1));
          document.getElementsByClassName('dur-distance-'+(distance.length-1))[0].value = workoutFlow[i].steps[0].stepDuration.durationVal;
          // console.log(document.getElementsByClassName('dur-distance-'+(distance.length-1))[0].value , workoutFlow[i].steps[0].stepDuration.durationVal);
          document.getElementsByName('distanceUnit')[distance.length-1].value = workoutFlow[i].steps[0].stepDuration.durationUnits;
          // console.log(document.getElementsByName('distanceUnit')[distance.length-1].value , workoutFlow[i].steps[0].stepDuration.durationUnits);   
        }
        else if (workoutFlow[i].steps[0].stepDuration.durationType === 'heart.rate.zone') {
          var hr = document.querySelectorAll('*[id^="duration-hr-001"]');
          hr[hr.length-1].classList.add('dur-hr-' + (hr.length-1));
          document.getElementsByClassName('dur-hr-'+(hr.length-1))[0].value = workoutFlow[i].steps[0].stepDuration.durationVal;
          document.getElementsByName('heart-rate-select')[hr.length-1].value = workoutFlow[i].steps[0].stepDuration.durationUnits;
        }
        else if (workoutFlow[i].steps[0].stepDuration.durationType === 'time') {
          var time = document.querySelectorAll('*[id^="duration-time-001"]');
          time[time.length-1].classList.add('dur-time-' + (time.length-1));
          document.getElementsByClassName('dur-time-'+(time.length-1))[0].value = workoutFlow[i].steps[0].stepDuration.durationVal;      
        }
        else if (workoutFlow[i].steps[0].stepDuration.durationType === 'calories') {
          var cal = document.querySelectorAll('*[id^="duration-cal-001"]');
          cal[cal.length-1].classList.add('dur-cal-' + (cal.length-1));
          document.getElementsByClassName('dur-cal-'+(cal.length-1))[0].value = workoutFlow[i].steps[0].stepDuration.durationVal;            
        }
      }
      else {
        var stepsLen = workoutFlow[i].steps.length;
        document.getElementById('new-repeat').click();
        if (workoutFlow[i].repeat > 2) {
          for (var q=0; q<(workoutFlow[i].repeat-2); q++) {
            document.getElementsByName('repeat-more')[(document.getElementsByName('repeat-more').length-1)].click();
          }
        }
        if (stepsLen === 1 || stepsLen === 2) {
          if (stepsLen === 1) {
            document.getElementsByClassName('step-delete')[document.getElementsByClassName('step-delete').length-1].click();
          }
          for (var y=0; y<stepsLen; y++) {
            document.getElementsByClassName('select-step-type')[(document.getElementsByClassName('select-step-type').length-(stepsLen-y))].value = workoutFlow[i].steps[y].stepType; 
            document.getElementsByClassName('select-step-duration')[(document.getElementsByClassName('select-step-duration').length-(stepsLen-y))].value = workoutFlow[i].steps[y].stepDuration.durationType;
            if (workoutFlow[i].steps[y].stepDuration.durationType === 'distance') {
              var distance = document.querySelectorAll('*[id^="duration-distance-001"]'); 
              distance[distance.length-(stepsLen-y)].classList.add('dur-distance-' + (distance.length-(stepsLen-y)));
              document.getElementsByClassName('dur-distance-' + (distance.length-(stepsLen-y)))[0].value = workoutFlow[i].steps[y].stepDuration.durationVal;
              document.getElementsByName('distanceUnit')[distance.length-(stepsLen-y)].value = workoutFlow[i].steps[y].stepDuration.durationUnits; 
            }
            else if (workoutFlow[i].steps[y].stepDuration.durationType === 'heart.rate.zone'){
              var hr = document.querySelectorAll('*[id^="duration-hr-001"]');
              hr[hr.length-(stepsLen-y)].classList.add('dur-hr-' + (hr.length-(stepsLen-y)));
              document.getElementsByClassName('dur-hr-' + (hr.length-(stepsLen-y)))[0].value = workoutFlow[i].steps[y].stepDuration.durationVal;
              document.getElementsByName('heart-rate-select')[hr.length-(stepsLen-y)].value = workoutFlow[i].steps[y].stepDuration.durationUnits;
            }
            else if (workoutFlow[i].steps[y].stepDuration.durationType === 'time') {
              var time = document.querySelectorAll('*[id^="duration-time-001"]');
              time[time.length-(stepsLen-y)].classList.add('dur-time-' + (time.length-(stepsLen-y)));
              document.getElementsByClassName('dur-time-' + (time.length-(stepsLen-y)))[0].value = workoutFlow[i].steps[y].stepDuration.durationVal;
            }
            else if (workoutFlow[i].steps[y].stepDuration.durationType === 'calories') {
              var cal = document.querySelectorAll('*[id^="duration-cal-001"]'); 
              cal[cal.length-(stepsLen-y)].classList.add('dur-cal-' + (cal.length-(stepsLen-y)));
              document.getElementsByClassName('dur-cal-' + (cal.length-(stepsLen-y)))[0].value = workoutFlow[i].steps[y].stepDuration.durationVal;            
            }            
          }
        }
      }
    }

    // document.getElementById('save-workout').click();
    setTimeout(function() {
      document.getElementById('save-workout').click();
      setTimeout(function() {
        if ((document.getElementById('save-and-review').style.display === 'none') || (document.getElementsByClassName('inline-edit-trigger') === undefined)) {
          setTimeout(function() {
            console.log('1');
            if (document.getElementsByClassName('inline-edit-trigger')) {
              document.getElementsByClassName('inline-edit-trigger')[0].click();
              document.getElementsByClassName('inline-edit-editable-text')[0].innerHTML = workoutFlow[workoutFlow.length-1].workoutName;
              document.getElementsByClassName('inline-edit-save')[0].click()
            }
            document.getElementById('save-and-review').click();
            setTimeout(function(){
              if ((document.URL.substring(0 ,42) === "https://connect.garmin.com/modern/workout/") && (!(isNaN(Number(document.URL.substring(42,43)))))) {
                saveSuccess = true;
                document.getElementById('loading-workout').style.display = 'none';
                document.getElementById('successfulness').style.display = 'inline-block';
                setTimeout(function() {document.getElementById('successfulness').style.display = 'none';}, 3000);
              }
            },1500)
          }, 4000);
        }
        else {
          console.log('2');
          if (document.getElementsByClassName('inline-edit-trigger')) {
            document.getElementsByClassName('inline-edit-trigger')[0].click();
            document.getElementsByClassName('inline-edit-editable-text')[0].innerHTML = workoutFlow[workoutFlow.length-1].workoutName;
            document.getElementsByClassName('inline-edit-save')[0].click()
          }
          document.getElementById('save-and-review').click();
          setTimeout(function(){
            if ((document.URL.substring(0 ,42) === "https://connect.garmin.com/modern/workout/") && (!(isNaN(Number(document.URL.substring(42,43)))))) {
              saveSuccess = true;
              document.getElementById('loading-workout').style.display = 'none';
              document.getElementById('successfulness').style.display = 'inline-block';
              setTimeout(function() {document.getElementById('successfulness').style.display = 'none';}, 3000);
            }
          },1500)
        }
      }, 800);
    }, 50);
    setTimeout(function(){
      if ((saveSuccess === false) && (!((document.URL.substring(0 ,42) === "https://connect.garmin.com/modern/workout/") && (!(isNaN(Number(document.URL.substring(42,43)))))))) {
        console.log('why');
        document.getElementById('loading-workout').style.display = 'none';
        document.getElementById('failure').style.display = 'inline-block';
        setTimeout(function() {document.getElementById('failure').style.display = 'none';}, 3000);
      }
    }, 12000);
    // for (var t=1; t<2; t++) {
      // console.log(t);
      // if(document.getElementById('save-and-review').style.display === 'none') {
        // setTimeout(function(){console.log('1')}, 1000);
        // t--;
      // }
      // console.log(t);
    // }
    // document.getElementById('loading-workout').style.display = 'none';
    // document.getElementById('successfulness').style.display = 'inline-block';
    // document.getElementById('save-and-review').click();
    console.log('bye');
    pageLoadedIndicator = true;
    // console.log(document.getElementsByClassName('icon-pencil')[0]);
  }

  // if (e.target.className==='inline-edit inline-edit-text-field') {
    // console.log('noooo');
    // document.body.removeEventListener('DOMNodeInserted', createWorkout);
    // setTimeout(function() {
      // document.getElementsByClassName('inline-edit-trigger')[0].click();
      // document.getElementsByClassName('inline-edit-editable-text')[0].innerHTML = workoutFlow[workoutFlow.length-1].workoutName;
      // document.getElementsByClassName('inline-edit-save')[0].click();
    // }, 50);
  // }
};
setTimeout(function(){
  // console.log(pageLoadedIndicator);
  if ((pageLoadedIndicator === false) && (!((document.URL.substring(0 ,42) === "https://connect.garmin.com/modern/workout/") && (!(isNaN(Number(document.URL.substring(42,43)))))))) {
    console.log('here');
    document.getElementById('loading-workout').style.display = 'none';
    document.getElementById('failure').style.display = 'inline-block';
    setTimeout(function() {document.getElementById('failure').style.display = 'none';}, 3000);
  }
}, 12000);