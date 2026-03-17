# OpenBook Scripts

This directory contains utility scripts for the OpenBook project.

---

## `evidence-hash.js` — Evidence Hash & OpenTimestamps Integration

A client-side JavaScript utility that enables privacy-preserving evidence verification for OpenBook Signals.

### What it does

1. **Hashes your evidence file locally** using the browser's built-in Web Crypto API (SHA-256). The file never leaves your device.
2. **Anchors the hash to the Bitcoin blockchain** via [OpenTimestamps](https://opentimestamps.org/) calendar servers (free, no API key required).
3. **Returns a `.ots` proof** (base64-encoded) that you can store in your Signal's `evidence.timestamp_proof` field.

### How to use it

#### Option A: Use the demo page

Open `evidence-hash-demo.html` in any modern browser. No server or build step required.

1. Drop your evidence file (screenshot, PDF, chat export, etc.) onto the drop zone.
2. The SHA-256 hash is computed instantly in your browser.
3. Click **"Anchor to Bitcoin Blockchain"** to submit the hash to OpenTimestamps.
4. Copy the generated YAML snippet and paste it into your Signal file.

#### Option B: Import as an ES module

```js
import { hashAndStamp, verifyFileHash } from './evidence-hash.js';

// Hash a file and anchor it to Bitcoin
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  const result = await hashAndStamp(file);

  console.log(result.hash);        // "sha256:a3f2b8c1..."
  console.log(result.otsBase64);   // base64-encoded .ots proof
  console.log(result.pendingUrls); // ["https://alice.btc.calendar...", ...]
});

// Verify a file against a stored hash (no network needed)
const isMatch = await verifyFileHash(file, 'sha256:a3f2b8c1...');
console.log(isMatch); // true or false
```

### Signal YAML example

After running the tool, add the following to your Signal's YAML frontmatter:

```yaml
evidence:
  hash: "sha256:a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
  algorithm: "sha256"
  timestamp_proof: "ots:AE9wZW5UaW1lc3RhbXBzAABQcm9vZgC/ieLohe..."
  pending_calendars:
    - "https://alice.btc.calendar.opentimestamps.org"
    - "https://bob.btc.calendar.opentimestamps.org"
  note: "WeChat screenshot showing landlord refusing to return deposit"
```

### How verification works

Anyone who receives the original evidence file can verify it in seconds:

1. Open `evidence-hash-demo.html`
2. Paste the stored hash (`sha256:...`) into the "Verify" section
3. Select the original file
4. The tool computes the hash locally and checks if it matches

If the hashes match, it proves the file existed at the time the Signal was submitted (as attested by the Bitcoin blockchain timestamp).

### Privacy model

| What is stored publicly | What stays private |
|---|---|
| SHA-256 hash of the file | The file itself |
| OpenTimestamps `.ots` proof | File contents |
| Calendar server URLs | Personal information in the file |

The hash alone reveals nothing about the file's contents. Only the person holding the original file can prove the match.

---

## `evidence-hash-demo.html` — Browser Demo

A standalone HTML page that demonstrates the Evidence Hash workflow with a clean UI. No build step or server required — just open in a browser.
