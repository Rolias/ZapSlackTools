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
  webHook = new IncomingWebHook(webhookIfft);


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

    console.log("!!!@@@@!!!!");

    console.log(json_profile_string);
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

        console.log(resp);
        let user = resp.members.find(elem => {
          console.log(elem.profile.email);
          return elem.profile.email === email;
        });
        resolve(user);
      })
      .catch(err => {
        reject(err);
      });
  });
}

testGetUserListAndSetStatusForTod();
// testPostMessage();
testGetUserTodbyId();

module.exports = {
  getUserList,
  testGetUserListAndSetStatusForTod
};