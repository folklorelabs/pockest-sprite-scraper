import Hash from '../types/Hash';
import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';


const cache = new LocalStorageCache('PockestHelperSheetHashes');

export default async function fetchAllHashes():Promise<Hash[]> {
  try {
    const url = 'https://folklorelabs.io/pockest-helper-data/hashes.min.json';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
    const hashes = await response.json();
    if (!Array.isArray(hashes)) throw new Error(`Unexpected API response type ${typeof hashes} (${url})`);
    cache.set(hashes);
    return hashes;
  } catch (err) {
    const cachedData = cache.get();
    if (!cachedData) throw new Error(`${err}`);
    logError(err);
    return cachedData;
  }
}
