#!/usr/bin/env node

// src/picohelm.ts
import { program } from "commander";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import wontache from "wontache";
import dotenv from "dotenv";
import { glob } from "glob";

// package.json
var version = "0.1.1";

// src/picohelm.ts
dotenv.config();
async function readFile(filePath) {
  return fs.readFile(filePath, "utf-8");
}
async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
}
function parseYamlOrJson(content) {
  try {
    return yaml.load(content);
  } catch (e) {
    return JSON.parse(content);
  }
}
async function processTemplate(templatePath, values, verbose) {
  if (verbose) {
    console.log(`Processing ${path.relative(process.cwd(), templatePath)}`);
  }
  const templateContent = await readFile(templatePath);
  const template = wontache(templateContent);
  const renderedContent = template(values);
  const outputPath = path.join("output", path.relative("templates", templatePath));
  const outputExtension = path.extname(outputPath);
  const finalOutputPath = outputExtension === ".json" ? outputPath.replace(/\.json$/, ".yml") : outputPath;
  await writeFile(finalOutputPath, renderedContent);
}
async function clearOutputFolder() {
  const outputPath = path.resolve(process.cwd(), "output");
  try {
    const files = await fs.readdir(outputPath);
    const nonYamlFiles = files.filter((file) => ![".yml", ".yaml"].includes(path.extname(file)));
    if (nonYamlFiles.length > 0) {
      throw new Error("Non-YAML files found in output folder. Please remove them manually for security reasons.");
    }
    await Promise.all(files.map((file) => fs.unlink(path.join(outputPath, file))));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
function mergeValues(objects) {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}
function parseSetValues(setValues) {
  const result = {};
  for (const setValue of setValues) {
    const [key, value] = setValue.split("=");
    const keys = key.split(".");
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
  program.version(version, "-v, --version").argument("[basePath]", "Base path for templates and values", ".").option("-f, --values <paths...>", "Path to values files").option("--set <values...>", "Set values on the command line").option("--verbose", "Enable verbose logging to see processed files and the merged values").helpOption("-h, --help", "Display help for command").parse(process.argv);
  const options = program.opts();
  const basePath = path.resolve(process.cwd(), program.args[0] || ".");
  const templatesPath = path.join(basePath, "templates");
  const valuesFiles = options.values || [];
  const setValues = options.set || [];
  const verbose = options.verbose || false;
  try {
    const valueObjects = await Promise.all(
      [
        path.join(basePath, "values.yml"),
        path.join(basePath, "values.yaml"),
        path.join(basePath, "values.json"),
        ...valuesFiles
      ].map(async (file) => {
        try {
          const content = await readFile(file);
          return parseYamlOrJson(content);
        } catch (error) {
          if (error.code !== "ENOENT") {
            throw error;
          }
          return {};
        }
      })
    );
    const mergedValues = mergeValues([...valueObjects, parseSetValues(setValues)]);
    const finalValues = { "": { Values: mergedValues, ENV: process.env } };
    try {
      const chartContent = await readFile(path.join(basePath, "Chart.yml"));
      finalValues[""].Chart = parseYamlOrJson(chartContent);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    if (verbose) {
      console.log(
        "Merged values:",
        JSON.stringify(finalValues, null, 2)
      );
    }
    await clearOutputFolder();
    const templateFiles = await glob("**/*.{yml,yaml,json}", { cwd: templatesPath });
    if (templateFiles.length === 0) {
      throw new Error("No template files found in the templates folder.");
    }
    const processTemplates = templateFiles.map(
      (file) => processTemplate(path.join(templatesPath, file), finalValues, verbose)
    );
    await Promise.all(processTemplates);
    console.log(`Processed ${templateFiles.length} files successfully.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
main().then(() => process.exit(0)).catch(() => process.exit(1));