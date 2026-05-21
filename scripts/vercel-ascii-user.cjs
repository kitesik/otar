/* eslint-disable @typescript-eslint/no-require-imports */
const os = require("node:os");

const originalUserInfo = os.userInfo;
const originalHostname = os.hostname;

os.userInfo = function userInfo(options) {
  const info = originalUserInfo.call(os, options);
  return {
    ...info,
    username: "kitesik",
  };
};

os.hostname = function hostname() {
  const host = originalHostname.call(os);
  return /^[\x00-\x7F]+$/.test(host) ? host : "kitesik";
};
