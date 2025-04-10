const { spawn } = require('child_process');
const proc = spawn('npm', ['run', 'db:push'], { stdio: ['pipe', 'inherit', 'inherit'] });

// Simulate selecting the first option for all prompts
proc.stdin.write('\n');
proc.stdin.write('\n');
proc.stdin.write('\n');
proc.stdin.write('\n');
proc.stdin.write('\n');
proc.stdin.write('\n');

// Timeout to ensure all prompts are answered
setTimeout(() => proc.stdin.end(), 5000);

proc.on('close', (code) => {
  console.log(`drizzle-kit push completed with exit code ${code}`);
  
  // Create seed data after push completes
  if (code === 0) {
    require('./seed-db.js');
  }
});
