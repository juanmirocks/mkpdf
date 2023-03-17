# parcel-reporter-mkpdf

📦 Plugin for [Parcel](https://parceljs.org) web build tool:

Each time `parcel` builds an HTML (either in serve/watch or production mode), this plugin will save it as a PDF.
The exported PDF will look the same as if you had used the `Print` functionality from Chrome.

Key features:

* 💫 Quick, **iterative** development: your PDF is generated every time `parcel` finishes an HTML built.
* 💅 Your CSS/Less/Sass **style** will also be applied.
* 🚀 The "printing" of the PDFs is **fast** thanks to internal caching. Your HTML linked external files (e.g. .js/.css) will be fetched only once.


## How to use

To hook this plugin to parcel's builds, add this plugin name to the field `reporters` in your `.parcelrc`(https://parceljs.org/features/plugins/#.parcelrc) configuration; example:

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


## Coding

Internally, the PDF is "printed" with [Chromium](https://github.com/chromium/chromium) as a headless browser. The browser is controlled with Google's [puppeteer](https://github.com/puppeteer/puppeteer).

* The key functionality using `puppeteer` is in [mkpdf.ts](./workspaces/mkpdf/src/mkpdf.ts#L67)
* The parcel plugin wrapper code is in [index.ts](./src/index.ts#L35)
