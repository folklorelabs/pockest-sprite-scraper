type FrameMeta = { rotated: boolean; frame: { x: number; y: number; w: number; h: number } };

function getFrameImgSrc(hash:string, frameMeta: FrameMeta): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = frameMeta.frame.w;
    canvas.height = frameMeta.frame.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.addEventListener('load', () => {
      if (!ctx) return;
      if (frameMeta.rotated) {
        ctx.rotate(-90 * (Math.PI / 180));
      }
      const size = Math.max(frameMeta.frame.w, frameMeta.frame.h);
      const srcImgMeta = {
        x: frameMeta.frame.x,
        y: frameMeta.frame.y,
        w: size,
        h: size,
      };
      const destMeta = {
        x: frameMeta.rotated ? -srcImgMeta.h : 0,
        y: 0,
        w: size,
        h: size,
      };
      ctx.drawImage(
        img,
        srcImgMeta.x,
        srcImgMeta.y,
        srcImgMeta.w,
        srcImgMeta.h,
        destMeta.x,
        destMeta.y,
        destMeta.w,
        destMeta.h,
      );
      const output = canvas.toDataURL();
      resolve(output);
    });
    img.src = `https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${hash}.png`;
  });
}

async function getCharSprites(hash:string) {
    if (!hash) {
      throw new Error(`Invalid hash ${hash}`);
    }
    const url = `https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${hash}.json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Network error ${res.status} (${url})`);
    }
    const { frames } = await res.json();
    const frameKeys = Object.keys(frames);
    const frameReses = frameKeys.map(async (key) => getFrameImgSrc(hash, frames[key]));
    const imgSrcs = await Promise.all(frameReses);
    return imgSrcs.map((data, i) => ({
      fileName: frameKeys[i],
      data
    }));
}

export default getCharSprites;
