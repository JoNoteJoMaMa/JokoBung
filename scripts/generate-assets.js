import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the source directory (public)
const ASSETS_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(__dirname, '../src/generated-assets.json');

const IGNORE_FILES = [
  '.DS_Store',
  'asset-manifest.json',
  'vite.svg',
  'templates',
  'sound',
];

// Helper to format labels: "my_folder" -> "My Folder"
const formatLabel = (name) => {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const scanDirectory = (dirPath, relativePath) => {
  const items = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_FILES.includes(entry.name)) continue;

    const fullPath = path.join(dirPath, entry.name);
    const itemRelativePath = path.join(relativePath, entry.name);
    const id = entry.name.split('.')[0]; // simple ID from filename without extension
    const label = formatLabel(id);

    if (entry.isDirectory()) {
      const children = scanDirectory(fullPath, itemRelativePath);
      // Only include folders if they are not empty (optional, but good for cleanup)
      items.push({
        id: id,
        label: label,
        type: 'folder',
        children: children,
      });
    } else if (entry.isFile()) {
      // Check for image extensions
      if (/\.(png|jpg|jpeg|svg|gif)$/i.test(entry.name)) {
        items.push({
          id: id,
          label: label,
          type: 'image',
          value: itemRelativePath, // relative path for GH pages compatibility
        });
      }
    }
  }
  return items;
};

const generateAssets = () => {
  const result = {
    faces: [],
    clothes: [],
    etc: [],
  };

  const categories = ['faces', 'clothes', 'etc'];

  categories.forEach((cat) => {
    const catDir = path.join(ASSETS_DIR, cat);
    if (fs.existsSync(catDir)) {
      // Pass category name as relative path base
      result[cat] = scanDirectory(catDir, cat);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log('Assets generated successfully:', OUTPUT_FILE);
};

generateAssets();
