const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const npmMetaUrl = 'https://registry.npmjs.org/npm/latest';
const targetDir = path.join(__dirname, 'npm-package');

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function parseOctal(buffer) {
  const raw = buffer.toString('utf8').replace(/\0.*$/s, '').trim();
  return raw.length === 0 ? 0 : parseInt(raw, 8);
}

function extractTar(buffer) {
  let pos = 0;
  while (pos + 512 <= buffer.length) {
    const header = buffer.slice(pos, pos + 512);
    if (header.every((byte) => byte === 0)) break;

    const name = header.toString('utf8', 0, 100).replace(/\0.*$/s, '');
    const size = parseOctal(header.slice(124, 136));
    const type = header.toString('utf8', 156, 157);

    const contentStart = pos + 512;
    const contentEnd = contentStart + size;
    let relPath = name;
    if (relPath.startsWith('package/')) relPath = relPath.slice(8);
    relPath = relPath.replace(/\\/g, '/');

    if (relPath && relPath !== '.') {
      const outPath = path.join(targetDir, relPath);
      if (type === '5' || relPath.endsWith('/')) {
        mkdirp(outPath);
      } else {
        const fileContent = buffer.slice(contentStart, contentEnd);
        writeFile(outPath, fileContent);
        if (type === '2') {
          // symlink, ignore for now
        }
      }
    }

    const paddedSize = Math.ceil(size / 512) * 512;
    pos = contentStart + paddedSize;
  }
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Téléchargement des métadonnées npm...');
    const metadata = await new Promise((resolve, reject) => {
      https.get(npmMetaUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))));
        res.on('error', reject);
      }).on('error', reject);
    });

    const tarballUrl = metadata.dist?.tarball;
    if (!tarballUrl) throw new Error('Impossible de trouver l’URL du tarball npm.');

    console.log('Téléchargement du tarball npm...');
    const compressed = await download(tarballUrl);

    console.log('Décompression du tarball...');
    const decompressed = zlib.gunzipSync(compressed);

    if (fs.existsSync(targetDir)) {
      console.log('Nettoyage du répertoire existant...');
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    console.log('Extraction du tarball...');
    extractTar(decompressed);

    console.log('npm installé dans:', targetDir);
    console.log('Tu peux maintenant exécuter npm depuis:', path.join(targetDir, 'bin', 'npm-cli.js'));
  } catch (err) {
    console.error('Échec:', err.message || err);
    process.exit(1);
  }
})();
