#!/usr/bin/env node

const httpProxy = require('http-proxy')
const pem = require('pem')
const console = require('console')
const fs = require('fs')

const argv = require('optimist')
    .usage('Put https in front of your running app\nUsage: $0')
    .demand('t')
    .alias('t', 'target')
    .describe('t', 'target address, like http://localhost:80')
    .demand('p')
    .alias('p', 'port')
    .describe('p', 'port to use for https')
    .argv

function getKeys (callback) {
  const serviceKey = getFile('.key.pem')
  const certificate = getFile('.cert.pem')

  if (serviceKey && certificate) {
    callback(null, {serviceKey, certificate})
  } else {
    pem.createCertificate({
      days: 1000,
      selfSigned: true
    }, (err, keys) => {
      if (err) {
        callback(err, null)
      }
      fs.writeFileSync('.key.pem', keys.serviceKey)
      fs.writeFileSync('.cert.pem', keys.certificate)
      callback(null, keys)
    })
  }
}

function getFile (path) {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path)
  }
  return null
}

getKeys((err, keys) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  httpProxy.createServer({
    target: argv.target,
    ssl: {
      key: keys.serviceKey,
      cert: keys.certificate
    }
  }).listen(argv.port, _ => {
    console.log(`HTTPS proxy started on https://localhost:${argv.port}`)
  })
})
