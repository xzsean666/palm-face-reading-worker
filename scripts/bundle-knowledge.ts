import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_DIR = path.resolve(process.cwd(), "knowledge");
const OUTPUT_FILE = path.resolve(process.cwd(), "src/worker/ai/knowledge-bundle.json");

interface KnowledgeBundle {
  [category: string]: {
    [filename: string]: string;
  };
}

function getMarkdownFiles(dir: string, baseDir: string = dir): { relativePath: string; content: string }[] {
  const results: { relativePath: string; content: string }[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const content = fs.readFileSync(fullPath, "utf-8");
      results.push({ relativePath, content });
    }
  }
  return results;
}

function bundleKnowledge() {
  console.log(`[Bundle] Reading knowledge from: ${KNOWLEDGE_DIR}`);
  const bundle: KnowledgeBundle = {};

  const categories = fs.readdirSync(KNOWLEDGE_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  let totalFiles = 0;
  for (const cat of categories) {
    const catDir = path.join(KNOWLEDGE_DIR, cat);
    const files = getMarkdownFiles(catDir);
    bundle[cat] = {};
    for (const f of files) {
      bundle[cat][f.relativePath] = f.content;
      totalFiles++;
    }
    console.log(`  - [${cat}]: ${files.length} markdown files bundled.`);
  }

  const jsonContent = JSON.stringify(bundle, null, 2);
  const sizeKb = (Buffer.byteLength(jsonContent, "utf-8") / 1024).toFixed(2);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, jsonContent, "utf-8");

  console.log(`[Bundle] Successfully generated: ${OUTPUT_FILE}`);
  console.log(`[Bundle] Total categories: ${categories.length}, total files: ${totalFiles}, size: ${sizeKb} KB`);
}

bundleKnowledge();
