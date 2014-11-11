var express = require('express');
var router = express.Router();
var util = require("util");
var fs = require("fs");
var mv = require('mv');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var S = require('string');
var app = require('../app');
var settings = app.locals.cfg;

var storage_path = settings.storage_path;

// Const
var CUSTOMIZED_META_PREFIX = "x-fs-meta-";
var PARAM_BUCKET = 'bucket';
var PARAM_OVERWRITE = "overwrite";
var PARAM_OVERWRITE_META = "overwrite-meta";
var PARAM_WRITE_META_ONLY = "write-meta-only";
var PARAM_KEY = "key";
var PARAM_FILE = 'file';
var PARAM_CONTENT_MD5 = "Content-MD5";

var ACCESS_DENIED_ERROR_403 = new Error('Access is denied.');
ACCESS_DENIED_ERROR_403.status = 403;

var OBJECT_NOT_FOUND_ERROR_404 = new Error('Object is not found.');
OBJECT_NOT_FOUND_ERROR_404.status = 404;



// --------------------------
// Helper functions

function getObjectPath(bucket, key) {
    return path.join(path.resolve(storage_path), bucket, key);
}

// TODO: check for authorization
function authorize(req, bucket, objKey){
    // authorized according to related headers.
    return true;
}

var available_buckets = _.keys(settings.buckets);

function isBucketAvailable(req, bucket){
    return _.contains(available_buckets, bucket);
}

function isObjectPathValid(bucket, objPath){
    // Do NOT allow use '..' or '.' in objPath for attacking file or directory outside bucket's directory.
    // resolvedObjPath MUST start with bucketPath.
    var resolvedObjPath = path.resolve(objPath);
    var bucketPath = path.join(path.resolve(storage_path), bucket);
    return S(resolvedObjPath).startsWith(bucketPath);
}

function isFilePath(objPath){
    return !S(objPath).endsWith('/');
}

function isObjExisted(objPath){
    return path.existsSync(objPath);
}

function checkFileMD5(filePath, expected_md5){
    // TODO: check file's md5 value
    return true;
}

function moveToStorage(sourcePath, destPath, overwrite, cb){

    console.log("Moving file from ", sourcePath, "to", destPath, " --overwrite: ", overwrite);

    mv(sourcePath, destPath, {clobber: overwrite, mkdirp: true}, function(err) {

        if(err){
            // done. If 'dest/file' exists, an error is returned
            // with err.code === 'EEXIST'.

            if(cb){
                cb(err);
            }
        }
        else {
            console.log("File moved.");
            cb();
        }
    });
}

function parseCustomizedMetadata(req){
    return _.pick(req.body, function (value, key){
        return S(key).startsWith(CUSTOMIZED_META_PREFIX);
    });
}

// --------------------------
// Route Handlers


//
// DESCRIPTION
//      The HEAD operation retrieves metadata from an object without returning the object itself.
//      This operation is useful if you are interested only in an object's metadata.
//
// HTTP REQUEST
//      HEAD /:bucket/:key(*)
//
// HTTP REQUEST HEADERS:
//      - Authorization: authorization string
//
// EXCEPTIONS
//      - Validation fails.
//      - Object does NOT exists.
//
// EXAMPLES
//      - Get metadata of a file:
//          Syntax:
//                HEAD /mybucket/dir2/ HTTP/1.1
//                Host: localhost:3000
//                Authorization: somestring
//                Cache-Control: no-cache
router.head("/:bucket/:key(*)", function(req, res, next){
    console.log("get metadata of an object:");

    // Parse parameters
    var bucket = req.params[PARAM_BUCKET];
    var key = req.params[PARAM_KEY];
    console.log("Bucket:", bucket);
    console.log("Key:", key);

    // Validations

    if(!authorize(req, bucket, key)){
        return next(ACCESS_DENIED_ERROR_403);
    }

    if(!isBucketAvailable(req, bucket)){
        return next(new Error('Bucket '+bucket+' is not available.'));
    }

    // TODO: should read customized meta fields from database


    // Send metadata
    var headers = {
        "x-fs-meta-field1": "myvalue1111",
        "x-fs-meta-field2": "myvalue2222"
    };

    res.set(headers).status(200).end();
});


