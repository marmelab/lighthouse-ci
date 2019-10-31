# lighthouse-ci

Run lighthouse in your CI

This CLI will start a chrome instance in headless mode and run lighthouse on the urls you specified, checking
that your scores match your expectations.

## Install

```sh
npm install --save-dev lighthouse-ci
# or
yarn add -D lighthouse-ci
```

## CLI

```sh
lighthouse-ci --help
lighthouse-ci
```

## Configuration

Add a `.lighthousecirc` file at your project root.

Basically you either supply an object or an array of object.
This object must contain an `url` property specifying the url to check and can
contain all the configuration options supported by the
[lighthouse API](https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md)
with the addition of of the following properties:

- `logLevel`: 'silent'|'error'|'info'|'verbose';

Example for a single url:

```js
{
	"url": "http://localhost:3000",
	"metrics/first-contentful-paint": 1000,
	"metrics/first-meaningful-paint": 1000,
	"metrics/first-cpu-idle": 1000,
	"metrics/interactive": 1000,
	"byte-efficiency/total-byte-weight": 1000,
	"works-offline": true,
	"budgets": [
		{
			"resourceSizes": [
				{
					"resourceType": "script",
					"budget": 100000
				},
				{
					"resourceType": "image",
					"budget": 100
				},
				{
					"resourceType": "third-party",
					"budget": 200
				},
				{
					"resourceType": "total",
					"budget": 100000
				}
			],
			"resourceCounts": [
				{
					"resourceType": "third-party",
					"budget": 10
				},
				{
					"resourceType": "total",
					"budget": 50
				}
			]
		}
	]
}
```

Example for multiple urls:

```js
{
	// Defaults for all urls
	"metrics/first-contentful-paint": 1000,
	"metrics/first-meaningful-paint": 1000,
	"metrics/first-cpu-idle": 1000,
	"metrics/interactive": 1000,
	"byte-efficiency/total-byte-weight": 1000,
	"works-offline": true,
	
	"urls": [
		"http://localhost:3000",
		"http://localhost:3000/page",
		{
			"url": "http://localhost:3000/another_page",
			// Specific goals for this url
			"metrics/first-contentful-paint": 1000,
			"metrics/first-meaningful-paint": 1000,
			"metrics/first-cpu-idle": 1000,
			"metrics/interactive": 1000,
			"byte-efficiency/total-byte-weight": 1000,
		}
	]
}
```

## Development

There are 2 available commands:

- `npm run dev` - Start development mode and recompile on change
- `npm run build` - Build a final distributable for npm

## Roadmap

- [x] Supports simple binary and numeric metrics
- [ ] Supports complex numeric metrics (such as `user-timings`)
- [x] Supports budgets
- [ ] Human readable display for values and goals
