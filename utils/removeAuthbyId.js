const fs = require("fs");
const { Input } = require("enquirer");
console.log("[WARN] please make sure to run this in the IMGHOSTR ROOT FOLDER");

new Input({
    message: "Enter the ID of the user you wish to remove.",
    hint: "This attribute is also known as 'user' and 'username'."
}).run().then(function(a) {
    if (reverseWhoIs(a) !== null) {
        fs.unlinkSync("./auth/" + a.toString() + ".key.txt");
        var json = JSON.parse(fs.readFileSync("./auth/db.json"));
        var nJson = rmNum(findNum(a), json)
        fs.writeFileSync("./auth/db.json", JSON.stringify(nJson));
    } else {
        console.log("- could not find id: '" + a + "'");
    }
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