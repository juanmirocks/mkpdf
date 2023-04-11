[![npm](https://img.shields.io/npm/v/parcel-reporter-mkpdf?style=for-the-badge)](https://www.npmjs.com/package/parcel-reporter-mkpdf)

# parcel-reporter-mkpdf

📦 Plugin for [Parcel](https://parceljs.org) web build tool:

Each time `parcel` builds an HTML (either in serve/watch or production mode), this plugin will save it as a PDF.
The exported PDF will look the same as if you had used the `Print` functionality from Chrome.

Key features:

* 💫 **Iterative** development: your PDF is generated every time `parcel` finishes an HTML built.
* 🎨 **Style** the PDFs with your CSS/Less/Sass.
* 🚀 **Fast** "printing" of the PDFs thanks to internal caching. Your HTML linked external files (e.g. .js/.css) will be fetched only once.


## Install package

Using `npm`:

```shell
npm install parcel-reporter-mkpdf --save-dev
```

Analogously, using `yarn`:

```shell
yarn add parcel-reporter-mkpdf --dev
```


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

That's all! From then on, each time parcel builds an HTML (e.g., `dist/someFilename.html`), the PDF will be generated in the same folder, with same filename but with changed file extension (i.e., `dist/someFilename.pdf`).


## Coding

Internally, the PDF is "printed" with [Chromium](https://github.com/chromium/chromium) as a headless browser. The browser is controlled with Google's [puppeteer](https://github.com/puppeteer/puppeteer).

* The key functionality using `puppeteer` is in [mkpdf.ts](./workspaces/mkpdf/src/mkpdf.ts#L67)
* The parcel plugin wrapper code is in [index.ts](./src/index.ts#L35)
