// Helper: check if Ollama is running and report status
const http = require('http');
const req = http.get('http://127.0.0.1:11434/api/tags', { timeout: 3000 }, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const models = json.models || [];
      console.log('  [OK] Ollama online (' + models.length + ' models)');
      models.forEach((m) => console.log('       - ' + m.name));
      process.exit(0);
    } catch {
      console.log('  [WARN] Ollama responded but returned invalid data');
      process.exit(1);
    }
  });
});
req.on('error', () => {
  console.log('  [WARN] Ollama is not running');
  process.exit(1);
});
req.on('timeout', () => {
  req.destroy();
  console.log('  [WARN] Ollama connection timed out');
  process.exit(1);
});
