'use strict';
const AUTH = require('../_local/slack-api-credentials'),
  slackNode = require('slack-node'),
  slackApiToken = AUTH.clientSecret,
  slackApiId = AUTH.clientId,
  slackVerification = AUTH.verificationToken,
  legacyToken = AUTH.legacyToken,
  slack = new slackNode(legacyToken);

function test2() {
  getUser()
    .then(resp => {
      console.log(resp);
    });
}

function test() {
  helloSlack()
    .then(resp => {
      let members = resp.members;


      console.log(resp.members[1].name);

      for (let member of members) {
        //console.log(member.name);
        if (member.name === "tod-gentille") {
          console.log(member);
          setStatus()
            .then(resp => {
              console.log("should have a new status", resp);
            })
          //status_text and status_emoji

        }
      }
      let me = members
      // console.log(resp);

    });
}

function setStatus() {
  return new Promise((resolve, reject) => {
    let json_profile = JSON.stringify({
      "status_text": "coding in node",
      "status_emoji": ":mountain_railway"
    });
    json_profile = encodeURI(json_profile);

    slack.api("users.profile.set", json_profile, (err, resp) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(resp);

    });
  });

}

function getUser() {
  let id = "U06MF9WBD";
  return new Promise((resolve, reject) => {
    slack.api("users.info", {
      "user": id
    }, (err, resp) => {
      if (err) {
        return reject(err);
      }
      return resolve(resp);
    });
  });
}

function helloSlack() {
  return new Promise((resolve, reject) => {
    slack.api("users.list", (err, resp) => {
      if (err) {
        console.log("ERROR: " + err);
        return reject(err);
      }
      return resolve(resp);
    });



  });
}

test();

module.exports = {
  helloSlack,
  test
};