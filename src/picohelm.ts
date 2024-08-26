#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { program } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as mustache from 'mustache';
import * as dotenv from 'dotenv';
import { glob } from 'glob';

dotenv.config();

interface Values {
  [key: string]: any
}

async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

function parseYamlOrJson(content: string): any {
  try {
    return yaml.load(content);
  } catch (e) {
    return JSON.parse(content);
  }
}

async function processTemplate(
  templatePath: string,
  values: Values,
  verbose: boolean,
): Promise<void> {
  if (verbose) {
    console.log(`Processing ${path.relative(process.cwd(), templatePath)}`);
  }

  const templateContent = await readFile(templatePath);
  const renderedContent = mustache.render(templateContent, values);

  const outputPath = path.join('output', path.relative('templates', templatePath));
  const outputExtension = path.extname(outputPath);
  const finalOutputPath = outputExtension === '.json'
    ? outputPath.replace(/\.json$/, '.yml')
    : outputPath;

  await writeFile(finalOutputPath, renderedContent);
}

async function clearOutputFolder(): Promise<void> {
  const outputPath = path.resolve(process.cwd(), 'output');

  try {
    const files = await fs.readdir(outputPath);
    const nonYamlFiles = files.filter((file) => !['.yml', '.yaml'].includes(path.extname(file)));

    if (nonYamlFiles.length > 0) {
      throw new Error('Non-YAML files found in output folder. Please remove them manually for security reasons.');
    }

    await Promise.all(files.map((file) => fs.unlink(path.join(outputPath, file))));
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
}

function mergeValues(objects: Values[]): Values {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

function parseSetValues(setValues: string[]): Values {
  const result: Values = {};
  for (const setValue of setValues) {
    const [key, value] = setValue.split('=');
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i += 1) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  return result;
}

async function main() {
  // import version from package.json
  let version = '';
  try {
    version = JSON.parse(await readFile(path.resolve(__dirname, '../package.json'))).version;
  } catch (error) {
    console.error('Error: Could not read package.json file.');
    process.exit(1);
  }

  program
    .version(version, '-v, --version')
    .argument('[basePath]', 'Base path for templates and values', 'k8s')
    .option('-f, --values <paths...>', 'Path to values files')
    .option('--set <values...>', 'Set values on the command line')
    .option('--verbose', 'Enable verbose logging')
    .helpOption('-h, --help', 'Display help for command')
    .parse(process.argv);

  const options = program.opts();
  const basePath = path.resolve(process.cwd(), program.args[0] || 'k8s');
  const templatesPath = path.join(basePath, 'templates');
  const valuesFiles = options.values || [];
  const setValues = options.set || [];
  const verbose = options.verbose || false;

  try {
    // Read values files
    const valueObjects = await Promise.all(
      [path.join(basePath, 'values.yml'), path.join(basePath, 'values.yaml'), path.join(basePath, 'values.json'), ...valuesFiles]
        .filter((file) => fs
          .access(file)
          .then(() => true)
          .catch(() => false))
        .map(async (file) => parseYamlOrJson(await readFile(file))),
    );

    // Merge values
    const mergedValues = mergeValues([...valueObjects, parseSetValues(setValues)]);
    const finalValues: Values = { '': { Values: mergedValues, ENV: process.env } };

    // Read Chart.yml if exists
    try {
      const chartContent = await readFile(path.join(basePath, 'Chart.yml'));
      finalValues[''].Chart = parseYamlOrJson(chartContent);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }

    // Clear output folder
    await clearOutputFolder();

    // Process templates
    const templateFiles = await glob('**/*.{yml,yaml,json}', { cwd: templatesPath });

    if (templateFiles.length === 0) {
      throw new Error('No template files found in the templates folder.');
    }

    const processTemplates = templateFiles.map(
      (file) => processTemplate(path.join(templatesPath, file), finalValues, verbose),
    );

    await Promise.all(processTemplates);

    console.log(`Processed ${templateFiles.length} files successfully.`);
  } catch (error) {
    console.error(`Error: ${(error as any).message}`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
