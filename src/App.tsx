import React from 'react';
import { debounce } from 'throttle-debounce';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import getCharSprites from './utils/getCharSprites';
import './App.css';

function App() {
  const [allMonsters, setAllMonsters] = React.useState<{ name_en: string, monster_id: string }[]>([]);
  const [allHashes, setAllHashes] = React.useState<{ id: string, type: string }[]>([]);
  const [hash, setHash] = React.useState<string>();
  const [charSprites, setCharSprites] = React.useState<{ fileName: string; data: string; }[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!hash) return;
      const newcharSprites = await getCharSprites(hash);
      setCharSprites(newcharSprites);
    })();
  }, [hash]);

  React.useEffect(() => {
    (async () => {
      const url = 'https://folklorelabs.io/pockest-helper-data/v2/hashes.min.json';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network error ${res.status} (${url})`);
      const hashes: { id: string, type: string }[] = await res.json();
      const filteredHashes = hashes?.filter((h) => h.id && h.type === 'char');
      setAllHashes(filteredHashes);
      // setHash(filteredHashes?.[0]?.id);
      setHash('4079-AIohJjTf');
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      const url = 'https://folklorelabs.io/pockest-helper-data/v2/monsters.min.json';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network error ${res.status} (${url})`);
      const monsters: { name_en: string, monster_id: string }[] = await res.json();
      setAllMonsters(monsters);
    })();
  }, []);

  if (!allHashes?.length || !allMonsters?.length || !charSprites?.length) return 'Loading...';

  return (
    <div className="App">
      <select
        className="HashSelect"
        onChange={debounce(500, (e: React.ChangeEvent<HTMLSelectElement>) => {
          setCharSprites([]);
          setHash(e?.target?.value);
        })}
        defaultValue={hash}
      >
        {allHashes?.map((h) => (
          <option key={h.id} value={h.id}>
            {allMonsters.find((m) => h.id.includes(m?.monster_id))?.name_en || h.id}
          </option>
        ))}
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
