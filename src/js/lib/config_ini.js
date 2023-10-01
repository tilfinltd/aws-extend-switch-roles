import { CompressedTextSplitter } from "./compressed_text_splitter.js"

export async function loadConfigIni(storageRepo) {
  const cts = new CompressedTextSplitter(storageRepo.area);
  const dataSet = await storageRepo.get(cts.getKeys());
  return cts.textFromDataSet(dataSet);
}

export async function saveConfigIni(storageRepo, text) {
  const cts = new CompressedTextSplitter(storageRepo.area);
  const dataSet = cts.textToDataSet(text);
  await storageRepo.set(dataSet);
}