// DESCRIPTION
//      Download a file (get an object) with meta data via a certain :key.
//      Deny to download a directory.
//
// HTTP REQUEST
//      GET /:bucket/:key(*)
//
// HTTP REQUEST HEADERS:
//      - Authorization: authorization string
//
// EXCEPTIONS
//      - Validation fails.
//      - If :key points to a directory.
//      - Object does NOT exists.
//
// EXAMPLES
//      - Download a file:
//          Syntax:
//                GET /objects/mybucket/dir2/dir22/f2.mmap HTTP/1.1
//                Host: localhost:3000
//                Cache-Control: no-cache
router.get("/:bucket/:key(*)",function(req, res, next){
    console.log("get an object:");

    // Parse parameters
    var bucket = req.params[PARAM_BUCKET];
    var key = req.params[PARAM_KEY];
    var objPath = getObjectPath(bucket,key);
    console.log("Bucket:", bucket);
    console.log("Key:", key);
    console.log("objPath:", objPath);

    // Validations

    if(!authorize(req, bucket, key)){
        return next(ACCESS_DENIED_ERROR_403);
    }

    if(!isBucketAvailable(req, bucket)){
        return next(new Error('Bucket '+bucket+' is not available.'));
    }

    if(!isObjectPathValid(bucket, objPath)){
        return next(new Error('Object key is not valid.'));
    }

    if(!isFilePath(objPath)){
        return next(new Error('Directory is not supported.'));
    }

    if(!isObjExisted(objPath)){
        return next(OBJECT_NOT_FOUND_ERROR_404);
    }

    // Send file
    var options = {
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    // TODO: should read customized meta fields from database.
    options.headers[CUSTOMIZED_META_PREFIX + "field1"]='value111';
    options.headers[CUSTOMIZED_META_PREFIX + "field2"]='value222';

    res.sendFile(objPath, options, function (err) {
        if (err) {
            console.log(err);
            next(err);
        }
        else {
            console.log('Sent:', objPath);
        }
    });
});


//
// DESCRIPTION
//      Upload a file object with meta data and allow overwrite.
//      Or create a directory.
//
//      The POST operation adds an object to a specified bucket using HTML forms.
//      POST is an alternate form of PUT that enables browser-based uploads as a way of
//      putting objects in buckets. Parameters that are passed to PUT via HTTP Headers
//      are instead passed as form fields to POST in the multipart/form-data encoded message body.
//
//      To ensure that data is not corrupted traversing the network, use the Content-MD5 form field.
//      When you use this form field, FileService checks the object against the provided MD5 value.
//      If they do not match, FileService returns an error. Additionally, you can calculate the MD5
//      value while posting an object to Amazon S3 and compare the returned ETag to the calculated
//      MD5 value. The ETag only reflects changes to the contents of an object, not its metadata.
//
// HTTP REQUEST
//      POST /:bucket/
//
// HTTP REQUEST HEADERS
//      - Authorization: authorization string
//
// FORM FIELDS
//      - overwrite: set to "1" to allow overwrite
//      - overwrite-meta: set to "1" to overwrite metadata; otherwise, merge metadata with new version.
//      - write-meta-only: set to "1" to write metadata only.
//      - x-fs-meta-tag: each field name with prefix of "x-fs-meta-" is a customized metadata field.
//      - key: the "key" for uploading object.
//      - file: the uploaded file name.
//      - Content-MD5: MD5 value of the uploading file.
//
// EXCEPTIONS
//      - Validation fails.
//      - Internal error.
//      - Object already exists and deny to overwrite.
//      - MD5 checking doesn't match.
//
// EXAMPLES
//      - Upload a file:
//          Syntax:
//                POST /mybucket/ HTTP/1.1
//                Host: localhost:3000
//                Cache-Control: no-cache
//                Postman-Token: cf526f12-4da0-e898-5f3c-fa96a7632761
//                Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryp7MA4YWxkTrZu0gW
//
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="file"; filename="IMG_5102.JPG"
//                Content-Type: image/jpeg
//
//
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="x-fs-meta-field1"
//
//                my-value-111
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="x-fs-meta-field2"
//
//                my-value-222
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="key"
//
//                dir2/dir22/pic.jpg
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="overwrite"
//
//                1
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="Content-MD5"
//
//                md5_value_of_a_file
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//
//      - Create a directory
//          Syntax:
//                POST /objects/mybucket/ HTTP/1.1
//                Host: localhost:3000
//                Cache-Control: no-cache
//                Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryp7MA4YWxkTrZu0gW
//
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="x-fs-meta-field1"
//
//                my-value-111
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="x-fs-meta-field2"
//
//                my-value-222
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="key"
//
//                dir3/new_dir/ccc/
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
//                Content-Disposition: form-data; name="overwrite"
//
//                1
//                ----WebKitFormBoundaryE19zNvXGzXaLvS5C
router.post("/:bucket/", function(req, res, next){
    console.log("handle upload post request.");

    // Parse parameters
    var bucket = req.params[PARAM_BUCKET];
    var key = req.body[PARAM_KEY];
    var objPath = getObjectPath(bucket,key);
    console.log("Bucket:", bucket);
    console.log("Key:", key);
    console.log("objPath:", objPath);

    // Validations

    if(!authorize(req, bucket, key)){
        return next(ACCESS_DENIED_ERROR_403);
    }

    if(!isBucketAvailable(req, bucket)){
        return next(new Error('Bucket '+bucket+' is not available.'));
    }

    if(!isObjectPathValid(bucket, objPath)){
        return next(new Error('Object key is not valid.'));
    }

    // Moving file or create directory.
    if(isFilePath(objPath)){
        // is a file
        if (req.files) {
            console.log(util.inspect(req.files));

            if(!_.has(req.files, PARAM_FILE)){
                return next(new Error('No file is found in request'));
            }

            if (req.files[PARAM_FILE].size === 0) {
                return next(new Error('File size cannot be zero.'));
            }

            // TODO: implement update metadata only feature.

            var uploaded_file_path = req.files[PARAM_FILE].path;
            fs.exists(uploaded_file_path, function(exists) {
                if(exists) {

                    var expected_md5 = req.body[PARAM_CONTENT_MD5];
                    if(!checkFileMD5(req.files[PARAM_FILE].path, expected_md5)){
                        return next(new Error('Failed to upload a file. MD5 does NOT match.'));
                    }

                    var storage_overwrite = (req.body[PARAM_OVERWRITE] === "1") ;
                    moveToStorage(req.files[PARAM_FILE].path,objPath,storage_overwrite,function(err){
                        if(err){
                            console.log(err);

                            // Moving file error
                            if(err.code==='EEXIST'){
                                return next(new Error('Failed to upload a file. File is existed.'));
                            }
                            else{
                                return next(new Error('Failed to upload a file.'));
                            }
                        }
                        else {
                            // Moving successfully

                            // TODO: store metadata to database
                            // TODO: overwrite meta or merge meta
                            var metadata = parseCustomizedMetadata(req);
                            console.log(metadata);

                            res.status(200).json({ message: 'Object is uploaded.' });
                        }
                    });
                } else {
                    // Uploaded file is missing.
                    return next(new Error('Failed to upload a file.'));
                }
            });
        }

    } else {

        // is a directory

        // Create directory
        mkdirp(objPath, function (err) {
            if (err) {
                console.error(err);
                return next(new Error('Failed to upload a file.' ));
            }
            else {
                // Directory created.

                // TODO: store metadata to database
                var metadata = parseCustomizedMetadata(req);
                console.log(metadata);

                res.status(200).json({ message: 'Directory is created.' });
            }
        });
    }
});


//
// DESCRIPTION
//      The DELETE operation removes the object.
//      Allow to delete a directory with its all children recursively.
//
// HTTP REQUEST
//      DELETE /:bucket/:key(*)
//
// HTTP REQUEST HEADERS:
//      - Authorization: authorization string
//      - x-fs-delete-recursive: set 1 to delete a directory with its all children recursively.
//
// EXCEPTIONS
//      - Validation fails.
//      - Object does NOT exists.
//
// EXAMPLES
//      - Delete a file:
//          Syntax:
//                DELETE /mybucket/dir2/dir22/f2.mmap HTTP/1.1
//                Host: localhost:3000
//                Authorization: somestring
//                Cache-Control: no-cache
router.delete("/:bucket/:key(*)",function(req, res, next){
    // TODO: DELETE an object
    console.log("delete an object:");

    // Parse parameters
    var bucket = req.params[PARAM_BUCKET];
    var key = req.params[PARAM_KEY];
    var objPath = getObjectPath(bucket,key);
    console.log("Bucket:", bucket);
    console.log("Key:", key);
    console.log("objPath:", objPath);

    // Validations

    if(!authorize(req, bucket, key)){
        return next(ACCESS_DENIED_ERROR_403);
    }

    if(!isBucketAvailable(req, bucket)){
        return next(new Error('Bucket '+bucket+' is not available.'));
    }

    if(!isObjectPathValid(bucket, objPath)){
        return next(new Error('Object key is not valid.'));
    }

    if(!isFilePath(objPath)){
        return next(new Error('Directory is not supported.'));
    }

    if(!isObjExisted(objPath)){
        return next(new Error('Object not found.'));
    }

    // TODO: mark the file/folder as deleted in metadata, file will then be deleted by a job


    // Send file
    res.end('delete an object');
});


//
// DESCRIPTION
//      Upload a file object with meta data and allow overwrite.
//      Or create a directory.
//
//      This implementation of the PUT operation adds an object to a bucket.
//      To ensure that data is not corrupted traversing the network, use the Content-MD5 header.
//      When you use this header, FileService checks the object against the provided MD5 value and,
//      if they do not match, returns an error. Additionally, you can calculate the MD5 while
//      putting an object to FileService and compare the returned ETag to the calculated MD5 value.
//
// HTTP REQUEST
//      PUT /:bucket/:key(*)
//
// HTTP REQUEST HEADERS
//      - Authorization: authorization string
//      - overwrite: set to "1" to allow overwrite
//      - overwrite-meta: set to "1" to overwrite metadata; otherwise, merge metadata with new version.
//      - write-meta-only: set to "1" to write metadata only.
//      - x-fs-meta-tag: each field name with prefix of "x-fs-meta-" is a customized metadata field.
//      - key: the "key" for uploading object.
//      - file: the uploaded file name.
//      - Content-MD5: MD5 value of the uploading file.
//
// EXCEPTIONS
//      - Validation fails.
//      - Internal error.
//      - Object already exists and deny to overwrite.
//
// EXAMPLES
//      - Upload a file:
//          Syntax:
//                PUT /mybucket/dir2/dir22/f2.mmap HTTP/1.1
//                Host: localhost:3000
//                Authorization: somestring
//                x-fs-meta-field1: my-value-111
//                x-fs-meta-field2: my-value-222
//                overwrite: 1
//                Content-MD5: md5_value_of_a_file
//                Cache-Control: no-cache
//                Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryp7MA4YWxkTrZu0gW
//
//                ..Object data in the body...
//
//      - Create a directory
//          Syntax:
//                PUT /mybucket/dir3/new_dir22/ HTTP/1.1
//                Host: localhost:3000
//                Authorization: somestring
//                x-fs-meta-field1: my-value-111
//                x-fs-meta-field2: my-value-222
//                Cache-Control: no-cache
//                Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryp7MA4YWxkTrZu0gW
//
router.put("/:bucket/:key(*)",function(req, res, next){
    // TODO: Write an object with PUT
    console.log("write an object");
    res.end('put/write an object');
});


module.exports = router;
