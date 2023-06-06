## Coding

Internally, the PDF is "printed" with Chrome/[Chromium](https://github.com/chromium/chromium) as a headless browser. The browser is controlled with Google's [puppeteer](https://github.com/puppeteer/puppeteer).

* The key functionality using `puppeteer` is in [mkpdf.ts](./src/mkpdf.ts)


## Copyright / License

Copyright 2023 Dr. Juan Miguel Cejuela

SPDX-License-Identifier: Apache-2.0

See files: [LICENSE](./LICENSE) & [NOTICE](./NOTICE).
