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
            return rp(options).then(function (r) {
                return r;
            });
        });
};
var transfer = function (u1, u2, amount) {
    return accountsFor(u1)
        .then(function (r) {
            var credentials = credentialsOf(u1);
            return getTokenForUser(credentials.login, credentials.password)
                .then(function (t) {
                    var options = {
                        method: 'GET',
                        uri: bankUrlVersioned + '/my/banks/' + r[0].bank_id + '/accounts/' + r[0].id + '/account',
                        json: true,
                        headers: headersFor(t)
                    };

                    return rp(options).then(function (r) {
                        return r;
                    });
                });
        })
        .then(function (r) {
            var a1 = r;
            return accountsFor("xavier").then(function (r) {
                return {
                    from: a1,
                    to: r[0],
                    amount: amount
                };
            })
        }).then(function (v) {
            var credentials = credentialsOf(u1);
            return getTokenForUser(credentials.login, credentials.password)
                .then(function (t) {
                    var options = {
                        method: 'POST',
                        uri: bankUrlVersioned + '/banks/' + v.from.bank_id + '/accounts/' + v.from.id + '/owner/transaction-request-types/SANDBOX_TAN/transaction-requests',
                        json: true,
                        headers: headersFor(t),
                        body: {
                            "to": {"bank_id": v.to.bank_id, "account_id": v.to.id},
                            "value": {"currency": v.from.balance.currency, "amount": v.amount},
                            "description": "Love money transfert to " + u2
                        }
                    };

                    return rp(options).then(function (r) {
                        return r;
                    });
                });

        });
};


var rp = require('request-promise');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export {getTokenForUser, headersFor, accountsFor, credentialsOf, transfer}