const fs = require('fs');
const path = require('path');

const generatedFile = path.join(__dirname, '../src/schemas/generated/index.ts');

if (fs.existsSync(generatedFile)) {
  let content = fs.readFileSync(generatedFile, 'utf8');
  content = content.replace(/z\.cuid\(\)/g, 'z.string().cuid()');
  fs.writeFileSync(generatedFile, content, 'utf8');
  console.log('✅ Fixed z.cuid() in generated schemas');
} else {
  console.log('⚠️  Generated schema file not found');
}

