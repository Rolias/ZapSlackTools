# A Slack Helper App for use inside Zapier

At the moment nothing here is working. I just copied an existing project to have a way to play around with the slack API. I haven't started on the Zapier portion yet. 

## Using This project in Zapier

If you want to use this Zap as is, just ask me and I can share it with you via Zapier's invite system (requires your email). Currently my Google API key is in the deployed App but it's not in this repo. If you want to to clone and reuse this repo for your version of a timezone app, you'll want to add a folder name `_local` at the root of the node project. Then create a file `slack-api-credentials.js`. That file will contain something like this where you subsitute your actual API key in the obvious place.

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