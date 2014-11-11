# Session Service Design

# Table of Contents

<!-- MarkdownTOC autolink=true -->

- [Features](#features)
- [Data Structures](#data-structures)
- [Restful API](#restful-api)
- [Notes](#notes)
    - [How to set the 'Run/Debug Configurations' in WebStorm?](#how-to-set-the-rundebug-configurations-in-webstorm)

<!-- /MarkdownTOC -->

# Features

- 登录成功，创建Session，并且赋予一个过期时间
- 注销登录，删除Session
- 过期时间到，删除Session
- 过期时间可以被延续
- Session中的数据随Session删除一起永久删除
- Session的过期时间由调用者维护，但不能超过Session Service设定的最大值
- 支持存取来自不同App的Session，即来自不同App的相同session_id的session，存取时不会冲突

# Data Structures

- Session data is saved in Redis default db 0
- Session in Redis is a key-value object, key is composed of a predefined prefix and `session_id`, like `ses_{session_id}`, value's data type is hash
- `session_id` is lowercase guid without dash
- In `hash` saves user's context data
- The maxium expiration is saved in configuration file, named `max_session_expiration`

# Restful API

See the comments in `/routes/session.js`

# Notes

## How to set the 'Run/Debug Configurations' in WebStorm?

Like below:
- Node interpreter: `C:\Program Files\nodejs\node.exe`
- Working directory: `D:\WorkingFolder\NetIS-WXM\Src\NetIS.Service.Session`
- JavaScript file: `default.js`
- Application parameters: `-c conf/development.yml`

