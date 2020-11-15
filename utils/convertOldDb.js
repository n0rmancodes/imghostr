const fs = require("fs");

console.log("- converting old photos into info json files...");

var fold = fs.readdirSync("./images");
for (var c in fold) {
    if (fold[c] == "info") {continue;}
    else if (hasInfoAlready(fold[c].split(".")[0])) {continue;}
    else {
        var { birthtime } = fs.statSync("./images/" + fold[c]);
        var info = {
            "authCode": "",
            "uploader": "anonymous",
            "uploadDate": new Date(birthtime) * 1
        };
        var info = JSON.stringify(info);
        fs.writeFileSync("./images/info/" + fold[c].split(".")[0] + ".json", info);
    }
}

console.log("- complete")

function hasInfoAlready(file) {
    if (fs.existsSync("./images/info/" + file + ".json")) {return true;} else {return false;}
}