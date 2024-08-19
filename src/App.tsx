import React from 'react';
import cx from 'classnames';
import { debounce } from 'throttle-debounce';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import fetchAllHashes from './api/fetchAllHashes';
import fetchAllMonsters from './api/fetchAllMonsters';
import fetchCharSprites from './api/fetchCharSprites';
import Monster from './types/Monster';
import Hash from './types/Hash';
import CharSprite from './types/CharSprite';
import './App.css';

function App() {
  const [allMonsters, setAllMonsters] = React.useState<Monster[]>([]);
  const [allHashes, setAllHashes] = React.useState<Hash[]>([]);
  const [hash, setHash] = React.useState<string>();
  const [charSprites, setCharSprites] = React.useState<CharSprite[]>([]);

  React.useEffect(() => {
    (async () => {
      const [
        monsters,
        hashes,
      ] = await Promise.all([
        await fetchAllMonsters(),
        await fetchAllHashes(),
      ]);
      const filteredHashes = hashes?.filter((h) => h.id && h.type === 'char');
      setAllMonsters(monsters);
      setAllHashes(filteredHashes);
      setHash(filteredHashes?.[0]?.id);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!hash) return;
      const newcharSprites = await fetchCharSprites(hash);
      setCharSprites(newcharSprites);
    })();
  }, [hash]);

  if (!allHashes?.length || !allMonsters?.length || !charSprites?.length) return 'Loading...';

  return (
    <div className="App">
        <select
          className={cx(
            'HashSelect',
          )}
          onChange={debounce(500, (e: React.ChangeEvent<HTMLSelectElement>) => {
            setCharSprites([]);
            setHash(e?.target?.value);
          })}
          defaultValue={hash}
        >
          {allHashes?.map((h) => {
            const m = allMonsters?.find((m2) => new RegExp(`^${m2.monster_id}-`).test(h.id));
            return (
              <option key={h.id} value={h.id}>
                {m?.name_en || h.id}
              </option>
            );
          })}
        </select>

      <div className="SpriteList">
        {charSprites?.map((sprite) => (
          <a
            className="Sprite"
            href={sprite.data}
            download={sprite.fileName}
          >
            <img
              className="Sprite-img"
              key={sprite.data}
              src={sprite.data}
            />
          </a>
        ))}
      </div>
      <button
        className="DownloadAll"
        type="button"
        onClick={() => {
          const zip = new JSZip();
          charSprites?.forEach((sprite) => {
            zip.file(sprite.fileName, sprite?.data?.split('base64,')?.[1], { base64: true });
          });
          zip.generateAsync({ type: 'blob' }).then(function (content) {
            saveAs(content, `${hash}.zip`);
          });
        }}
      >
        Download All
      </button>
    </div>
  )
}

export default App
