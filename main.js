
var axios = require('axios');
const BACKEND_URL = "https://stag.cv19.app:8449";
const HOUSE_HOLD_NUMBER = "3";
var messageList = []

var context = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    backend_url: BACKEND_URL,
    household_number: HOUSE_HOLD_NUMBER,
};
function stripHtml(html) {
    var temporalDivElement = document.createElement("div");
    temporalDivElement.innerHTML = html;
    return temporalDivElement.innerHTML;
    //   return (
    //     temporalDivElement.textContent || temporalDivElement.innerText || ""
    //   );
};
module.exports = {

    ensofiaDialog: function (backendURL, msgText, callback) {

        if (msgText && msgText.trim() != "") {
            var msg = msgText;
            if (this.msgText !== "WELCOME_MSG") {
                var msg = [
                    {
                        author: "me",
                        data: {
                            text: msgText,
                        },
                        type: "text",
                    },
                ];
                var textmsg = msg[0].data.text;

                messageList.push(msg[0]);
            } else {
                textmsg = "hi";
            }
            msgText = "";


            var self = this;
            axios
                .post(backendURL + "/calendarcv02/send_bot_msg", {
                    Text: textmsg,
                    Context: context,
                })
                .then(function (response) {
                    var txtSpeak = "";
                    var textSpeak = "";
                    for (var t in response.data.responseData.output.text) {
                        if (response.data.responseData.output.text[t] != "") {
                            txtSpeak +=
                                stripHtml(response.data.responseData.output.text[t]) +
                                " " +
                                "<br>";
                            textSpeak +=
                                response.data.responseData.output.text[t]


                        }
                    }
                    // if (self.stopAudio == false) {
                    //     self.googleTTS(textSpeak);
                    // }

                    messageList.push({
                        author: "yours",
                        data: {
                            text: txtSpeak,
                        },
                        type: response.data.responseData.context.question_type,
                    });
                    context = response.data.responseData.context;

                    console.log(response);
                    if (response.data.responseData.context.end_survey == true) {
                        // ;
                        context = {};
                        context = {
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            backend_url: BACKEND_URL,
                            household_number: HOUSE_HOLD_NUMBER,
                        };


                    }
                    callback(messageList);


                });
        }
    }
};
