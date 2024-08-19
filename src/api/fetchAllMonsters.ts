import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';

const BUCKLER_ENCYCLO_URL = 'https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list';
const SHEET_MONSTERS_URL = 'https://folklorelabs.io/pockest-helper-data/v2/monsters.min.json';

const bucklerCache = new LocalStorageCache('PockestHelperBucklerEncyclopedia');
const sheetCache = new LocalStorageCache('PockestHelperSheetMonsters');

import type Monster from '../types/Monster';
import type SheetMonster from '../types/SheetMonster';
import type EncycloMonster from '../types/EncycloMonster';
import type EncycloBook from '../types/EncycloBook';

export default async function fetchAllMonsters():Promise<Monster[]> {
  const [
    bucklerRes,
    sheetRes,
  ] = await Promise.all([
    fetch(BUCKLER_ENCYCLO_URL),
    fetch(SHEET_MONSTERS_URL),
  ]);

  // handle sheet data response
  const sheetMonsters:SheetMonster[] = sheetRes.ok ? await sheetRes.json() : sheetCache.get();
  if (!sheetRes.ok) {
    const err = new Error(`API ${sheetRes.status} response (${SHEET_MONSTERS_URL})`);
    if (!sheetMonsters) throw err;
    logError(err);
  }
  sheetCache.set(sheetMonsters);

  // handle buckler data response
  let bucklerData:{ data: { books: EncycloBook[] }; message: string; } = bucklerRes.ok ? await bucklerRes.json() : bucklerCache.get();
  if (!bucklerRes.ok) {
    const err = new Error(`API ${bucklerRes.status} response (${BUCKLER_ENCYCLO_URL})`);
    if (!bucklerData) throw err;
    logError(err);
  }
  if (!bucklerData?.data) {
    const err = new Error(`Buckler Response: ${bucklerData?.message}`);
    bucklerData = bucklerCache.get();
    if (!bucklerData) throw err;
    logError(err);
  }
  bucklerCache.set(bucklerData);

  // merge all buckler encyclopedia into a flat monsters object
  const bucklerMonsters:Record<number, EncycloMonster[]> = bucklerData?.data?.books.reduce((allMonsters, book) => {
    const newAllMonsters:Record<number, EncycloMonster[]> = {
      ...allMonsters,
    };
    const { id: eggId, monster } = book;
    const monsterProps = Object.keys(monster);
    const genePropKeys = monsterProps.filter((k) => k.includes('gene'));
    genePropKeys.forEach((gk) => {
      const geneMonsters = monster[gk];
      geneMonsters.forEach((gm) => {
        newAllMonsters[gm?.monster_id] = [
          ...(newAllMonsters[gm?.monster_id] || []),
          {
            ...gm,
            eggId,
            name_en: gm?.name_en !== '???' ? gm?.name_en : '',
            name: gm?.name !== '???' ? gm?.name : '',
          },
        ];
      });
    });
    return newAllMonsters;
  }, {});
  if (!bucklerMonsters) return sheetMonsters as Monster[];

  // inject buckler encyclopedia monster data into each sheet monster
  const allMonsters = Object.keys(bucklerMonsters).map((monsterIdStr) => {
    const monsterId = parseInt(monsterIdStr || '-1', 10);
    const matchingBucklerMonsters = bucklerMonsters[monsterId];
    const bucklerMonster = {
      ...matchingBucklerMonsters[0],
      // TODO: combine/add any diffs found
    };
    const swMonster = sheetMonsters?.find((m) => m.monster_id === monsterId);
    return {
      ...bucklerMonster,
      ...swMonster,
    } as Monster;
  });

  return allMonsters;
}
