#!/usr/bin/env node

import { compile } from '@mdx-js/mdx';
import { readFile } from 'fs/promises';
import { glob } from 'glob';

async function validateMDX(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    await compile(content, { filepath: filePath });
    return { success: true, file: filePath };
  } catch (error) {
    return {
      success: false,
      file: filePath,
      error: error.message,
      line: error.line,
      column: error.column
    };
  }
}

async function main() {
  const files = await glob('**/*.mdx', {
    ignore: ['node_modules/**', '.git/**'],
    absolute: true
  });

  console.log(`Validating ${files.length} MDX files...\n`);

  const results = await Promise.all(files.map(validateMDX));
  const failures = results.filter(r => !r.success);

  if (failures.length > 0) {
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`❌ MDX VALIDATION FAILED`);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.error(`Found ${failures.length} parsing error${failures.length > 1 ? 's' : ''} in ${failures.length} file${failures.length > 1 ? 's' : ''}:\n`);

    failures.forEach(({ file, error, line, column }, index) => {
      const relativePath = file.replace(process.cwd() + '/', '');
      console.error(`${index + 1}. ${relativePath}`);
      console.error(`   Location: line ${line}, column ${column}`);
      console.error(`   Error: ${error}`);
      console.error('');
    });

    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`💡 Common fixes:`);
    console.error(`   • Change <br> to <br/>`);
    console.error(`   • Change <hr> to <hr/>`);
    console.error(`   • Ensure all JSX tags like \<Frame\> or \<Tab\> are properly closed`);
    console.error(`   • Escape curly braces: {'{'}text{'}'} or surround them with backticks: \`{{text}}\``);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(1);
  } else {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ MDX VALIDATION PASSED`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`All ${files.length} MDX files are valid!`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
