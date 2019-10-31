# lighthouse-ci

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

```json
{
	"url": "http://localhost:3000",
	"metrics/first-contentful-paint": 1000,
	"metrics/first-meaningful-paint": 1000,
	"metrics/first-cpu-idle": 1000,
	"metrics/interactive": 1000,
	"byte-efficiency/total-byte-weight": 1000,
	"works-offline": true,
}
```

Example for multiple urls:

```json
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
- [ ] Supports budgets
- [ ] Human readable display for values and goals
