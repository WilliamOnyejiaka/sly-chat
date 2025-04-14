import { marked } from 'marked';
import * as fs from 'fs/promises';
import * as path from 'path';

export default async function loadMD(file: string) {
    const mdFilePath = path.join(__dirname, '../docs/' + file);
    // Read the markdown file
    const markdownContent = await fs.readFile(mdFilePath, 'utf-8');
    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent);
    return htmlContent;
}