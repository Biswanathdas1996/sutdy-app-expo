// Fix all routes to use async/await with database calls
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');

// Files to fix
const files = [
  'user.js',
  'plans.js',
  'coupons.js',
  'payments.js',
  'membership.js'
];

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix: router.METHOD(..., (req, res) => { -> router.METHOD(..., async (req, res) => {
  content = content.replace(
    /router\.(get|post|put|delete)\(([^,]+),\s*\(req,\s*res\)\s*=>/g,
    'router.$1($2, async (req, res) =>'
  );
  
  // Fix: router.METHOD(..., middleware, (req, res) => { -> router.METHOD(..., middleware, async (req, res) => {
  content = content.replace(
    /router\.(get|post|put|delete)\(([^,]+),\s*([^,]+),\s*\(req,\s*res\)\s*=>/g,
    'router.$1($2, $3, async (req, res) =>'
  );
  
  // Fix: const ... = db.method( -> const ... = await db.method(
  content = content.replace(
    /const\s+(\w+)\s*=\s*db\.(\w+)\(/g,
    'const $1 = await db.$2('
  );
  
  // Fix: let ... = db.method( -> let ... = await db.method(
  content = content.replace(
    /let\s+(\w+)\s*=\s*db\.(\w+)\(/g,
    'let $1 = await db.$2('
  );
  
  // Fix: variable = db.method( -> variable = await db.method(
  content = content.replace(
    /(\w+)\s*=\s*db\.(\w+)\(/g,
    '$1 = await db.$2('
  );
  
  // Fix verifySession middleware to be async
  content = content.replace(
    /const verifySession = \(req, res, next\) => \{/,
    'const verifySession = async (req, res, next) => {'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${file}`);
});

console.log('\n✅ All route files have been updated to use async/await!');
