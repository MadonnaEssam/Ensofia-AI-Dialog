
var axios = require('axios');
const BACKEND_URL = "https://stag.cv19.app:8449";
const HOUSE_HOLD_NUMBER = "3";
var messageList = []
var stream = null
var audio=null
var recognizeMicrophone = require("watson-speech/speech-to-text/recognize-microphone");

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

function googleTTS(txt) {
    // this.muteSpeaker();

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
function getGoogleCloudSpeechToText(blob, callback) {
    var self = this;

    window.rec.exportWAV(function (blob) {
        //window.blob = blob;
        window.rec.clear();
        window.fileReader = new FileReader();
        window.fileReader.readAsDataURL(blob);
        window.fileReader.onerror = function (error) {
            console.log("Error: ", error);
        };
        GoogleWrite(window.fileReader, callback);

    });
};
function GoogleWrite(fileReader, callBack) {
    var self = this
    window.fileReader = fileReader;
    if (window.fileReader.readyState == 2) {
        var conf = {
            config: {
                enableAutomaticPunctuation: false,
                encoding: "LINEAR16",
                languageCode: "en-US",

                model: "phone_call",
                use_enhanced: true
            },
            audio: {
                content: window.fileReader.result.split(",")[1]
            }
        };
        var googleCloudSpeechUrl =
            "https://speech.googleapis.com/v1p1beta1/speech:recognize?key=AIzaSyDKZjWQdLmfubzBc_Dv0hf6xIINJiO1fY0";
        axios
            .post(googleCloudSpeechUrl, conf, {
                headers: {
                    "Content-Type": "text/plain;charset=UTF-8"
                }
            })
            .then(response => {
                window.msgText = response.data.results[0].alternatives[0].transcript;
                return window.msgText
                // self.ensofiaDialog(backendURL, self.msgText, function () { })
            })
            .catch(error => { });
    } else {
        console.log(window.fileReader.readyState);
        setTimeout(function () {
            GoogleWrite(window.fileReader, callBack);
        }, 100);
    }
};

function getSTT() {
    if(!window.getSTTCalled){
        window.getSTTCalled = true;
        axios.post("https://api.ensofia.com:8446/calendarcv02/getSttToken").then(function (response) {
            //window.vaildToken = true
            window.sttToken = response.data.responseData.token

            setTimeout(function(){
                window.getSTTCalled = false;
                getSTT();
            }, 30*60*1000);
        });
    }
};
module.exports = {
    openMicWatson: function (backendURL, stopAudio, callBack1) {
        var self = this;
        // self.micIsOn = true;
        window.stream = recognizeMicrophone({
            accessToken: window.sttToken,
            outputElement: "#y",
        });
        window.stream.on("data", function (data) {
            if (data.results[0] && data.results[0].final == true) {
                self.hideButton = true;

                window.stream.recognizeStream.stop();
                window.stream.recognizeStream = null;
                window.stream = null;
                // self.micIsOn = false;
                // console.log(data);
                var msg = data.results[0].alternatives[0].transcript;
                callBack1(msg)
                self.ensofiaDialog(backendURL, msg, stopAudio,callBack1)
            }
        });
        window.stream.on("error", function (err) {
            window.stream.recognizeStream.stop();
            window.stream.recognizeStream = null;
            window.stream = null;
            callBack1(err)

            //   self.micIsOn = false;
            //   self.hideButton = true;
            // console.log(err);
        });
    },
    // stopRecording(backendURL, callBack) {
    //     window.rec.stop();
    //     window.gumStream.getAudioTracks()[0].stop();

    //     var self = this;
    //     getGoogleCloudSpeechToText();
    //     setTimeout(function () {
    //         var msgText=window.msgText
    //         self.ensofiaDialog(backendURL, msgText,callBack)
    //             }, 9000);

    // },
    // startRecording() {
    //     var self = this;
    //     console.log("recordButton clicked");
    //     var constraints = {
    //         audio: true,
    //         video: false,
    //     };
    //     navigator.mediaDevices
    //         .getUserMedia(constraints)
    //         .then(function (stream) {
    //             console.log(
    //                 "getUserMedia() success, stream created, initializing Recorder.js ..."
    //             );
    //             var audioContext = new AudioContext();

    //             window.gumStream = stream;

    //             var input = audioContext.createMediaStreamSource(stream);

    //             window.rec = new Recorder(input, {
    //                 numChannels: 1,
    //             });

    //             window.rec.record();
    //             console.log("Recording started");
    //         })
    //         .catch(function (err) {
    //             console.error(err);
    //         });
    // },
    ensofiaDialog: function (backendURL, msgText, stopAudio, callback) {
        getSTT()

        // }, 1000 * 60 * 2)
        window.stopAudio = stopAudio
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
                    if (window.stopAudio == false) {
                        googleTTS(textSpeak);
                    }

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
                            backend_url: backendURL,
                            household_number: HOUSE_HOLD_NUMBER,
                        };


                    }
                    callback(messageList);


                });
        }
    }
};
