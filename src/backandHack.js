var thenify = function (r) {
    return {
        then: function (f) {
            var res = f(r);
            if (res === undefined || res.then) return res
            return thenify(res);
        },
        res: r
    };
};

var rp = function (o) {
    o.url = o.uri;
    o.data = o.body;
    return thenify($http(o));
};


function backandCallback(userInput, dbRow, parameters, userProfile) {
    return transfer(parameters.u1, parameters.u2, parameters.amount).res;
}