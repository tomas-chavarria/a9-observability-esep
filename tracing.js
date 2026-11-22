const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const { NodeSDK } = require('@opentelemetry/sdk-node');

const {
   getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

// With no arguments, the exporters send to http://localhost:4318 over OTLP/HTTP
// (/v1/traces and /v1/metrics). Override with the standard environment variable:
//   OTEL_EXPORTER_OTLP_ENDPOINT=http://your-collector:4318

const sdk = new NodeSDK({
   resource: resourceFromAttributes({
       [ATTR_SERVICE_NAME]: "todo-service"
   }),

   traceExporter: new OTLPTraceExporter(),

   metricReader: new PeriodicExportingMetricReader({
       exporter: new OTLPMetricExporter(),
   }),

   instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Flush any buffered telemetry before the process exits.
process.on('SIGTERM', () => {
   sdk.shutdown().finally(() => process.exit(0));
});