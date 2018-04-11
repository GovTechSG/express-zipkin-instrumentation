const {
  BatchRecorder,
  ConsoleRecorder,
  Tracer,
  jsonEncoder,
} = require('zipkin');
const ContextCLS = require('zipkin-context-cls');
const { HttpLogger } = require('zipkin-transport-http');
const { expressMiddleware } = require('zipkin-instrumentation-express');

const LOCAL_CONFIG_JSON_ENCODING = jsonEncoder.JSON_V2;
const LOCAL_CONFIG_ZIPKIN_API_PATH = '/api/v2/spans';

module.exports = zipkinMiddleware;

/**
 * Initialises a Zipkin middleware for use with an express server using a singleton pattern.
 * If :options.serviceNamePostfix is set, the :serviceName will have it appended to the end in
 * dashed case to use as the localServiceName of Zipkin
 *
 * @param {String} serviceName - service identifier of current service
 * @param {String} [zipkinHostname=null] - hostname for the zipkin server
 * @param {String} [options.serviceNamePostfix=null] - postfix to service name
 * @param {Object} options
 *
 * @return {Function} express middleware
 */
function zipkinMiddleware(
  serviceName,
  zipkinHostname = null,
  {
    serviceNamePostfix = null,
  } = {}
) {
  if (zipkinMiddleware._instance === null) {
    const serviceId = zipkinMiddleware.createServiceId(serviceName, serviceNamePostfix);
    zipkinMiddleware._context = zipkinMiddleware.createContext(serviceId);
    zipkinMiddleware._recorder = zipkinMiddleware.createRecorder(zipkinHostname);
    zipkinMiddleware._instance =
      zipkinMiddleware.createInstance(
        serviceId,
        zipkinMiddleware._context,
        zipkinMiddleware._recorder
      );
  }
  return zipkinMiddleware._instance;
};

zipkinMiddleware.createServiceId = (serviceName, serviceNamePostfix) =>
  (!serviceNamePostfix) ? serviceName : `${serviceName}-${serviceNamePostfix}`;

zipkinMiddleware._context = null;
zipkinMiddleware.createContext =
  (serviceName) => (new ContextCLS(serviceName));
zipkinMiddleware.getContext = () => zipkinMiddleware._context;

zipkinMiddleware._instance = null;
zipkinMiddleware.createInstance =
  (serviceName, context, recorder) => (
    expressMiddleware({
      tracer: new Tracer({
        ctxImpl: context,
        recorder: recorder,
        localServiceName: serviceName,
      }),
    })
  );
zipkinMiddleware.getInstance = () => zipkinMiddleware._instance;

zipkinMiddleware._recorder = null;
zipkinMiddleware.createRecorder =
  (zipkinHostname) => (
    (!zipkinHostname) ?
      new ConsoleRecorder(console.trace)
      : new BatchRecorder({
        logger: new HttpLogger({
          endpoint: `${zipkinHostname}${LOCAL_CONFIG_ZIPKIN_API_PATH}`,
          jsonEncoder: LOCAL_CONFIG_JSON_ENCODING,
        }),
      })
  );
zipkinMiddleware.getRecorder = () => zipkinMiddleware._recorder;
