const fs = require("fs");
const path = require("path")
const { Input } = require("enquirer");
console.log("[WARN] please make sure to run this in the IMGHOSTR ROOT FOLDER");

new Input({
    message: "are you sure you want to remove all generated authentication files?"
}).run().then(function(a) {
    console.log("removing all authentication files...");
    if (fs.existsSync("./auth/")) {var fold = "./auth/";} else {
        console.log("- could not find folder!");
        return;
    }
    var dir = fs.readdirSync(fold);
    for (var c in dir) {    
        if (dir[c] == "info") {continue;}
        fs.unlinkSync(path.join(fold, dir[c]));
        console.log("- deleted " + dir[c]);
    }
})