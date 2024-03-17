#!/usr/bin/env node

const httpProxy = require('http-proxy')
const pem = require('pem')
const console = require('console')
const fs = require('fs')
const path = require('path')

const argv = require('optimist')
  .usage(
    'Put https in front of your running app\nUsage: $0 <options>\nExample: $0 -t http://localhost:8080 -p 8888 --keys ~'
  )
  .demand('t')
  .alias('t', 'target')
  .describe('t', 'target address, like http://localhost:80')


  .alias('p', 'port')
  .describe('p', 'port to use for https')

  .describe('keys', 'path for storing .key.pem and .cert.pem')
  .default('keys', '.')

  .alias('a', 'auth')
  .describe('a', 'Basic authentication i.e. \'user:password\' to compute an Authorization header.')

  .describe('insecure', 'flag to accept insecure connections')
  .alias('k', 'insecure')

  .describe('xfwd', 'adds x-forward headers')
  .alias('x', 'xfwd')

  .describe(
    'rewrite-origin',
    'changes the origin of the host header to the target URL'
  )
  .default('rewrite-origin', false)

  .describe(
    'rewrite-location',
    'rewrites the location host/port on (201/301/302/307/308) redirects based on requested host/port'
  )
  .default('rewrite-location', false)

  .describe('rewrite-cookies-domain', 'rewrites domain of set-cookie headers')
  .default('rewrite-cookies-domain', false).argv

function getKeys (callback) {
  const serviceKey = getFile('.key.pem')
  const certificate = getFile('.cert.pem')

  if (serviceKey && certificate) {
    callback(null, { serviceKey, certificate })
  } else {
    pem.createCertificate(
      {
        days: 1000,
        selfSigned: true
      },
      (err, keys) => {
        if (err) {
          callback(err, null)
        }
        storeFile('.key.pem', keys.serviceKey)
        storeFile('.cert.pem', keys.certificate)
        callback(null, keys)
      }
    )
  }
}

function getFile (file) {
  const location = path.resolve(argv.keys || '.', file)
  if (fs.existsSync(location)) {
    return fs.readFileSync(location)
  }
  return null
}

function storeFile (file, content) {
  const location = path.resolve(argv.keys || '.', file)
  fs.writeFileSync(location, content)
}

getKeys((err, keys) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const port = argv.port || 443;
  httpProxy
    .createServer({
      target: argv.target,
      ssl: {
        key: keys.serviceKey,
        cert: keys.certificate
      },
      auth: argv.auth,
      secure: !argv.insecure,
      xfwd: argv.xfwd,
      changeOrigin: argv['rewrite-origin'],
      autoRewrite: argv['rewrite-location'],
      cookieDomainRewrite: argv['rewrite-cookies-domain'] ? '' : false,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
    .listen(port, (_) => {
      console.log(`HTTPS proxy started on https://localhost:${port}`)
    })
})
