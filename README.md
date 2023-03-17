# parcel-reporter-mkpdf

Plugin for [Parcel](https://parceljs.org): each time an HTML is built by parcel (either in serve/watch/development or production mode), this is exported as a PDF.
Internally, the PDF is "printed" with [Chromium](https://github.com/chromium/chromium) as a headless browser. That is, the generated PDF will look the same as if you had used the `Print` functionality from Chrome.
The browser is controlled with Google's [puppeteer](https://github.com/puppeteer/puppeteer).


## How to use

To hook this plugin to parcel's builds, add something like the following to your `.parcelrc`(https://parceljs.org/features/plugins/#.parcelrc) configuration:

```json
{
  "extends": "@parcel/config-default",
  "reporters": [
    "...",
    "parcel-reporter-mkpdf"
  ]
}
```

As an alternative, use the `--reporter` option in parcel's [CLI](https://parceljs.org/getting-started/migration/#cli); example:

```shell
npx parcel serve --reporter parcel-reporter-mkpdf
```
