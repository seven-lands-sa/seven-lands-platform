import sharp from "sharp";
const base = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: { r: 120, g: 80, b: 60 } } }).jpeg({ quality: 92 }).toBuffer();
const withExif = await sharp(base).withMetadata({
  orientation: 6,
  exif: {
    IFD0: { Make: "PhaseDCam", Model: "TestModel", Software: "PhaseD-Suite" },
    GPS: { GPSLatitudeRef: "N", GPSLatitude: "24/1 28/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "39/1 36/1 0/1" },
  },
}).jpeg({ quality: 92 }).toBuffer();
const meta = await sharp(withExif).metadata();
console.log("bytes:", withExif.length, "orientation:", meta.orientation, "exif bytes:", meta.exif?.length ?? 0);
console.log("device/gps strings present:", withExif.includes(Buffer.from("PhaseDCam")), withExif.includes(Buffer.from("GPS")));
const stripped = await sharp(withExif).rotate().jpeg({ quality: 92 }).toBuffer();
const strippedMeta = await sharp(stripped).metadata();
console.log("after rotate+reencode → orientation:", strippedMeta.orientation, "exif:", strippedMeta.exif?.length ?? 0, "dims:", strippedMeta.width + "x" + strippedMeta.height);
console.log("strings still present:", stripped.includes(Buffer.from("PhaseDCam")), stripped.includes(Buffer.from("GPS")));
