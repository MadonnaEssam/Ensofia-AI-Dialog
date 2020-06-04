
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
function startRecording() {
    var self = this;
    console.log("recordButton clicked");
    var constraints = {
        audio: true,
        video: false,
    };
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            console.log(
                "getUserMedia() success, stream created, initializing Recorder.js ..."
            );
            var audioContext = new AudioContext();

            window.gumStream = stream;

            var input = audioContext.createMediaStreamSource(stream);

            window.rec = new Recorder(input, {
                numChannels: 1,
            });

            window.rec.record();
            self.hideButton = false;
            console.log("Recording started");
        })
        .catch(function (err) {
            self.micIsOn = false;
            console.error(err);
        });
};
function googleTTS(txt) {
    // this.muteSpeaker();
    var audio = null,

        txt = stripHtml(txt);
    var self = this;
    axios
        .post(
            "https://texttospeech.googleapis.com/v1/text:synthesize",
            {
                input: {
                    text: txt,
                },
                voice: {
                    languageCode: "en-US",
                    name: "en-US-Wavenet-E",
                    ssmlGender: "FEMALE",
                },
                audioConfig: {
                    audioEncoding: "LINEAR16",
                    pitch: 0,
                    speakingRate: 0.9,
                },
            },
            {
                headers: {
                    "x-goog-api-key": "AIzaSyCCvq8l4Lv0lh8oXsR1amaEf9jRU0nDxpo",
                    "content-type": "application/json",
                    "cache-control": "no-cache",
                },
            }
        )
        .then((response) => {
            {
                var byteCharacters = atob(response.data.audioContent);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], {
                    type: "audio/mp3",
                });
                var url = window.URL.createObjectURL(blob);
                self.audio = new Audio(); // path to file
                self.audio.src = url;
                self.audio.play();
            }
            // });
        });
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
                    googleTTS(textSpeak);
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
