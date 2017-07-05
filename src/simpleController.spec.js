chai.should();
const expect = chai.expect;

var s;

describe('Love money', () => {

    beforeEach(function () {
        module('app');
        inject(function ($controller) {
            s = $controller('SimpleController');
        });
    });

    describe('for jeremy', () => {
        it('should be user 2', () => {
            s.credentialsOf("jeremy").should.deep.equal({
                'login': "1000203892",
                'password': "123456"
            });
        });
    });
    describe('for xavier', () => {
        it('should be user 4', () => {
            s.credentialsOf("xavier").should.deep.equal({
                'login': "1000203894",
                'password': "123456"
            });
        });
    });
    it('should get tokens for user', () => {
        return s.getTokenForUser("1000203892", "123456").then((r) => r.should.not.be.undefined)
    });
    it('should create header', () => {
        s.headersFor("abcd").should.deep.equal({
            'Content-Type': 'application/json',
            'Authorization': 'DirectLogin token="abcd"'
        });
    });
    it('should get accounts of jerem', () => {
        return s.accountsFor("jeremy").then((r) => r.should.be.an('array').that.is.not.empty);
    });
    xit('should transfert money between accounts', () => {
        return s.transferMoney({
            from: "jeremy",
            to: "xavier",
            amount: 10
        }).should.eventually.be.an('object');
    });
});
