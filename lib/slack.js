'use strict';
const AUTH = require('../_local/slack-api-credentials'),
  //request = require('request'),
  IncomingWebHook = require('@slack/client').IncomingWebhook,
  WebClient = require('@slack/client').WebClient,
  //slackApiToken = AUTH.clientSecret,
  //slackApiId = AUTH.clientId,
  //slackVerification = AUTH.verificationToken,
  //legacyToken = AUTH.legacyToken,
  webhookIfttt = AUTH.webhookIfttt,
  webApi = new WebClient(AUTH.legacyToken),
  defaultCalendarEmoji = ":calendar:",
  defaultWeekendStatus = "It is the Weekend!",
  defaultWorkStatus = "At Work",
  defaultWorkEmoji = ":at-work:",
  defaultNotAtWorkEmoji = ":ooo:",
  defaultWorkdayOverStatus = "My workday is over",
  defaultPtoStatus = "PTO",
  statusOffCommand = "STATUS:OFF",
  webHook = new IncomingWebHook(webhookIfttt);

var startAndQuitTimes;
var _z;

function initDefaults(inData) {

  if (inData.workdayOverStatus === undefined) {
    inData.workdayOverStatus = defaultWorkdayOverStatus;
  }
  if (inData.weekendStatus === undefined) {
    inData.weekendStatus = defaultWeekendStatus;
  }
  if (inData.notAtWorkEmoji === undefined) {
    inData.notAtWorkEmoji = defaultNotAtWorkEmoji;
  }
  if (inData.workStatus === undefined) {
    inData.workStatus = defaultWorkStatus;
  }
  if (inData.workEmoji === undefined) {
    inData.workEmoji = defaultWorkEmoji;
  }
  if (inData.ptoStatus === undefined) {
    inData.ptoStatus = defaultPtoStatus;
  }

  _z.console.log("The quitting time<<<", inData.quittingTime);

  if (typeof inData.eventEndTime === "string") {
    let noOffsetDate = stripOffsetFromDateString(inData.eventEndTime);
    inData.eventEndTimeAsDate = new Date(noOffsetDate);
  }
  if (typeof inData.eventBeginTime === "string") {
    let noOffsetDate = stripOffsetFromDateString(inData.eventBeginTime);
    inData.eventBeginTimeAsDate = new Date(noOffsetDate);
  }

  if (inData.startingTime !== undefined && inData.quittingTime !== undefined) {
    startAndQuitTimes = setUpStartAndQuitTime(inData);
  }
}

function getCalendarStatusObject(z, bundle) {
  _z = z;
  let inData = bundle.inputData;
  if (inData.calendarEmoji === undefined) {
    inData.calendarEmoji = defaultCalendarEmoji;
  }
  return getUserByEmail(inData.userEmail)
    .then(result => {
      return createCalendarStatusObject(bundle.inputData, result.profile);
    });
}

function createCalendarStatusObject(inData, userProfile) {
  initDefaults(inData);
  let userStatusText = userProfile.status_text,
    userStatusEmoji = userProfile.status_emoji;
  //  userTimezoneOffset = result.profile.tz_offset;
  let statusObject = {
    continue: false,
    statusText: userStatusText,
    statusEmoji: userStatusEmoji
  };

  //If PTO was previous status just bail out
  if (userStatusText.indexOf(inData.ptoStatus) !== -1) {
    return statusObject;
  }


  if (inData.eventDescription !== undefined) {
    let description = inData.eventDescription.toUpperCase();
    if (description.indexOf(statusOffCommand) !== -1) {
      //user doesn't want this event to update the status
      return statusObject; //continue is already false;
    }
  }
  statusObject.continue = true;

  if (inData.eventEndTimeAsDate !== undefined) {
    let endDay = inData.eventEndTimeAsDate.getDay();
    if (endDay === 0 || endDay === 6) {
      statusObject.statusText = inData.weekendStatus;
      statusObject.statusEmoji = inData.notAtWorkEmoji;
      return statusObject;
    }
  }

  // If the user passed us the starting time, ending time and 
  // this was a calendar event with an end time we can make sure the
  // event didn't outside working hours. If it did we use the workdayOverStatus
  if (inData.quittingTime !== undefined &&
    inData.startingTime !== undefined &&
    inData.eventEndTime !== undefined &&
    'quittingTime' in startAndQuitTimes &&
    'startingTime' in startAndQuitTimes) {

    if ((inData.eventEndTimeAsDate >= startAndQuitTimes.quittingTime) ||
      (inData.eventEndTimeAsDate <= startAndQuitTimes.startingTime)) {
      statusObject.statusText = inData.workdayOverStatus;
      statusObject.statusEmoji = inData.notAtWorkEmoji;
      return statusObject;
    }

  }

  //If the meeting started before our start time then we don't want to go
  //back to that when the meeting ends
  if (inData.eventBeginTime !== undefined &&
    inData.startingTime !== undefined &&
    'startingTime' in startAndQuitTimes) {

    if (inData.eventBeginTimeAsDate <= startAndQuitTimes.startingTime) {
      statusObject.statusText = inData.workStatus;
      statusObject.statusEmoji = inData.workEmoji;
      return statusObject;
    }

  }

  // If the current emoji is the same as the calendar then
  // prior to this we were in another meeting and we don't want
  // to use the previous status and emoji
  if (userStatusEmoji === inData.calendarEmoji) {
    statusObject.statusText = inData.workStatus;
    statusObject.statusEmoji = inData.workEmoji;
    return statusObject;
  }

  //All other times we just revert to the previous status and the
  //passed work emoji. 
  statusObject.statusText = userStatusText;
  statusObject.statusEmoji = userStatusEmoji;
  return statusObject;
}


