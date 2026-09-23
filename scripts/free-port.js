// Helper: kill any process listening on port 3000
const { execSync } = require('child_process');
try {
  const output = execSync('netstat -aon', { encoding: 'utf8' });
  const lines = output
    .split('\n')
    .filter((l) => l.includes(':3000') && l.includes('LISTEN'));

  lines.forEach((line) => {
    const pid = line.trim().split(/\s+/).pop();
    if (pid && !isNaN(Number(pid)) && Number(pid) > 0) {
      console.log('  [CLEAN] Killing stale process on port 3000 (PID: ' + pid + ')');
      try {
        execSync('taskkill /F /PID ' + pid, { stdio: 'ignore' });
      } catch {
        // Process may have already exited
      }
    }
  });

  if (!lines.length) {
    console.log('  [OK] Port 3000 is free');
  }
} catch (err) {
  console.log('  [WARN] Could not check port 3000:', err.message);
}
