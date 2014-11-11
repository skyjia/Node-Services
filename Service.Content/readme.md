# 元数据存储 #

- 一个bucket对应一个collection
- 一个文件的元数据是一个document，document的内容包括自定义字段、系统字段（createdTime, lastModifiedTime, md5, isFile, isDeleted）

# 内容权限相关数据存储 #

一个bucket只能属于一个owner，owner拥有对bucket中文件、文件夹的全部操作权限。其它用户不能对不属于自己的bucket中的文件进行任何操作。

bucket权限模型如下，bucket和owner是1对1关系。
    `(bucket_name, client_id, secret_key)`

# 内容访问相关API功能 #

以下所有API只能由Owner访问，非Owner不能访问。

- `HEAD /objects/:bucket/:key` 获取文件/文件夹元数据，包括自定义字段、系统字段，唯一不包括的系统字段isDeleted。
- `GET /objects/:bucket/:key` 获取文件/文件夹元数据和内容。如果是文件夹，只返回元数据，没有内容。
- `POST /objects/:bucket/` 创建文件夹，修改文件夹元数据，上传文件元数据和内容，修改文件元数据和内容。如果是创建文件夹，不需要上传内容；无论是创建文件夹还是上传文件，均需要存在上级目录；修改元数据存在两种模式，合并和覆盖，合并是将原有元数据和要写入的元数据合并后保存，覆盖是先删除原来的元数据再写入新的元数据。
- `PUT /objects/:bucket/:key` 同post
- `DELETE /objects/:bucket/:key` 删除文件、文件夹。实际操作是伪删除；不能删除不存在的文件夹或者文件；如果是文件夹，则将文件夹下的所有子孙文件/文件夹删除

# 用户验证、权限相关接口功能(Client Credential) #

- `/oauth2/authorize` 类似验证用户，获得refresh token和access token。接口定义`(refresh_token) auth(client_id, random_string, md5(md5(secret_key), random_string))`
- `/oauth2/getAccessToken` 使用refresh token获得一个新access token。接口定义`(access_token) refreshAccessToken(user_id, md5(md5(password), random_string), random_string, refresh_token, scope) `
 
 

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