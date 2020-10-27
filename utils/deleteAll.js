const fs = require("fs");
const path = require("path");
const { Input } = require("enquirer");
console.log("[WARN] please make sure to run this in the IMGHOSTR ROOT FOLDER");

const p = new Input({
    message: "are you sure you want to delete all the images on your server?",
})

p.run().then(function(a) {
    var a = a.toLowerCase();
    if (a == "y" | a == "yes") {
        console.log("removing all images...");
        if (fs.existsSync("./images/")) {var fold = "./images/"; var fold2 = "./images/info/";}
        else {
            console.log("- could not find folder!");
            return;
        }
        var dir = fs.readdirSync(fold);
        for (var c in dir) {
            if (dir[c] == "info") {continue;}
            fs.unlinkSync(path.join(fold, dir[c]));
            console.log("- deleted " + dir[c]);
        }
        if (fs.existsSync(fold2)) {
            var dir2 = fs.readdirSync(fold2);
            for (var c in dir2) {
                console.log("- deleted " + dir2[c])
                fs.unlinkSync(path.join(fold2, dir2[c]));
            }
        }
    } else {
        console.log("- cancelled");
        return;
    }
})