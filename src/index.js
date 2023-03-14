"use strict";

const { Reporter } = require('@parcel/plugin');
const { saveAsPdf } = require('./mkpdf.js');

function getBundleByType(bundles, type) {
  return bundles.find(elem => elem.type == type);
}

function getBundleFilePathByType(bundles, type) {
  return getBundleByType(bundles, type).filePath;
}

module.exports = new Reporter({
  async report({ event }) {
    if (event.type === 'buildSuccess') {
      const bundles = event.bundleGraph.getBundles();
      const htmlInput = getBundleFilePathByType(bundles, "html");
      const cssInputOpt = getBundleFilePathByType(bundles, "css");

      // process.stdout.write(`✅ Built ${bundles.length} bundles:\n* ${htmlInput}\n* ${cssInputOpt}\n`);

      await saveAsPdf(htmlInput, cssInputOpt);
    }
  }
});