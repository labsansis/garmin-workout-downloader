# Garmin Workout Downloader

Garmin watches have a pretty good interface for recording strength training workouts.
However, it gets pretty clunky when you try to look through your past workouts or analyze
any of the data.

To make matters worse, all of the Garmin export file formats are missing
some crucial information such as any exercise identifiers.

This repo contains a browser extension to scrape Garmin Connect for workout data,
including strength traiing details, and download this data locally.

# Installation

At the time of writing this is not published on any extension hubs so needs to be
run as a temporary extension. Also note that this has only been tested on
Firefox 114.0.2.

1. Clone or download this repo
2. Follow instructions to load a temp extension for the latest browser version. [This](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#trying_it_out) is a recent one for Firefox.

# Use

1. Open https://connect.garmin.com/modern/
2. Sign in
3. Open the extension to download activity data
4. A JSON file containing the data will be automatically downloaded.

## What data does the output contain?

The downloaded JSON is pretty close to the internal Garmin Connect responses to
some API calls, in particular Activity List and and an activiy's Exercise Sets.
These are then joined up for one download file.

# How does it work?

A background script listens to Garmin Connect network calls and grabs the auth header.
This is why you need to open Garmin Connect and sign in.

When you ask the extension to download data, it reuses this auth header and makes a number
of calls to the Garmin Connect backend to fetch workout data, stitches it all together into
one big JSON array and downloads it.

This means that it can take a little while for everything to be fetched if you ask for many
activities. You may also get hit by rate limiters, although I haven't hit that issue myself.

# Contributing

Feel free to open PRs, issues etc.