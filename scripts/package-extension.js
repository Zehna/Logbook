const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

async function packageExtension() {
  const extensionDir = path.join(__dirname, "..", "extension");
  const publicDir = path.join(__dirname, "..", "public");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const zip = new JSZip();

  function addDirectoryToZip(dirPath, zipFolder) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(item);
        addDirectoryToZip(fullPath, subFolder);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(item, fileData);
      }
    }
  }

  addDirectoryToZip(extensionDir, zip);

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const outputPath = path.join(publicDir, "logmagang-extension.zip");
  fs.writeFileSync(outputPath, zipBuffer);
  console.log(`Extension successfully packaged to: ${outputPath} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
}

packageExtension().catch(console.error);
