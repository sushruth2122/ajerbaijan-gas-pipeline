/**
 * Simple CSV loader for well-formed CSV files (no quoted commas).
 * Reads from /data/*.csv at the project root.
 */
const fs = require('fs');
const path = require('path');

// GCC_DATA_DIR is set by the Netlify function to point at the bundled data dir;
// falls back to the repo-root data/ when running the local dev server.
const DATA_DIR = process.env.GCC_DATA_DIR || path.join(__dirname, '..', '..', 'data');

function loadCsv(filename) {
  const filepath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
      const v = (values[i] || '').trim();
      // Auto-cast numbers and booleans
      if (v === 'true') row[h] = true;
      else if (v === 'false') row[h] = false;
      else if (v !== '' && !isNaN(Number(v))) row[h] = Number(v);
      else row[h] = v;
    });
    return row;
  });
}

module.exports = { loadCsv };
