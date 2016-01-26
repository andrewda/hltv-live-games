var fs = require('fs');
var request = require('request');
var parseString = require('xml2js').parseString;
var unixTime = require('unix-time');
var cheerio = require ('cheerio');

var liveGames, liveMatchid, jsonArray, numgames;

updateGames();
setInterval(updateGames, 30000); //check games every 30 seconds

function updateGames() {
    liveGames = [];
    liveMatchid = [];
    jsonArray = [];
    
    numgames = 0;
    
    console.log('\n---------------------\n');
    
    request('http://www.hltv.org/hltv.rss.php?pri=15', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            parseString(body, function (err, result) {
                if (err) throw err;
                result.rss.channel[0].item.forEach(function(game) {
                    console.log(game.title[0]);
                    if (unixTime(game.pubDate[0]) - 180 <= unixTime(new Date())) {
                        liveGames.push(game);
                        
                        request(game.link[0], function(error, response, body) {
                            if (!error && response.statusCode == 200) {
                                $ = cheerio.load(body);
                            
                                var html  = $('.hotmatchbox').text();
                                var html2 = $('.text-center', '.hotmatchbox').text().trim().split(' ').clean('');
                                var patt  = new RegExp('matchid = ([0-9]*)');
                                
                                if (/matchid = [0-9]*/.test(html) && html2.length >= 10) {
                                    numgames++;
                                    
                                    var matchid = patt.exec(html)[1];
                                
                                    console.log(game.title[0] + ' >>> ' + matchid);
                                    
                                    liveMatchid.push(matchid);
                                    
                                    jsonArray.push({
                                        teams: [game.title[0].split(' vs ')[0], game.title[0].split(' vs ')[1]],
                                        matchid: matchid,
                                        players: [[html2[0], html2[1], html2[2], html2[3], html2[4]], [html2[5], html2[6], html2[7], html2[8], html2[9]]],
                                        unix_start: unixTime(game.pubDate[0]),
                                        time_since_start: unixTime(new Date()) - unixTime(game.pubDate[0])
                                    });
                                    
                                    var jsonGames = JSON.stringify(jsonArray);
                                    
                                    fs.writeFile('games.json', jsonGames, function (err) {
                                        if (err) throw err;
                                    });
                                } else {
                                    console.log(game.title[0] + ' >>> NO MATCHID');
                                }
                            }
                        });
                    }
                });
                
                setTimeout(function() {
                    if (numgames == 0) {
                        fs.writeFile('games.json', '{ "nogames": true }', function (err) {
                            if (err) throw err;
                        });
                    }
                }, 3000);
                console.log();
            });
        }
    });
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
