# GemBrow

The Gemma Browser is a modern frontend for [Gemma][^gemma] built on top of the [Gemma REST API][^gemma-rest-api] with
[Vue.js][^vuejs] and [Vuetify][^vuetify].

## Requirements

 - Node.js
 - npm
 - an HTTP server capable of delivering static assets (for deployment)

## Installation

For local development or deployment, you must install the dependencies first:

```bash
npm install
```

## Local development

Configurations are located in `.env.development`. Use `.env.development.local` to supply secrets.

```bash
npm run serve
```

## Deployment

Configurations are located in `.env.production`. Use `.env.production.local` to supply secrets.

```bash
npm run build
rsync -av dist/ foo@bar:/deployment/destination/
```

When deploying to production, make sure that static assets are compressed. This is particularly important for the
JavaScript and CSS bundles, and also fonts.

If you use Apache HTTP Server to serve the content, use the following configuration:

```apache
Alias /browse /deployment/destination
<Directory /deployment/destination>
  Options -Indexes   # prevent listing
  AllowOverride None # ignore .htaccess
  # allow everyone to access
  Order allow,deny
  Allow from all
  # compress static assets
  AddOutputFilterByType DEFLATE text/css text/javascript application/javascript font/woff2 font/woff font/sfnt application/font-fsnt application/vnd.ms-fontobject image/svg+xml
</Directory>
```

[^gemma]: https://gemma.msl.ubc.ca/
[^gemma-rest-api]: https://gemma.msl.ubc.ca/resources/restapidocs/
[^vuejs]: https://vuejs.org/
[^vuetify]: https://vuetifyjs.com/