/* globals
  $http - Service for AJAX calls 
  CONSTS - CONSTS.apiUrl for Backands API URL
  Config - Global Configuration
  socket - Send realtime database communication
  files - file handler, performs upload and delete of files
  request - the current http request
*/
'use strict';

function backandCallback(userInput, dbRow, parameters, userProfile) {
    // write your code here

    var PAGE_ACCESS_TOKEN = 'EAAKXJg8OqAIBAAowbyEx6IusozpNMOhZBA7P6QnrdvBKidR0p0ZB1ZCQOp4xmOzEta0zThOchTp1ZBjqByHI5A6ZCi8PS48IVSS4XWncw7tvGysbAQw3Y4DYbD8LaBvjvUjZAxNKxR2rIfV6R7g5WfzdwZAULmyATzIZCW7x25XchcpWN0f8WxQy';

    console.log({
        "FBMessengerBot start": request
    });

    //GET method is only to verify the webhook when adding it from FB UI
    if (request.method == "GET") {

        if (request.query['hub.verify_token'] == "my_test_token")
            return Number(request.query['hub.challenge']);
        else
            throw new Error('Faild verification');
    }

    //*************************************
    // POST code starts here
    //*************************************

    //Handle all the POST requests from the FB messenger UI
    if (request.method == "POST") {

        var data = request.body;
        if (data.object == 'page') {
            sendGetStartedButton();
            sendSetWelcomeMessage();
            // Iterate over each entry
            // There may be multiple if batched
            data.entry.forEach(function(pageEntry) {

                var pageID = pageEntry.id;
                var timeOfEvent = pageEntry.time;

                // Iterate over each messaging event
                pageEntry.messaging.forEach(function(messagingEvent) {
                    if (messagingEvent.optin) {
                        //receivedAuthentication(messagingEvent);
                    } else if (messagingEvent.message) {
                        receivedMessage(messagingEvent);
                    } else if (messagingEvent.delivery) {
                        //receivedDeliveryConfirmation(messagingEvent);
                    } else if (messagingEvent.postback) {
                        receivedPostback(messagingEvent);
                    } else {
                        console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                    }
                });
            });
        }
    }

    //In receivedMessage, we've made logic to send a message back to the user. 
    //The default behavior is to echo back the text that was received in addtion to static text ('Back& bot says').
    function receivedMessage(event) {

        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;

        console.log("Received message for user" + senderID + " and page " + recipientID + " at " + timeOfMessage + " with message");
        console.log(JSON.stringify(message));

        var messageId = message.mid;

        // You may get a text or attachment but not both
        var messageText = message.text;
        var messageAttachments = message.attachments;

        if (messageText) {

            if (messageText.toLowerCase() === "hello" || messageText.toLowerCase() === "hi") {
                var response1 = {
                    recipient: {
                        id: senderID
                    },
                    message: {
                        text: "Hello friend! What can I do for you?"
                    }
                };
                callSendAPI(response1);
                return;
            }


            var friendId = messageText.match(/@.*\s/g);


            if (messageText.toLowerCase().indexOf("buy") !== -1) {
                if (!friendId) {
                    var error = {
                        recipient: {
                            id: senderID
                        },
                        message: {
                            text: "Please repeat your request with your friend ID ?"

                        }
                    };
                    callSendAPI(error);
                    return;
                }

                var response1 = {
                    recipient: {
                        id: senderID
                    },
                    message: {
                        text: "So you wanna buy something from " + friendId + "!"
                    }
                };

                var response2 = {
                    recipient: {
                        id: senderID
                    },
                    message: {
                        text: "How much do you want me to send to " + friendId + "'s account ?"
                    }
                };
                callSendAPI(response1);
                callSendAPI(response2);
            }

            if (messageText.toLowerCase().indexOf("send") !== -1) {
                var friendId = messageText.match(/@.*\s/g);
                var amount = messageText.match(/(\d+(?:\.\d{1,2})?)[€]/g);
                if (!amount || !friendId) {
                    var error = {
                        recipient: {
                            id: senderID
                        },
                        message: {
                            text: "Can you give me the amount to send please ? You should also add the ID of your friend for validation"

                        }
                    };
                    callSendAPI(error);
                } else {
                    var messageData = {
                        recipient: {
                            id: senderID

                        },
                        message: {
                            attachment: {
                                type: "template",
                                payload: {
                                    template_type: "generic",
                                    elements: [{
                                        title: "Choose your payment option",
                                        subtitle: "I reconmmend you the 'Plan' option because your balance is low.",
                                        buttons: [{
                                               type: "postback",
                                                title: "Right now",
                                                payload: "Make a payment now of " + amount + " to " + friendId + " ."
                                            },
                                            {
                                                type: "postback",
                                                title: "Later",
                                                payload: "Make a payment later of " + amount + " to " + friendId + " ."
                                            },
                                            {
                                                type: "postback",
                                                title: "Plan (Recommended)",
                                                payload: "Choose a payment plan for " + amount + " to " + friendId + " ."
                                            }
                                        ],
                                    }]
                                }
                            }
                        }
                    };
                    callSendAPI(messageData);
                }
            }
        }
    }

    //formats the data in the request
    function sendTextMessage(recipientId, messageText) {
       var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: messageText
            }
        };
        
        callSendAPI(messageData);
    }

    //calls the Send API of FB
    function callSendAPI(messageData) {
        try {

            var response = $http({
                method: "POST",
                url: "https://graph.facebook.com/v2.6/me/messages",
                params: {
                    "access_token": PAGE_ACCESS_TOKEN
                },
                data: messageData,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            var recipientId = response.recipient_id;
            var messageId = response.message_id;

            console.log("Successfully sent generic message with id " + messageId + " to recipient " + recipientId);
        } catch (err) {
            console.error("Unable to send message.");
            console.error(err);
        }

    }
    
    //Do transaction
    function callTransactionAPI(amount, to) {
        try {

            var response = $http({
                method: 'GET',
                url: "https://api.backand.com/1/objects/action/items/?name=transfert&parameters={'u1':'jeremy','u2':'" + to.trim() + "','amount':" + amount + "}",
                headers: {
                    "Authorization":userProfile.token
                }
            });
            
            return response;

            console.log("Successfully sent generic message with id " + messageId + " to recipient " + recipientId);
        } catch (err) {
            console.error("Unable to send message.");
            console.error(err);
        }

    }

    function receivedPostback(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback 
        // button for Structured Messages. 
        var payload = event.postback.payload;
        
        if (payload === "GET_STARTED_PAYLOAD") {
                var response = {
                    recipient: {
                        id: senderID
                    },
                    message: {
                        text: "Hello friend! What can I do for you?"
                    }
                };
                callSendAPI(response);
                return;
        }
        
        if (payload.toLowerCase().indexOf("plan") !== -1) {
                var friendId = payload.match(/@.*\s/g);
                var amount = payload.match(/(\d+(?:\.\d{1,2})?)/g);
                
                var messageData = {
                        recipient: {
                            id: senderID

                        },
                        message: {
                            attachment: {
                                type: "template",
                                payload: {
                                    template_type: "generic",
                                    elements: [{
                                        title: "Choose your plan",
                                        subtitle: "I can propose to you the following plans.",
                                        buttons: [{
                                               type: "postback",
                                                title: "2 x " + parseInt(amount/2).toFixed(2)+ "€",
                                                payload: "Transaction of " + parseInt(amount/2).toFixed(2) + " to " + friendId + " ."
                                            },
                                            {
                                                type: "postback",
                                                title: "3 x " + parseInt(amount/3).toFixed(2) + "€",
                                                payload: "Transaction of " + parseInt(amount/3).toFixed(2) + " to " + friendId + " ."
                                            },
                                            {
                                                type: "postback",
                                                title: "4 x " + parseInt(amount/4).toFixed(2) + "€",
                                                payload: "Transaction of " + parseInt(amount/4).toFixed(2) + " to " + friendId + " ."
                                            }
                                        ],
                                    }]
                                }
                            }
                        }
                    };
                    callSendAPI(messageData);
                    return;
            }
            
            if (payload.toLowerCase().indexOf("transaction") !== -1) {
                var friendId = payload.match(/@.*\s/g);
                var amount = payload.match(/(\d+(?:\.\d{1,2})?)/g);
                
                var messageData = {
                        recipient: {
                            id: senderID

                        },
                        message: {
                            attachment: {
                                type: "template",
                                payload: {
                                    template_type: "generic",
                                    elements: [{
                                        title: "Choose your payment frequency",
                                        subtitle: "Choose the right frequency for your situation.",
                                        buttons: [{
                                               type: "postback",
                                                title: "Weekly",
                                                payload: "PAYMENT_INIT of " + amount + " to " + friendId + "FREQ_WEEKLY."
                                            },
                                            {
                                                type: "postback",
                                                title: "Every 2 weeks",
                                                payload: "PAYMENT_INIT of " + amount + " to " + friendId + "FREQ_WEEKLY_2."
                                            },
                                            {
                                                type: "postback",
                                                title: "Monthly",
                                                payload: "PAYMENT_INIT of " + amount + " to " + friendId + "FREQ_MONTLY"
                                            }
                                        ],
                                    }]
                                }
                            }
                        }
                    };
                    callSendAPI(messageData);
                    return;
            }
            
            if (payload.toUpperCase().indexOf("PAYMENT_INIT") !== -1) {
                var friendId = payload.match(/@.*\s/g);
                var amount = payload.match(/(\d+(?:\.\d{1,2})?)/);
                
                var response = callTransactionAPI(amount[0], friendId[0]);
                
                var messageData = {
            recipient: {
              id: senderID
            },
            message: {
              text: JSON.stringify(response)
            }
        };
        
        callSendAPI(messageData);
            
                    return;
            }
            
      
      console.log("Received postback for user " + senderID + " and page " + recipientID + "with payload '" + payload + "' " + 
        "at " + timeOfPostback);
    
      // When a postback is called, we'll send a message back to the sender to 
      // let them know it was successful
      sendTextMessage(senderID, payload);
    }
    
    function sendMenuMessage() {
        var messageData = {
            "persistent_menu":[
                {
                    "locale":"default",
                    "composer_input_disabled":false,
                    "call_to_actions":[
                        {
                            "title":"Payments History",
                            "type":"postback",
                            "payload":"HISTORY_PAYLOAD"
                        },
                        {
                            "title":"Parameters",
                            "type":"postback",
                            "payload":"PARAMETERS_INFO_PAYLOAD"
                        }
                    ]
                }
            ]
        };

        callSendParameterAPI(messageData);
    }
    
    function sendGetStartedButton() {
        var messageData = {
            "get_started": {
                "payload": "GET_STARTED_PAYLOAD"
            }
        };
        callSendParameterAPI(messageData);
    }
    
function sendSetWelcomeMessage(){
        var messageData = {
            "greeting":[
                {
                    "locale":"default",
                    "text":"Bienvenue sur l'application d'échange de money et micro crédits entre amis!"
                }, {
                    "locale":"en_US",
                    "text":"Timeless apparel for the masses."
                }
            ]
        };
        callSendParameterAPI(messageData);
    }
    
    function callSendParameterAPI(messageData) {
        try {

            var response = $http({
                method: "POST",
                url: "https://graph.facebook.com/v2.6/me/messenger_profile",
                params: {
                    "access_token": PAGE_ACCESS_TOKEN
                },
                data: messageData,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            var recipientId = response.recipient_id;
            var messageId = response.message_id;

            console.log("Successfully sent generic message with id " + messageId + " to recipient " + recipientId);
        } catch (err) {
            console.error("Unable to send message.");
            console.error(err);
        }

    }
}