function setUpStartAndQuitTime(inData) {
  _z.console.log("THE inData Object >>>", inData);
  let quitTime = new Date(Date.now()),
    startTime = new Date(Date.now()),
    quitTimeParts = inData.quittingTime.split(":"),
    startTimeParts = inData.startingTime.split(":");

  let quitHours = parseInt(quitTimeParts[0]),
    quitMinutes = parseInt(quitTimeParts[1]),
    startHours = parseInt(startTimeParts[0]),
    startMinutes = parseInt(startTimeParts[1]);

  quitTime.setUTCHours(quitHours, quitMinutes, 0, 0);
  startTime.setUTCHours(startHours, startMinutes, 0, 0);

  return {
    startingTime: startTime,
    quittingTime: quitTime
  };

}


function stripOffsetFromDateString(dateAsString) {
  let safeStartIndex = 10,
    offsetIdx = dateAsString.indexOf('-', safeStartIndex);
  return dateAsString.substring(0, offsetIdx);
}

function postMessageHuhIftt() {

  return new Promise((resolve, reject) => {
    webHook.send("Hi from Tod's Node.js app", (err, header, statusCode, response) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        header: header,
        statusCode: statusCode,
        response: response
      });
    });
  });
}

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    getUserList()
      .then(resp => {

        //console.log(resp);
        let user = resp.members.find(elem => {
          // console.log(elem.profile.email);
          return elem.profile.email === email;
        });
        resolve(user);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getUserList() {
  return new Promise((resolve, reject) => {
    webApi.users.list((err, resp) => {
      if (err) {
        console.log("ERROR: " + err);
        return reject(err);
      }
      console.log("Did the API call to getUserList");
      return resolve(resp);
    });
  });
}


function testGetUserListAndSetStatusForTod() {
  getUserList()
    .then(resp => {
      console.log("\n------------------------\nTESTING getUserList\n");
      let members = resp.members;
      console.log(resp.members[1].name);

      for (let member of members) {
        //console.log(member.name);
        if (member.name === "tod-gentille") {
          // console.log(member);
          setStatus()
            .then(resp => {
              console.log("should have a new status", resp);
            })
            .catch(err => {
              console.log("\n>>>>>>>>>>>>>>>>>>>>>\n", err);
              console.log("\n<<<<<<<<<<<<<<<<<<<<<\n");
            });
        }
      }
    });
}

//Need to go through the OAuth stuff and get a valid token for this.

function setStatus() {
  return new Promise((resolve, reject) => {
    let userID = "U06MF9WBD";
    let json_profile = {
      "status_text": "setting status from node by user",
      "status_emoji": ":computer:"
    };
    let json_profile_string = JSON.stringify(json_profile);

    let optionalArgs = {
      "user": userID,
      "profile": json_profile_string
    };

    webApi.users.profile.set(optionalArgs, (err, resp) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(resp);
    });
  });
}

module.exports = {
  getUserList,
  testGetUserListAndSetStatusForTod,
  getCalendarStatusObject,
  _createStatusObject: createCalendarStatusObject
};