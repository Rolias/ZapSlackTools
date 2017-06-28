/*jshint esversion:6 */
//If on PTO don't change the status
if (inputData.StatusText.toUpperCase().indexOf("PTO") != -1) {
    console.log("bailing out");
    //The only thing important here is continue being set to false.
    var output = {
        status: "",
        continue: false,
        emoji: ":at-work:"
    };
} else {

    const atWorkEmoji = ":at-work:",
        notAtWorkEmoji = ":ooo:",
        atWorkStatus = "At the Computer",
        dayOverStatus = "The workday is over",
        lastWorkingHour = 17,
        today = new Date(parseInt(inputData.localTimestamp)),
        hour = today.getHours();

    //Default to the last input status we had in Slack.
    var emojiValue = atWorkEmoji,
        statusValue = inputData.StatusText;

    if (hour > lastWorkingHour) {
        emojiValue = notAtWorkEmoji;
        statusValue = dayOverStatus;
    } else if (inputData.CurrentEmoji === ":calendar:") {
        //If we have back to back meetings we don't want to revert to the 
        //status we had on entry. Also if we had a meeting to start our day 
        //this script might run before our 9am script
        statusValue = atWorkStatus;
        emojiValue = atWorkEmoji;
    }
}
output = {
    status: statusValue,
    continue: true,
    emoji: emojiValue
};
console.log(output);
callback(null, output);