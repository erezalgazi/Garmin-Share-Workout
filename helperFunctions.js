var mapTableType = function (convert) {
  if (convert === 'warm') {return 'warmup';}
  else if (convert === 'run') {return 'interval';}
  else if (convert === 'bike') {return 'interval';}
  else if (convert === 'recover') {return 'recovery';}
  else if (convert === 'rest') {return 'rest';}
  else if (convert === 'cool') {return 'cooldown';}
  else if (convert === 'other') {return 'other';}
};

var mapTableDuration = function (convert) {
  if (convert.indexOf(' min:sec ') != -1 || convert.indexOf(' min:sec<') != -1) {
    var durationVal = convert.substring(convert.indexOf('-') + 2, convert.indexOf(':') + 3);
    // console.log('time', durationVal);
    return {durationType: 'time', durationVal: durationVal};
  }
  else if (convert.indexOf(' Lap Button Press ') != -1 || convert.indexOf(' Lap Button Press<') != -1) {
    // console.log('lap');
    return {durationType: 'lap.button'};
  }
  else if (convert.indexOf(' Calories ') != -1 || convert.indexOf(' Calories<') != -1) {
    var durationVal = convert.substring(convert.indexOf('-') + 2, convert.indexOf('Calories') - 1);
    // console.log('cal', durationVal);
    return {durationType: 'calories', durationVal: durationVal};
  }
  else if (convert.indexOf(' km ') != -1 || convert.indexOf(' m ') != -1 || convert.indexOf(' mi ') != -1 || convert.indexOf(' km<') != -1 || convert.indexOf(' m<') != -1 || convert.indexOf(' mi<') != -1) {
    var durationVal = convert.substring(convert.indexOf('-') + 2, convert.indexOf('.') + 3);
    // console.log('dist', durationVal);
    if (convert.indexOf(' km ') != -1 || convert.indexOf(' km<') != -1) {
      return {durationType: 'distance', durationVal: durationVal, durationUnits: 'kilometer'};
    }
    else if (convert.indexOf(' mi ') != -1 || convert.indexOf(' mi<') != -1) {
      return {durationType: 'distance', durationVal: durationVal, durationUnits: 'mile'}; 
    }
    else {
      return {durationType: 'distance', durationVal: durationVal, durationUnits: 'meter'};
    }
  }
  else if (convert.indexOf(' bpm ') != -1 || (convert.indexOf(' bpm<') != -1 && convert.indexOf(' to ') === -1)) {
    var durationVal = convert.substring(convert.indexOf('-') + 8, convert.indexOf('bpm') - 1);
    // console.log('hr', durationVal);
    if (convert.indexOf(' Above ') != -1) {
      return {durationType: 'heart.rate.zone', durationVal: durationVal, durationUnits: 'gt'};
    }
    else {
      return {durationType: 'heart.rate.zone', durationVal: durationVal, durationUnits: 'lt'};
    }
  }
  else if (convert.indexOf(' W ') != -1 || (convert.indexOf(' W<') != -1 && convert.indexOf(' to ') === -1)) {
    var durationVal = convert.substring(convert.indexOf('-') + 8, convert.indexOf('W') - 1);
    // console.log('power', durationVal);
    if (convert.indexOf (' Above ') != -1) {
      return {durationType: 'power.zone', durationVal: durationVal, durationUnits: 'gt'};
    }
    else {
      return {durationType: 'power.zone', durationVal: durationVal, durationUnits: 'lt'};
    }
  }
};
