const { Reporter } = require('@parcel/plugin');
import parcelTypes from '@parcel/types';
const { saveAsPdf } = require('./mkpdf');

function getBundleByType(bundles: parcelTypes.PackagedBundle[], type: string): parcelTypes.PackagedBundle | undefined {
  return bundles.find(elem => elem.type == type);
}

function getBundleFilePathByType(bundles: parcelTypes.PackagedBundle[], type: string): string | undefined {
  return getBundleByType(bundles, type)?.filePath;
}

module.exports = new Reporter({
  async report({ event }: { event: parcelTypes.ReporterEvent }) {
    if (event.type === 'buildSuccess') {
      const bundles: parcelTypes.PackagedBundle[] = event.bundleGraph.getBundles();
      const htmlInput = getBundleFilePathByType(bundles, "html");
      const cssInputOpt = getBundleFilePathByType(bundles, "css");

      // process.stdout.write(`✅ Built ${bundles.length} bundles:\n* ${htmlInput}\n* ${cssInputOpt}\n`);

      await saveAsPdf(htmlInput, cssInputOpt);
    }
  }
});