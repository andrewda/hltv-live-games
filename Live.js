var async = require("async");
var request = require("request");
var parseString = require("xml2js").parseString;
var unixTime = require("unix-time");
var cheerio = require("cheerio");
var EE = require("events").EventEmitter;
var inherits = require("util").inherits;

var self;

function Live(options) {
    options = options || {};

    this.pollTime = options.pollTime || 30000;

    this.liveMatchid = [];
    this.first = true;

    this.pollGames();
    setInterval(this.pollGames, this.pollTime);

    self = this;
}

inherits(Live, EE);

Live.prototype.pollGames = function() {
    request("http://www.hltv.org/hltv.rss.php?pri=15", function(err, response, body) {
        if (!err && response.statusCode === 200) {
            parseString(body, function(err, result) {
                if (err) {
                    emit("debug", {
                        error: err
                    });
                } else {
                    if (self.first) {
                        result.rss.channel[0].item.forEach(function(game) {
                            if (unixTime(game.pubDate[0]) <= unixTime(new Date())) {
                                request(game.link[0], function(error, response, body) {
                                    if (!error && response.statusCode === 200) {
                                        $ = cheerio.load(body);

                                        var html = $(".hotmatchbox").text();
                                        var html2 = $(".text-center", ".hotmatchbox").text().trim().split(" ").clean("");
                                        var midpatt = new RegExp("matchid = ([0-9]*)");

                                        if (/matchid = [0-9]*/.test(html) && html2.length >= 10) {
                                            var matchid = midpatt.exec(html)[1];

                                            if (self.liveMatchid.indexOf(matchid) === -1) {
                                                self.liveMatchid.push(matchid);
                                            }
                                        }
                                    }
                                });
                            }
                        });

                        self.first = false;
                    } else {
                        result.rss.channel[0].item.forEach(function(game) {
                            if (unixTime(game.pubDate[0]) - 600 <= unixTime(new Date())) {
                                request(game.link[0], function(error, response, body) {
                                    if (!error && response.statusCode === 200) {
                                        $ = cheerio.load(body);

                                        var html = $(".hotmatchbox").text();
                                        var html2 = $(".text-center", ".hotmatchbox").text().trim().split(" ").clean("");
                                        var midpatt = new RegExp("matchid = ([0-9]*)");
                                        var lidpatt = new RegExp("listid = ([0-9]*)");
                                        var boxpatt = new RegExp("Best of ([0-9]*)");

                                        if (/matchid = [0-9]*/.test(html) && html2.length >= 10) {
                                            var matchid = midpatt.exec(html)[1];
                                            var listid = lidpatt.exec(html)[1];
                                            var bestof = boxpatt.exec(html)[1];

                                            if (self.liveMatchid.indexOf(matchid) === -1) {
                                                self.liveMatchid.push(matchid);

                                                emit("newGame", {
                                                    teams: [game.title[0].split(" vs ")[0], game.title[0].split(" vs ")[1]],
                                                    matchid: matchid,
                                                    listid: listid,
                                                    bestof: bestof,
                                                    time: getTime(unixTime(game.pubDate[0])),
                                                    players: [
                                                        [html2[0], html2[1], html2[2], html2[3], html2[4]],
                                                        [html2[5], html2[6], html2[7], html2[8], html2[9]]
                                                    ],
                                                    start_time: unixTime(game.pubDate[0]),
                                                    time_since_start: unixTime(new Date()) - unixTime(game.pubDate[0])
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        } else {
            emit("debug", {
                error: err,
                status: response.statusCode
            });
        }
    });
};

Live.prototype.getLiveGames = function(callback) {
    async.waterfall([
        function(done) {
            request("http://www.hltv.org/hltv.rss.php?pri=15", function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    parseString(body, function(err, result) {
                        if (err) {
                            done(err);
                        } else {
                            done(null, result);
                        }
                    });
                }
            });
        },
        function(result, done) {
            var games = [];
            async.each(result.rss.channel[0].item, function(game, doneEach) {
                if (unixTime(game.pubDate[0]) - 180 <= unixTime(new Date())) {
                    request(game.link[0], function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            $ = cheerio.load(body);

                            var html = $(".hotmatchbox").text();
                            var html2 = $(".text-center", ".hotmatchbox").text().trim().split(" ").clean("");
                            var midpatt = new RegExp("matchid = ([0-9]*)");
                            var lidpatt = new RegExp("listid = ([0-9]*)");
                            var boxpatt = new RegExp("Best of ([0-9]*)");

                            if (/matchid = [0-9]*/.test(html) && html2.length >= 10) {
                                var matchid = midpatt.exec(html)[1];
                                var listid = lidpatt.exec(html)[1];
                                var bestof = boxpatt.exec(html)[1];

                                games.push({
                                    teams: [game.title[0].split(" vs ")[0], game.title[0].split(" vs ")[1]],
                                    matchid: matchid,
                                    listid: listid,
                                    bestof: bestof,
                                    time: getTime(unixTime(game.pubDate[0])),
                                    players: [
                                        [html2[0], html2[1], html2[2], html2[3], html2[4]],
                                        [html2[5], html2[6], html2[7], html2[8], html2[9]]
                                    ],
                                    start_time: unixTime(game.pubDate[0]),
                                    time_since_start: unixTime(new Date()) - unixTime(game.pubDate[0])
                                });

                                doneEach();
                            } else {
                                doneEach();
                            }
                        } else {
                            doneEach();
                        }
                    });
                } else {
                    doneEach();
                }
            }, function() {
                done(null, games);
            });
        }
    ], function(err, games) {
        if (err) {
            callback(err);
        } else {
            callback(null, games);
        }
    });
};

function emit(event, message) {
    self.emit(event, message);
}

function getTime(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);

    return {
        year: a.getFullYear(),
        month: a.getMonth() + 1,
        date: a.getDate(),
        hour: a.getHours(),
        min: a.getMinutes(),
        sec: a.getSeconds()
    };
}

Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

module.exports = Live;
