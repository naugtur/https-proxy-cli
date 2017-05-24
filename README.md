# https-proxy-cli [![Build Status](https://travis-ci.org/naugtur/https-proxy-cli.svg?branch=master)](https://travis-ci.org/naugtur/https-proxy-cli)

One command to run a local https proxy.

No need to set up certs!

## Install

```
npm install -g https-proxy-cli
```

## Usage

```
https-proxy -t http://localhost:80 -p 1234
```

```
https-proxy --help

Put https in front of your running app
Usage: /usr/local/bin/node ./cli.js

Options:
  -t, --target  target address, like http://localhost:80  [required]
  -p, --port    port to use for https                     [required]

```
