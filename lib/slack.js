'use strict';
const AUTH = require('../_local/slack-api-credentials'),
  request = require('request'),
  IncomingWebHook = require('@slack/client').IncomingWebhook,
  WebClient = require('@slack/client').WebClient,
  slackApiToken = AUTH.clientSecret,
  slackApiId = AUTH.clientId,
  slackVerification = AUTH.verificationToken,
  legacyToken = AUTH.legacyToken,
  webhookIfft = AUTH.webhookIftt,
  webApi = new WebClient(AUTH.legacyToken),
  defaultCalendarEmoji = ":calendar:",
  webHook = new IncomingWebHook(webhookIfft);


function getStatusObject(z, bundle) {

  let inData = bundle.inputData;
  if (inData.calendarEmoji === undefined) {
    inData.calendarEmoji = defaultCalendarEmoji;
  }
  return getUserByEmail(inData.userEmail)
    .then(result => {
      let userStatusText = result.profile.status_text,
        userStatusEmoji = result.profile.status_emoji;
      //  userTimezoneOffset = result.profile.tz_offset;

      let statusObject = {
        continue: false,
        statusText: userStatusText,
        statusEmoji: userStatusEmoji
      };
      //If PTO was previous status just bail out
      if (userStatusText.indexOf("PTO") != -1) {
        return statusObject;
      }
      statusObject.continue = true;


      if (userStatusEmoji === inData.calendarEmoji) {
        statusObject.statusText = inData.workStatus;
        statusObject.statusEmoji = inData.workEmoji;
        return statusObject;
      }

      if ((inData.endOfDayStatus !== undefined) &&
        inData.quittingTime !== undefined &&
        inData.eventEndTime !== undefined) {
        if (inData.eventEndTime.hour() > inData.quittingTime) {
          statusObject.statusText = inData.endOfDayStatus;
          statusObject.statusEmoji = inData.notAtWorkEmoji;
          return statusObject;
        }
      }
      statusObject.statusText = inData.workStatus;
      statusObject.statusEmoji = inData.workEmoji;
      return statusObject;

    });


  //The idea is to combine three steps from zap into this 
  //one method.
  // From input data get the passed statusText 
  // the person's email
  // Look up the person in slack and get their status emoji and timezone offset
  // If the status is PTO bail out
  //  Allow option parameters for atWorkStatus, atWorkEmoji
  // dayOverStatus, WeekendStatus, hourWhenWorkdayEnds
  //set default status to atWorkStatus atWorkEmoji
  // if hour past lat working
  //emojiValu = notATWOrkEmoji
  //status = dayOverStatus
  //else if currentEmoji = calendar then last thing was calendar
  //so we don't want previous status
  //set status to atWorkStatus atWorkEmoji
  // return JSON object with continue, statusValue and emojiValue
  // return Promise.resolve({
  //   "newStatus": "works"
  // });

  // return return new Promise((resolve, reject) => {
  //    someAsyncCall(params, (err, response) =>{
  //       if (err){
  //          return reject(err);}
  //       return resolve(response)
  //    });
  // });
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


function testPostMessage() {
  postMessageHuhIftt()
    .then(resp => {
      console.log(resp);
    })
    .catch(err => {
      console.log(err);
    });
}


function getUser() {
  let id = "U06MF9WBD";
  return new Promise((resolve, reject) => {
    webApi.users.info(id, (err, resp) => {
      if (err) {
        return reject(err);
      }
      return resolve(resp);
    });
  });
}

function testGetUserTodbyId() {

  getUser()
    .then(resp => {
      console.log("\n=====================\nTESTING getUser\n");
      console.log(resp);
    })
    .catch(err => {
      console.log(err);
    });
}

function getUserTodByEmail() {
  getUserByEmail("tod-gentille@pluralsight.com")
    .then(resp => {
      console.log(resp);
    })
    .catch(err => {
      console.log(err);
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
              console.log("\n>>>>>>>>>>>>>>>>>>>>>\n", err)
              console.log("\n<<<<<<<<<<<<<<<<<<<<<\n");
            })
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

function getUserList() {
  return new Promise((resolve, reject) => {
    webApi.users.list((err, resp) => {
      if (err) {
        console.log("ERROR: " + err);
        return reject(err);
      }
      return resolve(resp);
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

// testGetUserListAndSetStatusForTod();
// // testPostMessage();
// testGetUserTodbyId();

module.exports = {
  getUserList,
  testGetUserListAndSetStatusForTod,
  getStatusObject
};