import { ZipArchive } from "archiver";

// Browsers send folder files with a relative path ("photos/a.jpg") as the
// filename. Clean it so the zip cannot hold absolute or ".." entries.
export function safeEntryPath(name) {
  const parts = String(name)
    .replace(/\\/g, "/")
    .split("/")
    // eslint-disable-next-line no-control-regex
    .map((p) => p.replace(/[\u0000-\u001f]/g, "").trim())
    .filter((p) => p && p !== "." && p !== "..");
  return parts.join("/") || "file";
}

// Two files can share a path (two "a.jpg" picked from different folders).
// Later ones become "a (2).jpg" so nothing is overwritten in the archive.
export function uniqueEntryPaths(names) {
  const seen = new Map();
  return names.map((name) => {
    const path = safeEntryPath(name);
    const n = (seen.get(path) || 0) + 1;
    seen.set(path, n);
    if (n === 1) return path;
    const dot = path.lastIndexOf(".");
    const slash = path.lastIndexOf("/");
    return dot > slash + 1
      ? `${path.slice(0, dot)} (${n})${path.slice(dot)}`
      : `${path} (${n})`;
  });
}

// A single plain file is stored as-is. Several files, or any file that came
// from a folder, are zipped together.
export function shouldZip(files) {
  return files.length > 1 || files.some((f) => /[\\/]/.test(f.originalname));
}

// Streams a zip of the multer memory files into `out` (a writable stream).
// Resolves with the zip size in bytes once the archive is finalized and flushed.
export function zipFilesTo(files, out) {
  return new Promise((resolve, reject) => {
    // level 1: uploads are usually already compressed, so favor speed.
    const archive = new ZipArchive({ zlib: { level: 1 } });
    archive.on("error", reject);
    out.on("error", reject);
    out.on("finish", () => resolve(archive.pointer()));
    archive.pipe(out);
    const paths = uniqueEntryPaths(files.map((f) => f.originalname));
    files.forEach((f, i) => archive.append(f.buffer, { name: paths[i] }));
    archive.finalize().catch(reject);
  });
}

// multer hands filenames over decoded as latin1, but browsers send UTF-8
// bytes, so "résumé.pdf" arrives mangled. Re-decode as UTF-8.
export function fixFilenames(files) {
  files.forEach((f) => {
    f.originalname = Buffer.from(f.originalname, "latin1").toString("utf8");
  });
}
