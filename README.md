# A Slack Helper App for use inside Zapier

The idea is to build a collection of utilities to make working with Slack a bit easier. Right now the app only supports helping ease the pain of updating ones slack status. Most parameters are optional so that it can be used in a variety of ways but the envisioned use case is to support reading a google calendar and passing in the start and end times and letting the slackStatusCalendar code handle all the logic. In the ideal case the code sets the status and icon to being in a meeting and then setting it back to what it was before the meeting when the event ends. However, it supports a ptoStatus (paid time off) string. If that string is found then your status is not changed. If the start time of the meeting was before the start of your day it won't revert to the original status and instead will use the atWorkStatus. If the meeting ends after your day ends it again won't revert to the original status but will go to your endOfDayStatus. It also supports a statusOff string that the user can specify. If that string is found in the event's description then like being on PTO the status won't be changed. If the event ends on a weekend then the weekendStatus will be use. If there are back-to-back meetings then instead of going to the previous status it will go to the normal at work status. 

## Using This project in Zapier

If you want to use this Zap as is, just ask me and I can share it with you via Zapier's invite system (requires your email). Currently my slack tokens are deployed in the App but they are not in this repo. If you want to to clone and reuse this repo for your version of this app, you'll want to add a folder named `_local` at the root of the node project. Then create a file `slack-api-credentials.js`. That file will contain something like this where you subsitute your actual API key in the obvious place.

```javascript
module.exports = {
    legacyToken:'<YOUR API KEY GOES HERE>'
};
```



**IMPORTANT WARNING** Note when you use the results from an APP in Zapier the values are strings. You need to translate those back into the native JavaScript types. So while localDateTime is nice for debugging and making sure the date and time in the local zone are correct, you can create a native JS date object in your Zap with code that will look similar to this:

```javascript
const today = new Date(parseInt(inputData.localTime));
```

_