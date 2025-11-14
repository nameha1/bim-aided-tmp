const fs = require('fs');
const path = require('path');

const imagePaths = [
  "/images/advanced-bim/Architectural BIM Services.png",
  "/images/advanced-bim/Structural BIM Services.png",
  "/images/advanced-bim/BIM MEP.jpeg",
  "/images/advanced-bim/Infrastructure BIM Services.jpeg",
  "/images/advanced-bim/Landscape BIM Services.jpeg",
  "/images/advanced-bim/Interior Design BIM Services.jpeg",
  "/images/advanced-bim/Facade BIM Services.png",
  "/images/advanced-bim/Scan to BIM Services.jpeg",
  "/images/advanced-bim/CAD to BIM Services.jpeg",
  "/images/advanced-bim/BIM Outsourcing Service.jpeg",
  "/images/advanced-bim/BIM Consulting Service.png"
];

console.log('🔍 Verifying Advanced BIM Images...\n');

const publicDir = path.join(__dirname, '..', 'public');

let allExist = true;

imagePaths.forEach((imgPath) => {
  const fullPath = path.join(publicDir, imgPath.replace('/images/', ''));
  const exists = fs.existsSync(fullPath);
  
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${imgPath}`);
  
  if (!exists) {
    allExist = false;
    console.log(`   File not found at: ${fullPath}`);
  }
});

console.log('\n' + (allExist ? '✅ All images exist!' : '❌ Some images are missing!'));

// List actual files in directory
console.log('\n📁 Actual files in advanced-bim folder:');
const advancedBimDir = path.join(publicDir, 'images', 'advanced-bim');
if (fs.existsSync(advancedBimDir)) {
  const files = fs.readdirSync(advancedBimDir);
  files.forEach(file => {
    console.log(`   - ${file}`);
  });
} else {
  console.log('   Directory not found!');
}

process.exit(allExist ? 0 : 1);
