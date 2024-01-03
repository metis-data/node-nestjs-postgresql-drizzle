const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');

export const startOtelInstrumentation = (otelCollectorPort) => {
  const sdk = new opentelemetry.NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'sequelize',
    }),
    traceExporter: new OTLPTraceExporter({
      url: 'http://127.0.0.1:' + otelCollectorPort + '/v1/traces',
      compression: 'none',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  
  sdk.start();
};
