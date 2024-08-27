/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import wontache from 'wontache';

export interface Values {
  [key: string]: any
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

export function parseYamlOrJson(content: string): any {
  try {
    const result = yaml.load(content);
    return result;
  } catch (e) {
    return JSON.parse(content);
  }
}

export async function processTemplate(
  templatePath: string,
  values: Values,
  verbose: boolean,
): Promise<void> {
  if (verbose) {
    console.log(`Processing ${path.relative(process.cwd(), templatePath)}`);
  }

  let renderedContent: string;

  try {
    const templateContent = await readFile(templatePath);
    const template = wontache(templateContent);
    renderedContent = template(values);
  } catch (error: any) {
    console.error(`Error in template ${templatePath}:\n${error?.message}`);
    error.$processed = true;
    throw error;
  }

  const outputPath = path.join('output', path.relative('templates', templatePath));
  const outputExtension = path.extname(outputPath);
  const finalOutputPath = outputExtension === '.json'
    ? outputPath.replace(/\.json$/, '.yml')
    : outputPath;

  await writeFile(finalOutputPath, renderedContent);
}

export async function clearOutputFolder(): Promise<void> {
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

export function mergeValues(objects: Values[]): Values {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

export function parseSetValues(setValues: string[]): Values {
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
