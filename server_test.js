var assert = require('assert');
var fs = require('fs');
var http = require('http');

var host = process.env.HOST;
var port = process.env.PORT;

describe("server", function(){
  describe("example request", function (){
    it("should return a filtered version of the input", function (done) {

      var sampleResponse = JSON.parse(fs.readFileSync("stan-sample-response.json", {encoding:"utf-8"}));
      var sampleRequest = fs.readFileSync("stan-sample-request.json", {encoding:"utf-8"});

      var req = http.request({
        hostname: host,
        port: port,
        method: "POST",
        path: "/",
      }, function (res) {

        assert.equal(res.statusCode, 200, "status code === 200");

        var chunks = '';
        res.setEncoding('utf-8');

        res.on('data', function (data){
          chunks += data;
        });

        res.on('end', function (data){
          var responseObject = JSON.parse(chunks);
          assert.deepEqual(sampleResponse, responseObject, "sample response differs from server's response");
          done();
        });
      });

      req.write(sampleRequest);
      req.end();

    });
  });

  describe("erroneous requst", function (){
    it("should return an error", function (done) {

      var req = http.request({
        hostname: host,
        port: port,
        method: "POST",
        path: "/",
      }, function (res) {

        assert.strictEqual(res.statusCode, 400, "status code is 400");

        var chunks = '';
        res.setEncoding('utf-8');

        res.on('data', function (data){
          chunks += data;
        });

        res.on('end', function (data){
          var responseObject = JSON.parse(chunks);
          assert.strictEqual(typeof responseObject.error, "string", "response.error is string");
          assert.notStrictEqual(responseObject.error.indexOf("Could not decode request"), -1, "response.error contains \"Could not decode request\"");
          done();
        });
      });

      req.write("this is not JSON");
      req.end();
    });
  });

});
