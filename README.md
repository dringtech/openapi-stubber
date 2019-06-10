# openapi-stubber

[![Build Status](https://travis-ci.org/dringtech/openapi-stubber.svg?branch=master)](https://travis-ci.org/dringtech/openapi-stubber)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/dringtech/openapi-stubber/master)](https://stryker-mutator.github.io)

> Auto-stubbing for OpenAPI V3 specs

This is a utility wrapper around [`openapi-backend`](https://www.npmjs.com/package/openapi-backend) aimed
at rapidly standing up a stub server, primarily for testing purposes.

## Installation

```sh
npm install --save-dev @dringtech/openapi-stubber
```

## Usage

The `loadStub` and `tearDown` functions each return a promise, so can work nicely with
`async` code.

Load the required stubs before running tests (or whenever).

```js
const stubber = require('@dringtech/openapi-stubber');

await stubber.loadStub({ name: 'Stub Name', spec: SPEC_DEF, port: 8000 });
```

The spec (`SPEC_DEF`) can be anything that `openapi-backend` understands, primarily:

* Path to an OpenAPI V3 file
* An OpenAPI spec object

Once the tests (or whatever) are completed call the following code to clean up:

```js
await stubber.tearDown();
```

### Logging

If you want to log the stub output, call the following before any stubs are loaded:

```js
stubber.setupLogging({ logFile: '/path/to/log/file.log' });
```
