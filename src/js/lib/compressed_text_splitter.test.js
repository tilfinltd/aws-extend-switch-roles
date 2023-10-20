import { expect } from 'chai'
import { CompressedTextSplitter } from './compressed_text_splitter.js'

function generateRandomUTF8String(len) {
  let r = '';
  for (let i = 0; i < len; i++) {
    // 0x0000 から 0xFFFF までの範囲でランダムな数を生成
    const cc = Math.floor(Math.random() * 0xFFFF);
    r += String.fromCharCode(cc);
  }
  return r;
}

describe('CompressedTextSplitter', () => {
  describe('when configStorageArea is local', () => {
    const cts = new CompressedTextSplitter('local');

    it('converts bi-directionally', () => {
      const text = generateRandomUTF8String(10000);
      const dataSet = cts.textToDataSet(text);
      const restored = cts.textFromDataSet(dataSet);
      expect(restored).to.eq(text);
    })

    it('getKeys', () => {
      expect(cts.getKeys()).to.deep.eq(['lztext']);
    })
  })

  describe('when configStorageArea is sync', () => {
    const cts = new CompressedTextSplitter('sync');

    it('converts bi-directionally', () => {
      const text = generateRandomUTF8String(4000);
      const dataSet = cts.textToDataSet(text);
      const restored = cts.textFromDataSet(dataSet);
      expect(restored).to.eq(text);
    })

    it('getKeys', () => {
      expect(cts.getKeys()).to.deep.eq(['lztext', 'lztext_1', 'lztext_2', 'lztext_3', 'lztext_4', 'lztext_5', 'lztext_6', 'lztext_7']);
    })
  })
})
