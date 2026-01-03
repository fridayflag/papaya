FROM couchdb:latest

# Install envsubst for environment variable substitution
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

# Copy the CouchDB configuration template
COPY database/papaya.couchdb.ini /tmp/papaya.couchdb.ini.template

# Create a script to process the config at runtime
RUN echo '#!/bin/bash\n\
# Process the CouchDB configuration with environment variables\n\
envsubst < /tmp/papaya.couchdb.ini.template > /opt/couchdb/etc/default.d/papaya.ini\n\
\n\
# Start CouchDB\n\
exec /docker-entrypoint.sh "$@"' > /usr/local/bin/process-config.sh && \
    chmod +x /usr/local/bin/process-config.sh

ENTRYPOINT ["/usr/local/bin/process-config.sh"]
CMD ["couchdb"]
