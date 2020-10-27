const fs = require("fs");
if (!fs.existsSync("./auth")) {fs.mkdirSync("./auth")}
if (!fs.existsSync("./auth/db.json")) {fs.writeFileSync("./auth/db.json", "[]")}
console.log("[WARN] please make sure to run this in the IMGHOSTR ROOT FOLDER");
const { Input } = require("enquirer");

new Input({
    message: "Name the authentication key.",
    hint: "Like the name of the person."
}).run().then(function (a) {
    console.log("- generating key for '" + a + "'");
    if (fs.existsSync("./auth/" + a.toString() + ".key.txt")) {fs.unlinkSync("./auth/" + a.toString() + ".key.txt"); console.log("-- removed old key with that name")}
    var result = "";
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    for (var c = 0; c < 100; c++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log("- saving key");
    fs.writeFileSync("./auth/" + a.toString() + ".key.txt" , result);
    console.log("- writing key to database");
    var json = JSON.parse(fs.readFileSync("./auth/db.json"));
    if (reverseWhoIs(a) !== null) {var json = rmNum(findNum(a)); console.log("-- removed old key from database");}
    json.push({
        "key": result,
        "id": a.toString()
    });
    var json = JSON.stringify(json);
    fs.writeFileSync("./auth/db.json", json)
    console.log("- key saved ./auth/" + a.toString() + ".key.txt")
})

function reverseWhoIs(id) {
    var keychain = JSON.parse(fs.readFileSync("./auth/db.json"));
    for (var c in keychain) {
        if (keychain[c].id == id) {return keychain[c].key} else {continue;}
    }
    return null;
}

function findNum(a) {
    var keychain = JSON.parse(fs.readFileSync("./auth/db.json"));
    for (var c in keychain) {
        if (keychain[c].id == a) {return c;} else {continue;}
    }
    return null;
}

function rmNum(a, b) {
    var d = [];
    for (var c in b) {
        if (c == a) {continue;} else {d.push(b[c]);}
    }
    return d;
}