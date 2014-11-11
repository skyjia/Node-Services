/**
 * Created by skyjia on 10/14/14.
 */
var request = require('supertest');
var app = require('../server/app.js');

describe('# Service checking API:', function(){
    it('GET /', function(done){
        request(app)
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});
