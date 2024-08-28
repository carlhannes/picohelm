#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { program } from 'commander';
import path from 'path';

import dotenv from 'dotenv';
import { glob } from 'glob';
import { version } from '../package.json';
import {
  clearOutputFolder,
  mergeValues,
  parseSetValues,
  parseYamlOrJson,
  processTemplate,
  readFile,
  Values,
} from './functions';
import createProxy from './proxy';

dotenv.config();

async function main() {
  program
    .version(version, '-v, --version')
    .argument('[basePath]', 'Base path for templates and values', '.')
    .option('-f, --values <paths...>', 'Path to values files')
    .option('--set <values...>', 'Set values on the command line')
    .option('--verbose', 'Enable verbose logging to see processed files and the merged values')
    .option('-t, --templates', 'Path to templates folder', 'templates')
    .option('-o, --output, --out-dir <path>', 'Output directory', 'output')
    .helpOption('-h, --help', 'Display help for command')
    .parse(process.argv);

  const options = program.opts();

  const basePath = path.resolve(process.cwd(), program.args[0] || '.');

  const templatesPath: string = (options.templates as string)[0] === '/' ? options.templates : path.resolve(basePath, options.templates as string);
  const outputFolder: string = (options.output as string)[0] === '/' ? options.output : path.resolve(basePath, options.output as string);

  const valuesFiles = options.values || [];
  const setValues: string[] = options.set || [];
  const verbose: boolean = options.verbose || false;

  try {
    // Read values files
    const valueObjects: Values[] = await Promise.all(
      [
        path.join(basePath, 'values.yml'),
        path.join(basePath, 'values.yaml'),
        path.join(basePath, 'values.json'),
        ...valuesFiles,
      ]
        .map(async (file: string) => {
          try {
            const content = await readFile(file);
            return parseYamlOrJson(content);
          } catch (error) {
            if ((error as any).code !== 'ENOENT') {
              throw error;
            }
            return {};
          }
        }),
    );

    // Merge values
    const mergedValues: Values = mergeValues([
      ...valueObjects,
      parseSetValues(setValues),
    ]);
    let ChartValues = {};

    // Read Chart.yml if exists
    try {
      const chartContent = await readFile(path.join(basePath, 'Chart.yml'));
      ChartValues = parseYamlOrJson(chartContent);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }

    // create the final
    const finalValues: Values = createProxy({
      // the empty string is the root context
      // this is to trick it to use {{ .Values }} instead of {{ Values }}
      // to mimic Helm's behavior
      // (i know you hate me for this)
      '': {
        Values: mergedValues,
        ENV: process.env,
        Chart: ChartValues,
      },
    });

    if (verbose) {
      console.log(
        'Merged values:',
        JSON.stringify(finalValues, null, 2),
      );
    }

    // Clear output folder
    await clearOutputFolder(outputFolder);

    // Process templates
    const templateFiles = await glob('**/*.{yml,yaml,json}', { cwd: templatesPath });

    if (templateFiles.length === 0) {
      throw new Error('No template files found in the templates folder.');
    }

    const processTemplates = templateFiles.map(
      (file) => processTemplate(
        path.join(templatesPath, file),
        finalValues,
        verbose,
        path.join(outputFolder, file),
      ),
    );

    await Promise.all(processTemplates);

    console.log(`Processed ${templateFiles.length} files successfully.`);
  } catch (error: any) {
    if (!error.$processed) {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
