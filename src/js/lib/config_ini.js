import { CompressedTextSplitter } from "./compressed_text_splitter.js"

export async function loadConfigIni(storageRepo) {
  const cts = new CompressedTextSplitter(storageRepo.kind);
  const dataSet = await storageRepo.get(cts.getKeys());
  return cts.textFromDataSet(dataSet);
}

export async function saveConfigIni(storageRepo, text) {
  const cts = new CompressedTextSplitter(storageRepo.kind);
  const dataSet = cts.textToDataSet(text);
  await storageRepo.set(dataSet);
}

export async function deleteConfigIni(storageRepo) {
  const cts = new CompressedTextSplitter(storageRepo.kind);
  storageRepo.delete(cts.getKeys());
}
