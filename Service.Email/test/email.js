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

describe('# Email template sending API:', function(){
    it('POST /email_template/:template_name/send', function(done){
        request(app)
            .post('/email_template/example/send')
            .send({
                "recipients":{
                    "from":"from@foo.com",
                    "to":"to@bar.com",
                    "cc":"cc@bar.com",
                    "bcc":"bcc@bar.com",
                    "replyTo":"replyTo@foo.com"
                },
                "subject_data": {
                    "user_display_name":"Steve Jobs"
                },
                "body_data":{
                    "user_display_name":"Steve Jobs",
                    "verification_code":"abcdef1234567890"
                },
                "type":"html"
            })
            .set('Accept', 'application/json')
            .expect('request received.')
            .expect(200, done);
    });
});

