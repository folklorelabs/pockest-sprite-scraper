import React from 'react';
import cx from 'classnames';
import { debounce } from 'throttle-debounce';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import fetchAllMonsters from './api/fetchAllMonsters';
import Monster from './types/Monster';
import Hash from './types/Hash';
import CharSprite from './types/CharSprite';
import fetchCharSprites from './api/fetchCharSprites';
import './App.css';

function App() {
  // const [isSelect, setIsSelect] = React.useState(true);
  const [allMonsters, setAllMonsters] = React.useState<Monster[]>([]);
  const [allHashes, setAllHashes] = React.useState<Hash[]>([]);
  const [hash, setHash] = React.useState<string>();
  const [charSprites, setCharSprites] = React.useState<CharSprite[]>([]);

  // const monster = React.useMemo(() => allMonsters?.find((m) => hash.includes(`${m.monster_id}`)), [allMonsters, hash]);

  React.useEffect(() => {
    (async () => {
      const url = 'https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network error ${res.status} (${url})`);
      const hashes: { id: string, type: string }[] = await res.json();
      const filteredHashes = hashes?.filter((h) => h.id && h.type === 'char');
      setAllHashes(filteredHashes);
      setHash(filteredHashes?.[0]?.id);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      const url = 'https://folklorelabs.io/pockest-helper-data/v2/hashes.min.json';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network error ${res.status} (${url})`);
      const hashes: { id: string, type: string }[] = await res.json();
      const filteredHashes = hashes?.filter((h) => h.id && h.type === 'char');
      setAllHashes(filteredHashes);
      setHash(filteredHashes?.[0]?.id);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      const newAllMonsters = await fetchAllMonsters();
      setAllMonsters(newAllMonsters);
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
      {/* <div>
        <label className="IsSelectCheck">
          <input
            type="checkbox"
            onChange={debounce(500, (e: React.ChangeEvent<HTMLInputElement>) => {
              setIsSelect(!e.target.checked)
            })}
            defaultChecked={!isSelect}
          />
          Hash Editor
        </label>
      </div> */}
      {/* {isSelect ? ( */}
        <select
          className={cx(
            'HashSelect',
            // {
            //   'HashSelect--hidden': !isSelect
            // },
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
      {/* ) : (
        <input
          className={cx(
            'HashInput',
            {
              'HashInput--hidden': isSelect
            },
          )}
          onChange={debounce(500, (e: React.ChangeEvent<HTMLInputElement>) => {
            setCharSprites([]);
            setHash(e?.target?.value);
          })}
          defaultValue={hash}
        />
      )} */}
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
