import { LZString } from "./lz-string.min.js";

export class CompressedTextSplitter {
  constructor(area) {
    if (area === 'sync') {
      this.itemLen = 2700;
      this.maxItemCount = 5;
    } else {
      this.itemLen = 10485760;
      this.maxItemCount = 1;
    }
  }

  getKeys() {
    const keys = ['lztext'];
    for (let i = 1; i < this.maxItemCount; i++) {
      keys.push(`lztext_${i}`);
    }
    return keys;
  }

  textFromDataSet(dataSet) {
    if (!dataSet.lztext) return '';

    let ctxt = dataSet.lztext;
    for (let i = 1; i < this.maxItemCount; i++) {
      const val = dataSet[`lztext_${i}`];
      if (val) {
        ctxt += val;
      } else {
        break;
      }
    }

    return LZString.decompressFromUTF16(ctxt);
  }

  textToDataSet(text) {
    const ctxt = LZString.compressToUTF16(text);
    if (ctxt.length > this.itemLen * this.maxItemCount) {
      throw new Error('Configuration is too large to save.');
    }

    const dataSet = { lztext: ctxt.substring(0, this.itemLen) };
    let ctxtR = ctxt.substring(this.itemLen);
    for (let i = 1; i < this.maxItemCount; i++) {
      if (ctxtR.length > 0) {
        dataSet[`lztext_${i}`] = ctxtR.substring(0, this.itemLen);
        ctxtR = ctxtR.substring(this.itemLen);
      } else {
        dataSet[`lztext_${i}`] = '';
      }
    }

    return dataSet;  
  }
}
