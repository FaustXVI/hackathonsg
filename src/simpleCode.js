process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var bankUrl = 'https://socgen2-k-api.openbankproject.com';
var bankUrlVersioned = bankUrl+'/obp/v3.0.0';
var consumerId = 'nedlqyjjmzjpv1w1hkfbksei1forisndh3p1et2w';
var rp = require('request-promise');
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
    return rp(options).then(function (r) {
        return r.token;
    });
};
var headersFor = function (token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'DirectLogin token="' + token + '"'
    }
};
var accountsFor = function () {
    return getTokenForUser("1000203892", "123456")
        .then(function (t) {
            var options = {
                method: 'GET',
                uri: bankUrlVersioned + '/my/accounts',
                json: true,
                headers: headersFor(t)
            };
            return rp(options).then(function (r) {
                return r;
            });
        });
};
var credentialsOf = function () {
    return {
        'login': "1000203892",
        'password': "123456"
    };
};
export {getTokenForUser, headersFor, accountsFor,credentialsOf}