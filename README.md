# HLTV Live Games

[![Codacy Badge](https://api.codacy.com/project/badge/grade/1c459a215964481fa286267a4ea9c98d)](https://www.codacy.com/app/dassonville-andrew/hltv-live-games)

## Introduction

This module started off as a simple addition to hltv-livescore, making it simple to get information for live games. Since then it has evolved into a full and independent yet lightweight module which makes working with HLTV a breeze.

## Methods

### Constructor([options])
- `options` - An optional object containing options.
	- `pollTime` - The time (in milliseconds) between each poll. Defaults to 30000.

Construct a new `LiveGames`.

### getLiveGames(callback)
- `callback` - Called when we're done retrieving information on all live games.
	- `err` - An error object. Will be `null` if no error.
	- `games` - An array of game objects.

Retrieve data on all live games.

## Events

### newGame
- `game` - The game object of the game which just went live.

Emitted when HLTV's scorebot starts on a live game or game which will be live within the next 3 minutes.
