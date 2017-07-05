
(function () {
    'use strict';

    angular
        .module('app')
        .controller('SimpleController', Controller);

    function Controller($http) {


        var bankUrl = 'https://socgen2-k-api.openbankproject.com';
        var bankUrlVersioned = bankUrl + '/obp/v3.0.0';
        var consumerId = 'nedlqyjjmzjpv1w1hkfbksei1forisndh3p1et2w';
        var credentialsOf = function (name) {
            return {
                'jeremy': {
                    'login': "1000203892",
                    'password': "123456"
                },
                'xavier': {
                    'login': "1000203894",
                    'password': "123456"
                }
            }[name];
        };




        var getTokenForUser = function (login, password) {
            var options = {
                method: 'POST',
                uri: bankUrl + '/my/logins/direct',
                json: true,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'DirectLogin' +
                    ' username="' + login + '",password="' + password + '",consumer_key="' + consumerId + '"'
                }
            };
            return $http(options).then(function (r) {
                return r.token;
            });
        };
        var headersFor = function (token) {
            return {
                'Content-Type': 'application/json',
                'Authorization': 'DirectLogin token="' + token + '"'
            }
        };
        var accountsFor = function (name) {
            var credentials = credentialsOf(name);
            return getTokenForUser(credentials.login, credentials.password)
                .then(function (t) {
                    var options = {
                        method: 'GET',
                        uri: bankUrlVersioned + '/my/accounts',
                        json: true,
                        headers: headersFor(t)
                    };
                    return $http(options).then(function (r) {
                        return r;
                    });
                });
        };

        var transferMoney = function (transfer) {
            return accountsFor(transfer.to).then(function (accounts) {
                let account = accounts[0];
                var options = {
                    method: 'POST',
                    uri: bankUrlVersioned + '/banks/00100/accounts/ACCOUNT_ID/VIEW_ID/transaction-request-types/TRANSACTION_REQUEST_TYPE/transaction-requests',
                    body: {
                        "to": {"bank_id": account.id, "account_id": account.bank_id},
                        "value": {"currency": "EUR", "amount": "10"},
                        "description": "Good"
                    }
                }
            });
        };







        return {credentialsOf:credentialsOf,
            getTokenForUser:getTokenForUser,
            headersFor:headersFor,
            accountsFor:accountsFor,
            transferMoney:transferMoney
        }
    }
})();