# SVT

### MySQL setup

```
CREATE DATABASE svt;

USE svt;

CREATE TABLE users (name VARCHAR(20), hash VARCHAR(128));

CREATE TABLE posts (title VARCHAR(30), author VARCHAR(20), text VARCHAR(2500), thumbnailPath VARCHAR(128), url VARCHAR(64));
```

### Features

- [SHA512](https://www.npmjs.com/package/js-sha512) hashed passwords (client sided)
- [reCAPTCHA v2](https://developers.google.com/recaptcha) for making new accounts (before schoolsoft)
- Publish articles only if logged in
- Edit already published articles (before twitter)
- Articles regenerated after template at server start

### Upcoming
- [ ] Homefeed
- [ ] Categories
- [ ] User profile pages


