// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0

import * as mkpdf from "./mkpdf";

// ----------------------------------------------------------------------------

// Early simple version

if (process.argv.length === 2) {
  process.stderr.write('Input arguments must be: inputHtmlFilepath [inputCssFilepath]');
  process.exit(1);
}

const inputHtmlFilepath = process.argv[2];
const inputCssFilepathOpt = process.argv[3];

mkpdf.printAsPdf(inputHtmlFilepath, inputCssFilepathOpt);