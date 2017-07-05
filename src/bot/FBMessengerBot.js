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

    var PAGE_ACCESS_TOKEN = 'EAAKXJg8OqAIBAEQFNIRti2Cyb2zwDL2Sm5ZAjYlW2mx2YnaLggY5tLpZBJJziiPDZCswPc6VZCa3hl3akXztAHNdJNyDhusJZBDDvtvx5imIZAayhyJpgsCCHDGIc1mh89sE1NFAZBB6ZC1ZClKRIN84XmAIrrAKtyZCLvETdbv8vB6AZDZD';

    console.log({ "FBMessengerBot start": request });

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


            var friendId = messageText.match(/@.*\s/g);

            if (messageText.toLowerCase().indexOf("buy") !== -1) {
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
                        text: "How much do you want me to send to " + friendId + "account ?"
                    }
                };
                callSendAPI(response1);
                callSendAPI(response2);
            }

            if (messageText.toLowerCase().indexOf("send") !== -1) {
                var amount = messageText.match(/(\d+(?:\.\d{1,2})?)[€]/g);
                if (!amount) {
                    var error = {
                        recipient: {
                            id: senderID
                        },
                        message: {
                            text: "Can you give me the amount to send please ?"

                        }
                    };
                    callSendAPI(error);
                } else {
                    var response1 = {
                        recipient: {
                            id: senderID
                        },
                        message: {
                            text: "I will transfer " + amount + " to his account. This amount will be debited from your account."
                        }
                    };
                    var response2 = {
                        recipient: {
                            id: senderID
                        },
                        message: {
                            text: "Do you agree ?"
                        }
                    };
                    callSendAPI(response1);
                    callSendAPI(response2);
                }
            }

            // If we receive a text message, check to see if it matches any special
            // keywords and send back the corresponding example. Otherwise, just echo
            // the text we received.
            /*switch (messageText) {
                  
                  case 'image':
                    //sendImageMessage(senderID);
                    break;
                
                  case 'button':
                    //sendButtonMessage(senderID);
                    break;
                
                  case 'backand':
                  case 'Backand':      
                    sendGenericMessage(senderID);
                    break;
                
                  case 'receipt':
                    //sendReceiptMessage(senderID);
                    break;
                
                  default:
                    sendTextMessage(senderID, messageText);
                }*/
        } else if (messageAttachments) {
            sendTextMessage(senderID, "Message with attachment received");
        }
    }

    //formats the data in the request
    function sendTextMessage(recipientId, messageText) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: "Back& bot says: " + messageText
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
                headers: { "Content-Type": "application/json" }
            });

            var recipientId = response.recipient_id;
            var messageId = response.message_id;

            console.log("Successfully sent generic message with id " + messageId + " to recipient " + recipientId);
        } catch (err) {
            console.error("Unable to send message.");
            console.error(err);
        }

    }

    //Sends back a Structured Message with a generic template.
    //if you send the message 'backand'
    function sendGenericMessage(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: "Messanger BAAS",
                            subtitle: "Backand as a service for Facebook Messanger",
                            item_url: "https://www.backand.com/features/",
                            image_url: "https://www.backand.com/wp-content/uploads/2016/01/endless.gif",
                            buttons: [{
                                type: "web_url",
                                url: "https://www.backand.com/features/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Call Postback",
                                payload: "Payload for first bubble",
                            }],
                        }, {
                            title: "3rd Party Integrations",
                            subtitle: "Connect your Bot to 3rd party services and applications",
                            item_url: "https://www.backand.com/integrations/",
                            image_url: "https://www.backand.com/wp-content/uploads/2016/01/3.png",
                            buttons: [{
                                type: "web_url",
                                url: "https://www.backand.com/integrations/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Call Postback",
                                payload: "Payload for second bubble",
                            }]
                        }]
                    }
                }
            }
        };
        callSendAPI(messageData);
    }

    function receivedPostback(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback 
        // button for Structured Messages. 
        var payload = event.postback.payload;

        console.log("Received postback for user " + senderID + " and page " + recipientID + "with payload '" + payload + "' " +
            "at " + timeOfPostback);

        // When a postback is called, we'll send a message back to the sender to 
        // let them know it was successful
        sendTextMessage(senderID, "Postback called");
    }
}