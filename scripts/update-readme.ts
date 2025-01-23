import fs from "node:fs";
import path from "node:path";

const excludedDirs = ["scripts", ".github", "node_modules", ".git"];

function getDirectoryStructure(dir: string): { [key: string]: string[] } {
  const structure: { [key: string]: string[] } = {};

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory() && !excludedDirs.includes(item.name)) {
      const files = fs
        .readdirSync(path.join(dir, item.name))
        .filter((file) => !file.startsWith("."));
      structure[item.name] = files;
    }
  }

  return structure;
}

function generateMarkdown(structure: { [key: string]: string[] }): string {
  let markdown = "";

  for (const [directory, files] of Object.entries(structure)) {
    markdown += `\n## ${directory}\n\n`;

    files.forEach((file, index) => {
      const link = `${directory}/${file}`;
      markdown += `${index + 1}. [${file}](${link})\n`;
    });

    markdown += "\n";
  }

  return markdown;
}

function updateReadme() {
  const readmePath = path.join(process.cwd(), "README.md");
  let content = fs.readFileSync(readmePath, "utf-8");

  const structure = getDirectoryStructure(process.cwd());
  const directoryContent = generateMarkdown(structure);

  content = content.replace(
    /<!-- DIR_REPLACE_START -->[\s\S]*<!-- DIR_REPLACE_END -->/,
    `<!-- DIR_REPLACE_START -->${directoryContent}<!-- DIR_REPLACE_END -->`
  );
  fs.writeFileSync(readmePath, content, "utf-8");
}

updateReadme();
