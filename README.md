# HLTV Live Games

[![Codacy][codacy-img]][codacy-url]
[![Steam Donate][steam-donate-img]][steam-donate-url]

## Introduction

This module started off as a simple addition to hltv-livescore, making it simple to get information for live games. Since then it has evolved into a full and independent yet lightweight module which makes working with HLTV a breeze.

## Usage

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
