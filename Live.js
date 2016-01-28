var request = require('request');
var parseString = require('xml2js').parseString;
var unixTime = require('unix-time');
var cheerio = require ('cheerio');
var EE = require('events').EventEmitter;
var inherits = require('util').inherits;

var liveMatchid = [];
var _this;

function Live(options) {
    _this = this;
    
    if (options.polling) {
        this.pollTime = options.polling;
    } else {
        this.pollTime = 30000;
    }
    
    setTimeout(this.pollGames, this.pollTime);
}

inherits(Live, EE);

Live.prototype.pollGames = function() {
    request('http://www.hltv.org/hltv.rss.php?pri=15', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            parseString(body, function (err, result) {
                if (err) throw err;
                result.rss.channel[0].item.forEach(function(game, index) {
                    if (unixTime(game.pubDate[0]) - 180 <= unixTime(new Date())) {
                        request(game.link[0], function(error, response, body) {
                            if (!error && response.statusCode == 200) {
                                $ = cheerio.load(body);
                            
                                var html  = $('.hotmatchbox').text();
                                var html2 = $('.text-center', '.hotmatchbox').text().trim().split(' ').clean('');
                                var midpatt  = new RegExp('matchid = ([0-9]*)');
                                var lidpatt  = new RegExp('listid = ([0-9]*)');
                                
                                if (/matchid = [0-9]*/.test(html) && html2.length >= 10) {
                                    var matchid = midpatt.exec(html)[1];
                                    var listid = lidpatt.exec(html)[1];
                                    
                                    if (liveMatchid.indexOf(matchid) === -1) {
                                        liveMatchid.push(matchid);
                                        
                                        emit('newGame', {
                                            teams: [game.title[0].split(' vs ')[0], game.title[0].split(' vs ')[1]],
                                            matchid: matchid,
                                            listid: listid,
                                            players: [[html2[0], html2[1], html2[2], html2[3], html2[4]], [html2[5], html2[6], html2[7], html2[8], html2[9]]],
                                            start_time: unixTime(game.pubDate[0]),
                                            time_since_start: unixTime(new Date()) - unixTime(game.pubDate[0])
                                        });
                                    }
                                }
                            }
                        });
                    }
                });
            });
        }
    });
    
    setTimeout(this.pollGames, this.pollTime);
};

function emit(event, message) {
    _this.emit(event, message);
}

Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {         
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

module.exports = Live;
