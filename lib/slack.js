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
  defaultEndOfDayStatus = "My workday is over",

  webHook = new IncomingWebHook(webhookIfttt);

function initDefaults(inData) {

  if (inData.endOfDayStatus === undefined) {
    inData.endOfDayStatus = defaultEndOfDayStatus;
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

}

function getStatusObject(z, bundle) {
  let inData = bundle.inputData;
  if (inData.calendarEmoji === undefined) {
    inData.calendarEmoji = defaultCalendarEmoji;
  }
  return getUserByEmail(inData.userEmail)
    .then(result => {
      return createStatusObject(bundle.inputData, result.profile);
    });
}

function createStatusObject(inData, userProfile) {
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
  if (userStatusText.indexOf("PTO") !== -1) {
    return statusObject;
  }
  statusObject.continue = true;

  if (inData.eventEndTime !== undefined) {
    let endDay = inData.eventEndTime.getDay();
    if (endDay === 0 || endDay === 6) {
      statusObject.statusText = inData.weekendStatus;
      statusObject.statusEmoji = inData.notAtWorkEmoji;
      return statusObject;
    }
  }

  // If the user passed us the end of day, quitting time and 
  // this was a calendar event with an end time we can make sure the
  // event didn't end after quitting time. If it did we use the end of 
  // day message
  if (inData.quittingHour !== undefined &&
    inData.eventEndTime !== undefined) {
    if (inData.eventEndTime.getHours() >= inData.quittingHour) {
      statusObject.statusText = inData.endOfDayStatus;
      statusObject.statusEmoji = inData.notAtWorkEmoji;
    }
    return statusObject;
  }

  //If the meeting started before our start time then we don't want to go
  //back to that when the meeting ends
  if (inData.eventBeginTime !== undefined &&
    inData.startingHour !== undefined) {
    if (inData.eventBeginTime.getHours() <= inData.startingHour) {
      statusObject.statusText = inData.workStatus;
      statusObject.statusEmoji = inData.workEmoji;
    }
    return statusObject;
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
  getStatusObject,
  _createStatusObject: createStatusObject
};