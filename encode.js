const fs = require("fs");
const key = fs.readFileSync("./ums-auth-firebase-admin.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
fs.writeFileSync("encoded.txt", base64);
console.log("Base64 key saved to encoded.txt");
