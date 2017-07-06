"use strict";
import chai from "chai";
import {accountsFor, credentialsOf, getTokenForUser, headersFor,transfer} from "../src/simpleCode";
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

describe('Love money', () => {
    describe('for jeremy', () => {
        it('should be user 2', () => {
            credentialsOf("jeremy").should.deep.equal({
                'login': "1000203892",
                'password': "123456"
            });
        });
    });
    describe('for xavier', () => {
        it('should be user 4', () => {
            credentialsOf("xavier").should.deep.equal({
                'login': "1000203894",
                'password': "123456"
            });
        });
    });
    it('should get tokens for user', () => {
        return expect(getTokenForUser("1000203892", "123456")).to.eventually.not.be.undefined
    });
    it('should create header', () => {
        headersFor("abcd").should.deep.equal({
            'Content-Type': 'application/json',
            'Authorization': 'DirectLogin token="abcd"'
        });
    });
    it('should get accounts of jerem', () => {
        return accountsFor("jeremy").should.eventually.be.an('array').that.is.not.empty;
    });
    it('should transfer money',()=>{
        return transfer("jeremy", "xavier", 10).should.eventually.not.be.undefined;
    }).timeout(5000);
});
