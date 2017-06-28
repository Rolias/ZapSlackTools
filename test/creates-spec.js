require('should');
/* global describe, it */
const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('creates', () => {

  describe('make a call to timezone API', () => {
    let self = this;
    it('should get a timezone object back', function (done) {
      const bundle = {
        inputData: {
          userEmail: 'tod-gentille@pluralsight.com',
          calendarStatus: 'in a meeting',
          workStatus: 'At work',
          endOfDayStatus: "Not working",
          calendarEmoji: ":calendar:",
          quittingTime: 17
        }
      };
      this.timeout(5000);
      console.log("runing the test");
      appTester(App.creates.slackStatusCalendar.operation.perform, bundle)
        .then((result) => {
          console.log("In the then clause");
          console.log(result);
          result.should.have.property('continue');
          console.log("DID IT!!!!");
          done();
        })
        .catch(done);
    });
  });


});