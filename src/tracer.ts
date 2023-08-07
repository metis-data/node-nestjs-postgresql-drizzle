import opentelemetry from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  getMetisExporter,
  MetisHttpInstrumentation,
  MetisPgInstrumentation,
  getResource,
} from '@metis-data/pg-interceptor';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

let metisExporter; 
let tracerProvider;

const connectionString = process.env.DATABASE_URL;

export const shudownhook = async () => {
  console.log('Shutting down tracer provider and exporter...');
  await tracerProvider?.shutdown();
  await metisExporter?.shutdown();
  console.log('Tracer provider and exporter were shut down.');
}

process.on('SIGINT', () => {
  shudownhook().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  shudownhook().finally(() => process.exit(0));
});

export const startMetisInstrumentation = () => {
  tracerProvider = new BasicTracerProvider({
    resource: getResource(process.env.METIS_SERVICE_NAME, process.env.METIS_SERVICE_VERSION)
  });

  metisExporter = getMetisExporter(process.env.METIS_API_KEY);

  tracerProvider.addSpanProcessor(new BatchSpanProcessor(metisExporter));

  if (process.env.OTEL_DEBUG === "true") {
    tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  const contextManager = new AsyncHooksContextManager();

  contextManager.enable();
  opentelemetry.context.setGlobalContextManager(contextManager);

  tracerProvider.register();

  const excludeUrls = [/favicon.ico/];
  registerInstrumentations({
    instrumentations: [
      new MetisPgInstrumentation({ connectionString }), 
      new MetisHttpInstrumentation(excludeUrls)
    ],
  });
};
