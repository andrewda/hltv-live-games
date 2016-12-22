# HLTV Live Games

[![Codacy][codacy-img]][codacy-url]
[![Steam Donate][steam-donate-img]][steam-donate-url]

## Introduction

This is an incredibly simple module which scrapes games from HLTV. More
features may be added in the future.

## Usage

### getLiveGames(secondary, callback)

If `secondary` is truthy, another request will be made by `hltv-live-games` to
get more information about the games (time and players). Otherwise, only one
request will be made, making it much likely to get rate limited.

```js
const getLiveGames = require('hltv-live-games');

getLiveGames(true, (err, games) => {
	if (err) {
		console.log(err);
	} else {
		console.log(games);
	}
});
```

<!-- Badge URLs -->

[codacy-img]:       https://img.shields.io/codacy/grade/1c459a215964481fa286267a4ea9c98d.svg?style=flat-square
[codacy-url]:       https://www.codacy.com/app/dassonville-andrew/hltv-live-games
[steam-donate-img]: https://img.shields.io/badge/donate-Steam-lightgrey.svg?style=flat-square
[steam-donate-url]: https://steamcommunity.com/tradeoffer/new/?partner=132224795&token=HuEE9Mk1
