export const svgToDataURI = (svgStr) => {
  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  const header = 'data:image/svg+xml,';
  const dataUrl = header + encoded;

  return dataUrl;
};

export const svgToCanvas = (svgStr, size) => {
  // Create a canvas element to draw the image onto
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  // Create an image element and set its source to the SVG string
  const img = new Image();
  img.src = 'data:image/svg+xml,' + svgToDataURI(svgStr);

  // Draw the image onto the canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return canvas;
};

export const copySVGasPNG = (svgString: string, size: number = 256) => {
  const canvas = svgToCanvas(svgString, size);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      console.log(blob);
      navigator.clipboard
        .write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
        .then(resolve)
        .catch(reject);
    });
  });
};
export const svgToPNGBlob = (
  svgString: string,
  size: number = 256
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    svgToCanvas(svgString, size).toBlob((blob) => {
      resolve(blob as Blob);
    });
  });
};
