const http = require("http");
const fs = require("fs");
const parseFormdata = require('parse-formdata');
const url = require("url");
const cheerio = require("cheerio");
const conf = {
    port: 3003,
    host: "https://images.foreskin.live",
    maxSize: 20000000,
    noHtmlUploads: true
}
startUp();

function startUp() {
    if (!fs.existsSync("./images/")) {
        fs.mkdirSync("./images/");
        console.log("[i] created images folder!");
    }
    http.createServer(hostServer).listen(conf.port);
    console.log("[i] started server at port " + conf.port);
}

function createId() {
    // based off of https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var result = "";
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    for (var c = 0; c < 10; c++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function hostServer(request, response) {
    var u = url.parse(request.url, true);
    if (u.pathname == "/upload" && request.method == "POST") {
        for (var c in request.rawHeaders) {
            if (request.rawHeaders) {
                if (request.rawHeaders[c] == "Content-Length") {
                    var d = parseInt(c) + 1
                    var size = parseInt(request.rawHeaders[d]);
                    if (size > conf.maxSize) {
                        request.end("too big! compress your image!");
                        return;
                    }
                }
            }
        }
        parseFormdata(request, function (err, data) {
            if (!err && data.parts[0]) {
                var id = createId();
                if (idExists(id)) {var id = createId();}
                fs.appendFileSync("./images/" + id + ".png");
                var d = fs.createWriteStream("./images/" + id + ".png");
                data.parts[0].stream.pipe(d);
                var endData = JSON.stringify({
                    "file": conf.host + "/" + id
                })
                response.end(endData);
            } else if (!err) {
                var endData = "invalid body";
                response.end(endData);
            } else {
                var endData = err.code;
                response.end(endData);
            }
        })
    } else {
        if (u.pathname == "/" | u.pathname == "/index.html") {
            fs.readFile("./html/index.html", function(err, resp) {
                if (!err) {
                    if (conf.noHtmlUploads == true) {
                        var $ = cheerio.load(resp);
                        $("#uploader").remove();
                        var resp = $.html();
                    }
                    response.writeHead(200, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/html"
                    })
                    response.end(resp);
                } else {
                    response.writeHead(404, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/plain"
                    })
                    response.end("welcome to your imghostr server!");
                }
            })
        } else if (u.pathname == "/random") {
            var random = "./images/" + fs.readdirSync("./images")[Math.floor(Math.random()*fs.readdirSync("./images").length)];
            fs.readFile(random, function(err, resp) {
                if (!err) {
                    response.writeHead(200, {
                        "Access-Control-Allow-Origin":"*",
                        "Content-Type": "image/png"
                    })
                    response.end(resp)
                } else {
                    if (err.code == "ENOENT") {
                        response.writeHead(404, {
                            "Access-Control-Allow-Origin":"*",
                            "Content-Type": "text/plain"
                        })
                        response.end("404 - image does not exist");
                    } else {
                        response.writeHead(501, {
                            "Access-Control-Allow-Origin":"*",
                            "Content-Type": "image/png"
                        })
                        response.end(err.code);
                    }
                }
           })
        } else if (u.pathname == "/generateShareX") {
            var json = JSON.stringify({
                "Version": "13.1.0",
                "DestinationType": "FileUploader",
                "RequestMethod": "POST",
                "RequestURL": conf.host + "/upload",
                "Body": "MultipartFormData",
                "FileFormName": "d",
                "URL": "$json:file$"
            })
            response.writeHead(200, {
                "Access-Control-Allow-Origin":"*",
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment; filename=sharex.sxcu"
            })
            response.end(json);
        } else {
            fs.readFile("./images" + u.pathname + ".png", function(err, resp) {
                if (!err) {
                    response.writeHead(200, {
                        "Access-Control-Allow-Origin":"*",
                        "Content-Type": "image/png"
                    })
                    response.end(resp)
                } else {
                    if (err.code == "ENOENT") {
                        response.writeHead(404, {
                            "Access-Control-Allow-Origin":"*",
                            "Content-Type": "text/plain"
                        })
                        response.end("404 - image does not exist");
                    } else {
                        response.writeHead(501, {
                            "Access-Control-Allow-Origin":"*",
                            "Content-Type": "image/png"
                        })
                        response.end(err.code);
                    }
                }
            })
        }
    }
}

function idExists(id) {
    for (var c in fs.readdirSync("./images")) {
        var p = fs.readdirSync("./images")[c];
        if (p == id) {return true;} else {continue;}
    }
    return false;
}