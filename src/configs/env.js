"use strict";

process.env.SESSION_COOKIE_MAXAGE = 7 * 24 * 60 * 60 * 1000; // 1 week
process.env.SESSION_COOKIE_SECURE = false;
process.env.SESSION_NAME = "SSID";
process.env.SESSION_SECRET = "secret";
process.env.SESSION_TABLE_NAME = "ssids";

process.env.SALT_LENGTH = 5;
process.env.HASH_ALGORITHM = "sha512";

process.env.SELF_URL = "http://localhost:3000";

process.env.EMAIL_HOST = "smtp.yandex.ru";
process.env.EMAIL_PORT = 465;
process.env.EMAIL_SECURE = true;
process.env.EMAIL_AUTH_USER = "jurcssclru";
process.env.EMAIL_AUTH_PASS = "root";
process.env.EMAIL_FROM = "jurcssclru@yandex.ru";

process.env.YANDEX_TRANSLATE_API_KEY = "key";
process.env.YANDEX_MAPS_API_KEY = "key";

process.env.SBER_ACQUIRING_USERNAME = "username";
process.env.SBER_ACQUIRING_PASSWORD = "password";
process.env.SBER_RETURN_URL = "http://localhost:3000/payment";
process.env.SBER_FAIL_URL = "http://localhost:3000/payment";

process.env.CRON_UPDATE_DELAY = 10;
process.env.CRON_UPDATE_LIMIT = 6;
