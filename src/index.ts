import { Reporter } from '@parcel/plugin';
import parcelTypes from '@parcel/types';
import * as mkpdf from './mkpdf';

function getBundleByType(bundles: parcelTypes.PackagedBundle[], type: string): parcelTypes.PackagedBundle | undefined {
  return bundles.find(elem => elem.type == type);
}

function getBundleFilePathByType(bundles: parcelTypes.PackagedBundle[], type: string): string | undefined {
  return getBundleByType(bundles, type)?.filePath;
}

const puppeteerBrowserPromise = (async () => {
  const ret = await mkpdf.launchPuppeteerBrowser();
  return ret;
})();

module.exports = new Reporter({
  async report({ event }: { event: parcelTypes.ReporterEvent }) {
    if (event.type === 'buildSuccess') {
      const bundles: parcelTypes.PackagedBundle[] = event.bundleGraph.getBundles();
      const htmlInput = getBundleFilePathByType(bundles, "html");
      const cssInputOpt = getBundleFilePathByType(bundles, "css");

      process.stdout.write(`Built ${bundles.length} bundles:\n* HTML: ${htmlInput}\n* CSS?: ${cssInputOpt}\n`);

      if (htmlInput) {
        await mkpdf.saveAsPdf(puppeteerBrowserPromise, htmlInput, cssInputOpt);
      }
      else {
        process.stderr.write("❌ No built html");
      }
    }

    else if (event.type === 'watchEnd') {
      process.stdout.write(`Parcel watching ended. Liberating resources... `);
      mkpdf.closePuppeteerBrowser(puppeteerBrowserPromise);
      process.stdout.write(`DONE`);
    }
  }
});