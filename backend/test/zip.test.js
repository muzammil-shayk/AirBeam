import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import express from "express";
import multer from "multer";
import { fixFilenames, shouldZip, zipFilesTo, safeEntryPath, uniqueEntryPaths } from "../utils/zip.js";

test("entry paths are safe and unique", () => {
  assert.equal(safeEntryPath("../../etc/passwd"), "etc/passwd");
  assert.equal(safeEntryPath("/abs\\win\\a.txt"), "abs/win/a.txt");
  assert.deepEqual(uniqueEntryPaths(["a.jpg", "a.jpg", "d/b", "d/b"]), ["a.jpg", "a (2).jpg", "d/b", "d/b (2)"]);
});

test("shouldZip: one plain file stays a file, folders and many files zip", () => {
  assert.equal(shouldZip([{ originalname: "a.bin" }]), false);
  assert.equal(shouldZip([{ originalname: "a.bin" }, { originalname: "b.bin" }]), true);
  assert.equal(shouldZip([{ originalname: "dir/a.bin" }]), true);
});

// Same multer options as routes/upload.js, then zip to a temp file and list it.
test("multipart folder upload round-trips into one zip", async () => {
  const upload = multer({ storage: multer.memoryStorage(), preservePath: true });
  const app = express();
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "zip-")), "o.zip");
  app.post("/", upload.array("files", 1000), async (req, res) => {
    fixFilenames(req.files);
    const zipped = shouldZip(req.files);
    if (zipped) await zipFilesTo(req.files, fs.createWriteStream(out));
    res.json({ zipped, names: req.files.map((f) => f.originalname) });
  });
  const server = app.listen(0);
  try {
    const fd = new FormData();
    fd.append("files", new Blob(["one"], { type: "" }), "photos/a.jpg");
    fd.append("files", new Blob(["two"]), "photos/sub/b.bin");
    fd.append("files", new Blob(["three"]), "../evil.txt");
    fd.append("files", new Blob(["four"]), "photos/a.jpg");
    fd.append("files", new Blob(["five"]), "résumé ✓.pdf");
    const r = await fetch(`http://127.0.0.1:${server.address().port}/`, { method: "POST", body: fd });
    const body = await r.json();
    assert.equal(body.zipped, true);
    assert.ok(body.names.includes("photos/sub/b.bin"), "path preserved");
    const list = JSON.parse(execFileSync("python3", ["-I", "-c", "import zipfile,json,sys;print(json.dumps(zipfile.ZipFile(sys.argv[1]).namelist()))", out]).toString()).sort();
    assert.deepEqual(list, ["evil.txt", "photos/a (2).jpg", "photos/a.jpg", "photos/sub/b.bin", "résumé ✓.pdf"].sort());
  } finally {
    server.close();
  }
});
