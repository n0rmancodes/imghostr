const http = require("http");
const fs = require("fs");
const parseFormdata = require('parse-formdata');
const url = require("url");
const cheerio = require("cheerio");
if (!fs.existsSync("config.json")) {
    console.log("- there seems to be no config.json, you will use default settings...");
    fs.copyFileSync("config.example.json", "config.json");
}
const conf = JSON.parse(fs.readFileSync("./config.json"));
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
                        var err = {
                            "err" : {
                                "message": "Image is too big, try compressing it.",
                                "code": "tooBig"
                            }
                        }
                        var err = JSON.stringify(err);
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(err);
                        return;
                    }
                }
            }
        }
        parseFormdata(request, function (err, data) {
            if (!err && data.parts[0]) {
                var id = createId();
                if (data.parts[0].mimetype == "image/jpeg") {var type = ".jpg";}
                else if (data.parts[0].mimetype == "image/png") {var type = ".png";}
                else if (data.parts[0].mimetype == "image/gif") {var type = ".gif";}
                else {
                    var err = {
                        "err": {
                            "code": "unsupportedFile",
                            "message": "Invalid file type to upload."
                        }
                    };
                    response.writeHead(403, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json"
                    });
                    response.end(err);
                }
                if (idExists(id)) {var id = createId();}
                if (conf.requireAuth == true) {
                    if (request.headers["authentication"]) {
                        if (!isProperKey(request.headers["authentication"]) == true) {
                            var err = {
                                "err": {
                                    "message": "Invalid auth key used.",
                                    "code": "invalidKey"
                                }
                            }
                            var err = JSON.stringify(err);
                            response.writeHead(403, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(err);
                            return;
                        }
                    } else {
                        var err = {
                            "err": {
                                "message": "An authentication header is required.",
                                "code": "missingHeaders"
                            }
                        }
                        var err = JSON.stringify(err);
                        response.writeHead(403, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(err);
                        return;
                    }
                } 
                fs.appendFileSync("./images/" + id + ".png");
                var d = fs.createWriteStream("./images/" + id + ".png");
                data.parts[0].stream.pipe(d);
                if (conf.makeInfoJson == true) {
                    if (request.headers["authentication"]) {
                        var inf = JSON.stringify({
                            "authCode": request.headers["authentication"],
                            "uploader": whoIs(request.headers["authentication"]),
                            "uploadDate": new Date() * 1
                        })
                    } else {
                        var inf = JSON.stringify({
                            "authCode": null,
                            "uploader": "anonymous",
                            "uploadDate": new Date() * 1
                        })
                    }
                    if (!fs.existsSync("./images/info/")) {fs.mkdirSync("./images/info")}
                    fs.writeFileSync("./images/info/" + id + ".json", inf)
                }
                var endData = JSON.stringify({
                    "file": conf.host + "/" + id,
                })
                response.writeHead(200, {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                });
                response.end(endData);
            } else if (!err) {
                var endData = {
                    "err": {
                        "message": "We had an error parsing the body of your request. Try again.",
                        "code": "errorParsing"
                    }
                };
                var endData = JSON.stringify(endData);
                response.writeHead(500, {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                });
                response.end(endData);
            } else {
                var endData = {
                    "err": {
                        "code": err.code,
                        "message": err.message
                    }
                }
                var endData = JSON.stringify(endData);
                response.writeHead(500, {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                });
                response.end(endData);
            }
        })
    } else {
        if (u.pathname == "/") {
            fs.readFile("./html/index.html", function(err, resp) {
                if (!err) {
                    var $ = cheerio.load(resp);
                    if (conf.noHtmlUploads == true) {
                        $("#uploader").remove();
                        var resp = $.html();
                    }
                    if (conf.requireAuth == false) {
                        $("#authCode").remove();
                        $("#authCodeLabel").remove();
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
                    response.end(err.stack || err.code);
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
            if (!conf.requireAuth) {
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
                if (!u.query.auth) {
                    fs.readFile("./html/generateShareX/index.html", function(err, resp) {
                        if (!err) {
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
                            response.end(err.stack || err.code);
                        }
                    })
                } else {
                    var json = JSON.stringify({
                        "Version": "13.1.0",
                        "DestinationType": "FileUploader",
                        "RequestMethod": "POST",
                        "RequestURL": conf.host + "/upload",
                        "Headers": {
                            "authentication": u.query.auth
                        },
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
                }
            }
        } else if (u.pathname == "/imageLineup") {
            if (conf.displayImages == true) {
                var line = fs.readdirSync("./images");
                if (conf.makeInfoJson == true) {
                    if (findNum("info", fs.readdirSync("./images")) !== null) {
                        var k = findNum("info", fs.readdirSync("./images"));
                        var line = rmNum(k, line);
                    } else {
                        var line = line;
                    }
                }
                var l = JSON.stringify(line);
                response.writeHead(200, {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                });
                response.end(l);
            } else {
                var err = JSON.stringify({
                    "err": "notAllowed"
                });
                response.writeHead(500, {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                });
                response.end(err);
            }
        } else if (u.pathname == "/generateAuth") { 
            if (conf.allowAutoAuth == false | !conf.allowAutoAuth) {
                fs.readFile("./html/generateAuth/noPass.html", function(err, resp) {
                    if (!err) {
                        response.writeHead(400, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "text/html"
                        })
                        response.end(resp);
                    } else {
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "text/plain"
                        })
                        response.end(err.stack || err.code);
                    }
                })
            } else {
                if (!u.query.pass && !u.query.title) {
                    fs.readFile("./html/generateAuth/passwordEntry.html", function(err, resp) {
                        if (!err) {
                            response.writeHead(200, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "text/html"
                            })
                            response.end(resp);
                        } else {
                            response.writeHead(500, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "text/plain"
                            })
                            response.end(err.stack || err.code);
                        }
                    })
                } else {
                    if (u.query.pass == conf.pass && u.query.title) {
                        fs.readFile("./html/generateAuth/post-resp/success.html", function(err, resp) {
                            if (!err) {
                                var $ = cheerio.load(resp);
                                var result = "";
                                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
                                for (var c = 0; c < 100; c++) {
                                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                                }
                                if (!fs.existsSync("./auth/")) {fs.mkdirSync("./auth/");}
                                if (!fs.existsSync("./auth/db.json")) {fs.writeFileSync("./auth/db.json", "[]");}
                                if (fs.existsSync("./auth/" + u.query.title.toString() + ".key.txt")) {fs.unlinkSync("./auth/" + u.query.title.toString() + ".key.txt")}
                                fs.writeFileSync("./auth/" + u.query.title.toString() + ".key.txt" , result);
                                var json = JSON.parse(fs.readFileSync("./auth/db.json"));
                                json.push({
                                    "key": result,
                                    "id": u.query.title.toString()
                                });
                                var json = JSON.stringify(json);
                                fs.writeFileSync("./auth/db.json", json);
                                console.log("[ALERT] new key was generated for '" + u.query.title + "'");
                                $("#codeContainer").html(result);
                                $("#shrx").attr("href", "/generateShareX?auth=" + result);
                                var resp = $.html();
                                response.writeHead(200, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "text/html"
                                })
                                response.end(resp);
                            } else {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "text/plain"
                                })
                                response.end(err.stack || err.code);
                            }
                        })
                    } else {
                        fs.readFile("./html/generateAuth/post-resp/incorrect.html", function(err, resp) {
                            if (!err) {
                                var $ = cheerio.load(resp);
                                $("#title").attr("value", u.query.title)
                                var resp = $.html();
                                response.writeHead(200, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "text/html"
                                })
                                response.end(resp);
                            } else {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "text/plain"
                                })
                                response.end(err.stack || err.code);
                            }
                        })
                    }
                }
            }
        } else {
            if (fs.existsSync("./images" + u.pathname + ".jpg")) {
                fs.readFile("./images" + u.pathname + ".jpg", function(err, resp) {
                    if (!err) {
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin":"*",
                            "Content-Type": "image/jpeg"
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
                                "Content-Type": "text/plain"
                            })
                            response.end(err.code);
                        }
                    }
                })
            } else if (fs.existsSync("./images" + u.pathname + ".gif")) {
                fs.readFile("./images" + u.pathname + ".gif", function(err, resp) {
                    if (!err) {
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin":"*",
                            "Content-Type": "image/gif"
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
                                "Content-Type": "text/plain"
                            })
                            response.end(err.code);
                        }
                    }
                })
            } else if (fs.existsSync("./images" + u.pathname + ".png")) {
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
                                "Content-Type": "text/plain"
                            })
                            response.end(err.code);
                        }
                    }
                })
            } else {
                response.writeHead(404, {
                    "Access-Control-Allow-Origin":"*",
                    "Content-Type": "text/plain"
                })
                response.end("404 - image does not exist");
            }
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

function isProperKey(key) {
    var keychain = JSON.parse(fs.readFileSync("./auth/db.json"));
    for (var c in keychain) {
        if (keychain[c].key == key) {return true;} else {continue;}
    }
    return false;
}

function whoIs(key) {
    var keychain = JSON.parse(fs.readFileSync("./auth/db.json"));
    for (var c in keychain) {
        if (keychain[c].key == key) {return keychain[c].id} else {continue;}
    }
    return null;
}

function findNum(a, array) {
    for (var c in array) {
        if (array[c] == a) {return c;} else {continue;}
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