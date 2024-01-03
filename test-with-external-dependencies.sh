npm install
OTEL_TRACES_EXPORTER="otlp" \
    OTEL_EXPORTER_OTLP_PROTOCOL=http/json \
    OTEL_NODE_RESOURCE_DETECTORS="all" \
    OTEL_EXPORTER_OTLP_ENDPOINT="http://127.0.0.1:4318/" \
    OTEL_SERVICE_NAME="drizzle" \
    NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register --require @opentelemetry/exporter-trace-otlp-http" \
    npm run test