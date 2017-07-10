'use strict';
const slackStatus = require('../lib/slack');

// We recommend writing your creates separate like this and rolling them
// into the App definition at the end.
module.exports = {
  key: 'slackStatusCalendar',

  // You'll want to provide some helpful display labels and descriptions
  // for users. Zapier will put them into the UX.
  noun: 'SlackStatusCal',
  display: {
    label: 'Slack Calendar Status Helper',
    description: 'Finds the slack user by email and returns status based on PTO and meeting End'
  },

  // `operation` is where the business logic goes.
  operation: {
    inputFields: [{
        key: 'userEmail',
        required: true,
        type: 'string',
        helpText: 'Valid email for user in Slack'
      },

      {
        key: 'workStatus',
        required: false,
        type: 'string',
        helpText: 'The normal "At Work" status message set at start of day  or after the calendar event ends'
      },
      {
        key: 'workEmoji',
        required: false,
        type: 'string',
        helpText: 'the normal at work emoji to use'
      },
      {
        key: 'notAtWorkEmoji',
        required: false,
        type: 'string',
        helpText: 'The emoji to display when you are not at work.'
      },
      {
        key: 'eventEndTime',
        required: false,
        type: 'datetime',
        helpText: 'The time the calendar event ends (do not use the Pretty value)'
      },
      {
        key: 'eventBeginTime',
        required: false,
        type: 'datetime',
        helpText: 'The time the calendar event starts (do not use the Pretty value)'
      },

      {
        key: 'endOfDayStatus',
        required: false,
        type: 'string',
        helpText: 'When the meeting ends and your day is over this status text will be used instead of your at work status'
      },
      {
        key: 'weekendStatus',
        required: false,
        type: 'string',
        helpText: 'If it is a weekend the status message to display'
      },
      {
        key: 'calendarEmoji',
        required: false,
        type: 'string',
        helpText: 'The emoji to use during a calendar event (defaults to :calendar:)'
      },
      {
        key: 'startingTime',
        required: false,
        type: 'integer',
        helpText: 'What hour of the day (in 24 hour format) does your day start (e.g. 8am = 8)'
      },
      {
        key: 'quittingTime',
        required: false,
        type: 'integer',
        helpText: 'What hour of the day (in 24 hour format) does your day end (e.g. 5pm = 17)'
      }

    ],

    perform: (z, bundle) => {
      return slackStatus.getStatusObject(z, bundle);
      //return google.getTimeZoneByLatLon(z, bundle.inputData.latitude, bundle.inputData.longitude);
    },

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obviously dummy values that we can show to any user.
    sample: {
      newStatus: "Working"
    },


    // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
    // field definitions. The result will be used to augment the sample.
    // outputFields: () => { return []; }
    // Alternatively, a static field definition should be provided, to specify labels for the fields
    outputFields: [{
        key: 'id',
        label: 'ID'
      },
      {
        key: 'createdAt',
        label: 'Created At'
      },
      {
        key: 'name',
        label: 'Name'
      },
      {
        key: 'directions',
        label: 'Directions'
      },
      {
        key: 'authorId',
        label: 'Author ID'
      },
      {
        key: 'style',
        label: 'Style'
      }
    ]
  }
};