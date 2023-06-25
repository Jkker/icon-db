export const svgToDataURI = (svgStr) => {
  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  const header = 'data:image/svg+xml,';
  const dataUrl = header + encoded;

  return dataUrl;
};

export const svgToCanvas = async (
  svgStr,
  { size = 256, backgroundColor = undefined }
): Promise<HTMLCanvasElement> => {
  const img = new Image();
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  img.src = blobUrl;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);
      }
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas);
    };
  });
};

export const copySVGasImage = async (svgString: string, size: number = 256) => {
  const canvas = await svgToCanvas(svgString, {
    size,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      console.log(blob);
      navigator.clipboard
        .write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        .then(resolve)
        .then(() => {
          canvas.remove();
        })
        .catch(reject);
    });
  });
};

/*
  SVG to ICO converter
  Reference: https://jsfiddle.net/vanowm/b657yksg/
*/

const pngToIco = (images) => {
  let icoHead = [
      //.ico header
      0,
      0, // Reserved. Must always be 0 (2 bytes)
      1,
      0, // Specifies image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid. (2 bytes)
      images.length & 255,
      (images.length >> 8) & 255, // Specifies number of images in the file. (2 bytes)
    ],
    icoBody = [],
    pngBody = [];

  for (let i = 0, num, pngHead, pngData, offset = 0; i < images.length; i++) {
    pngData = Array.from(images[i]);
    pngHead = [
      //image directory (16 bytes)
      0, // Width 0-255, should be 0 if 256 pixels (1 byte)
      0, // Height 0-255, should be 0 if 256 pixels (1 byte)
      0, // Color count, should be 0 if more than 256 colors (1 byte)
      0, // Reserved, should be 0 (1 byte)
      1,
      0, // Color planes when in .ICO format, should be 0 or 1, or the X hotspot when in .CUR format (2 bytes)
      32,
      0, // Bits per pixel when in .ICO format, or the Y hotspot when in .CUR format (2 bytes)
    ];
    num = pngData.length;
    for (let i = 0; i < 4; i++)
      pngHead[pngHead.length] = (num >> (8 * i)) & 255; // Size of the bitmap data in bytes (4 bytes)

    num = icoHead.length + (pngHead.length + 4) * images.length + offset;
    for (let i = 0; i < 4; i++)
      pngHead[pngHead.length] = (num >> (8 * i)) & 255; // Offset in the file (4 bytes)

    offset += pngData.length;
    icoBody = icoBody.concat(pngHead); // combine image directory
    pngBody = pngBody.concat(pngData); // combine actual image data
  }
  return icoHead.concat(icoBody, pngBody);
};

export const svgToIco = async (
  svgString: string,
  sizes = [512, 256, 128, 64, 48, 32, 24, 16]
) => {
  const images = await Promise.all(
    sizes.map((size) =>
      svgToCanvas(svgString, {
        size,
      }).then(
        (canvas) =>
          new Promise((resolve, reject) =>
            // Convert canvas to Blob, then Blob to ArrayBuffer.
            canvas.toBlob(function (blob) {
              const reader = new FileReader();
              reader.addEventListener('loadend', () =>
                resolve(new Uint8Array(reader.result as ArrayBuffer))
              );
              reader.readAsArrayBuffer(blob);
            }, 'image/png')
          )
      )
    )
  );

  const icoData = pngToIco(images); // array of bytes
  const blob = new Blob([new Uint8Array(icoData)], { type: 'image/x-icon' });
  const objectUrl = URL.createObjectURL(blob);

  return objectUrl;
};

export const svgToReactComponent = (
  svgStr: string,
  name: string,
  { typescript = false, importRuntime = false } = {}
) =>
  fetch('/api/svgr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      svg: svgStr,
      name,
      options: {
        typescript,
        jsxRuntime: importRuntime ? 'classic' : 'automatic',
      },
    }),
  }).then((res) => res.text());
