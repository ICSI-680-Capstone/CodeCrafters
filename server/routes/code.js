import express from 'express';
const router = express.Router();
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

router.post('/run', async (req, res) => {
  const { source_code, expected_output } = req.body;
  if (!source_code) return res.status(400).json({ error: 'source_code required' });

  const tmpFile = path.join(os.tmpdir(), `${uuidv4()}.py`);
  fs.writeFileSync(tmpFile, source_code);

  exec(`python3 ${tmpFile}`, { timeout: 5000 }, (err, stdout, stderr) => {
    fs.unlink(tmpFile, () => {});

    if (err && !stdout) {
      return res.json({
        stdout: '',
        stderr: stderr || err.message,
        status: 'Error',
        passed: false,
      });
    }

    let passed = null;
    if (expected_output !== undefined && expected_output !== null) {
      passed = (stdout || '').trim() === expected_output.trim();
    }

    res.json({
      stdout: stdout || '',
      stderr: stderr || '',
      status: 'Accepted',
      passed,
    });
  });
});

export default router;