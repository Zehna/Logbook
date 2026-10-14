import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

export async function GET() {
  try {
    const extensionDir = path.join(process.cwd(), "extension");

    if (!fs.existsSync(extensionDir)) {
      return NextResponse.json(
        { error: "Folder extension tidak ditemukan di server." },
        { status: 404 }
      );
    }

    const zip = new JSZip();

    function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) {
            addDirectoryToZip(fullPath, subFolder);
          }
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

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="logmagang-autofill-extension.zip"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Gagal men-generate zip extension:", error);
    return NextResponse.json(
      { error: "Gagal membuat file zip ekstensi." },
      { status: 500 }
    );
  }
}
