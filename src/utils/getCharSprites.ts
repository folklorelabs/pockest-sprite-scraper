type FrameMeta = { rotated: boolean; frame: { x: number; y: number; w: number; h: number } };

function getFrameImgSrc(hash:string, frameMeta: FrameMeta): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const { rotated } = frameMeta;
    canvas.width = rotated ? frameMeta.frame.h : frameMeta.frame.w;
    canvas.height = rotated ? frameMeta.frame.w :frameMeta.frame.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.addEventListener('load', () => {
      if (!ctx) return;
      const srcImgMeta = {
        x: frameMeta.frame.x,
        y: frameMeta.frame.y,
        w: rotated ? frameMeta.frame.h : frameMeta.frame.w,
        h: rotated ? frameMeta.frame.w :frameMeta.frame.h,
      };
      const destMeta = {
        x: 0,
        y: 0,
        w: rotated ? frameMeta.frame.h : frameMeta.frame.w,
        h: rotated ? frameMeta.frame.w :frameMeta.frame.h,
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

function rotateBase64Image(base64data:string, rotateDeg: number): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = base64data;
    image.onload = function() {
      if (!ctx) return;
      const w = image.width;
      const h = image.height;
      canvas.width = h;
      canvas.height = w;
      ctx.rotate(rotateDeg * (Math.PI / 180));
      ctx.drawImage(image, 0, 0, w, h, -w, 0, w, h); 
      const output = canvas.toDataURL();
      resolve(output);
    };
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
    const frameReses = frameKeys.map(async (key) => {
      const frameMeta = frames[key];
      let sprite = await getFrameImgSrc(hash, frameMeta);
      if (frameMeta.rotated) {
        sprite = await rotateBase64Image(sprite, -90)
      }
      return sprite;
    });
    const imgSrcs = await Promise.all(frameReses);
    return imgSrcs.map((data, i) => ({
      fileName: frameKeys[i],
      data
    }));
}

export default getCharSprites;
