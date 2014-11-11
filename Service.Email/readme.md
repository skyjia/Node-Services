# Project Description

Email Notification Service

# Project File Structure

- **`conf/`:** user configuration files. this is also the default folder path when there is no `-c` argument specified.
- **`doc/`:** development documents  
- **`server/`:** server application source codes  
- **`email_templates/`:** user-defined email templates  
- **`test/`:** unit test files with [mocha](http://visionmedia.github.io/mocha/) framework.  
- **`.gitignore`:** git ignore file for current project.  
- **`Gruntfile.js`:** Grunt file for current project.  
- **`package.json`:** node package.json file.  
- **`README.md`:** project description
- **`web.config`:** web.config file for deploying current project in IIS with `iisnode` module.  


# Email Templates

Place all email templates inside a single folder, and set the folder path in configuration file.

There are a pair of files for each email template:
- **Subject template file:** used for email subject title.  
  `path_to_template_folder/$template_name$_subject`  
- **Body template file:** used for email body.  
  `path_to_template_folder/$template_name$_body`  

Refer to [swig](http://paularmstrong.github.io/swig/) template engine for syntax usage.


# API

- `GET /`  
  Check service is working.

- `POST /email`  
  The POST operation sends email with json.

- `POST /email/_form`  
  The POST operation sends email using HTML forms.
  Parameters that are passed as form fields to POST in the x-www-form-urlencoded encoded message body.

- `POST /email_template/:template_name/send`  
  The POST operation sends email using HTML forms.


# Launch Service  

1. Launch with default configuration:

  `npm start`  
  or  
  `node server/default.js`  

2. Launch with a configuration file with `-c` (or `--config`) argument:
`npm start -c path/to/config/file.yml`

3. Launch with a configuration via NODE_ENV:
`NODE_ENV=production npm start`

# Configuration

## Loading configuration
1. Loading `./conf/default.yml` (relative to app.js file), the default config file.  
2.a. Loading `./conf/$NODE_ENV$.yml` (relative to launching path) if `-c` argument is not specified. (NODE_ENV defaults to `development`)  
2.b. Loading `-c` specified file if using `-c` argument.  

## Options

Please refer to `server/conf/default.yml` file.

# Testing

Run unit tests:
`grunt test`

# Contributors

- **[Sky Jia](http://github.com/skyjia)**
