require('should');
/* global describe, it, beforeEach */
const zapier = require('zapier-platform-core'),
  rewire = require('rewire');


const App = require('../index');
const mySlack = require('../lib/slack');

const appTester = zapier.createAppTester(App);
var bundle,
  profile;

var slackWebClient = require('@slack/client').WebClient;

describe('slackStatusCalendar', () => {

  beforeEach(() => {
    bundle = {
      inputData: {
        userEmail: 'tod-gentille@pluralsight.com',
        workStatus: "Working hard.",
        workEmoji: ":at-work:",
        calendarStatus: 'in a meeting',
        endOfDayStatus: "Not working",
        calendarEmoji: ":calendar:",
        eventBeginTime: {},
        startingTime: "08:00",
        quittingTime: "17:00"
      }
    };
    profile = {
      status_text: "users status text",
      status_emoji: ":user-status-emoji:"
    };
  });


  describe('slack.js', () => {
    beforeEach(() => {

    });

    let self = this;
    it('should get a timezone object back', function () {

      this.timeout(5000);
      this.slackWebClient = {};

      console.log("running the test");
      //NOTE we don't have to pass in done in the  it function() param and then
      // call done() when the test finishes. Just by returning the promise mocha 
      //will know we're done
      return appTester(App.creates.slackStatusCalendar.operation.perform, bundle)
        .then((result) => {
          console.log("In the then clause");
          console.log(result);
          result.should.have.property('continue');
          console.log("DID IT!!!!");
          //done();
        })
        .catch();
    });

    it('should return regular status', () => {

      let statusObject = mySlack._createStatusObject(bundle.inputData, profile);
      statusObject.should.have.property('continue');
      statusObject.should.have.property('statusText');
      statusObject.should.have.property('statusEmoji');
      statusObject.statusText.should.equal(profile.status_text);
      statusObject.statusEmoji.should.equal(profile.status_emoji);
      statusObject.continue.should.be.true;
    });

    it('should have continue as false when on PTO', () => {
      profile.statusText = "PTO";
      let statusObject = mySlack._createStatusObject(bundle.inputData, profile);
      statusObject.continue.should.be.false;
    });

    it('should reflect weekend status when eventEnds on weekend', () => {
      // bundle.inputData.eventEndTime = new Date('July 9, 2017 12:00:00Z');
      bundle.inputData.eventEndTime = '2017-07-09T12:00:00-07:00';
      let statusObject = mySlack._createStatusObject(bundle.inputData, profile);
      statusObject.statusText.should.equal(bundle.inputData.weekendStatus);
      statusObject.statusEmoji.should.equal(bundle.inputData.notAtWorkEmoji);
      statusObject.continue.should.be.true;
    });

    it('should return workStatus/workEmoji when previous event is calendar event', () => {
      profile.status_emoji = bundle.inputData.calendarEmoji;
      let statusObject = mySlack._createStatusObject(bundle.inputData, profile);
      statusObject.statusText.should.equal(bundle.inputData.workStatus);
      statusObject.statusEmoji.should.equal(bundle.inputData.workEmoji);
      statusObject.continue.should.be.true;
    });

    it.only('should return workStatus/Emoji when event start time is prior to start of work day', () => {
      bundle.inputData.eventBeginTime = '2017-07-10T08:00:00-07:00';
      let statusObject = mySlack._createStatusObject(bundle.inputData, profile);
      statusObject.statusText.should.equal(bundle.inputData.workStatus);
      statusObject.statusEmoji.should.equal(bundle.inputData.workEmoji);
      statusObject.continue.should.be.true;
    });


    it.only('should return OffWork/Status when end time is after end of work day', () => {
      bundle.inputData.eventEndTime = '2017-07-10T17:00:00-07:00';
      bundle.inputData.quittingHour = 17;
      let statusObject = mySlack._createStatusObject(bundle.inputData, profile);
      statusObject.statusText.should.equal(bundle.inputData.workdayOverStatus);
      statusObject.statusEmoji.should.equal(bundle.inputData.notAtWorkEmoji);
      statusObject.continue.should.be.true;
    });

    it('should calculate time of day stuff', () => {
      bundle.inputData.eventEndTime = '2017-07-10T17:00:00-07:00';
      mySlack._setupStartAndQuitTime(bundle.inputData);
    });


  });



});