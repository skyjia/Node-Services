var express = require('express');
var router = express.Router();

router.get("/",  function(req, res, next) {

    res.json({ "result" : "it works!" });
});

module.exports = router;
