# Zipkin Instrumentation for Express

[![Build Status](https://travis-ci.org/GovTechSG/express-zipkin-instrumentation.svg?branch=master)](https://travis-ci.org/GovTechSG/express-zipkin-instrumentation)

## Installation

```bash
npm add @govtechsg/express-zipkin-instrumentation --save;
```

## Usage

### API

Use the following to include the package:

```javascript
const expressZipkinInstrumentation = require('@govtechsg/express-zipkin-instrumentation');
```

The `expressZipkinInstrumentation` variable will be a function that returns the correct middleware. The arguments are:

- `:serviceName`
- `:zipkinHostname`
- `:options` (optional)

`:serviceName` identifies the current application in the zipkin dashboard.

`:zipkinHostname` is the hostname for the zipkin server. When this is set to `null` (the default behaviour if this is not specified), the trace logs will be routed to `stdout` instead via `console.trace`.

`:options` is an object that can contain the following properties:

- `:serviceNamePostfix`: this will be appended to the `:serviceName` parameter in dashed-case.

### Basic
```javascript
const server = express();
// ...
const expressZipkinInstrumentation = require('@govtechsg/express-zipkin-instrumentation');
server.use(expressZipkinInstrumentation(
  'service-name',
  'http://zipkin.yourdomain.com',
))
```

> The above will result in a service identified in the Zipkin dashboard as `service-name`.

### Complete
```javascript
const server = express();
// ...
const expressZipkinInstrumentation = require('@govtechsg/express-zipkin-instrumentation');
server.use(expressZipkinInstrumentation(
  'service-name',
  'http://zipkin.yourdomain.com',
  {
    serviceNamePostfix: 'development'
  }
))
```

> The above will result in a service identified in the Zipkin dashboard as `service-name-development`.


## Development
### Testing
Run tests using:

```bash
npm run test
```

### Continuous Integration
#### Environment Variables
The following environment variables have to be set in Travis for the pipeline to work

- `GH_USERNAME`: GitHub username
- `GH_ACCESS_TOKEN`: GitHub personal access token
- `NPM_REGISTRY_URL`: Hostname of NPM registry being used
- `NPM_TOKEN`: NPM access token
- `GIT_ORIGIN_REMOTE_PATH`: Path to repository in GitHub

## License

This package is licensed under the MIT license.