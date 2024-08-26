#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/picohelm.ts
var import_commander = require("commander");
var fs = __toESM(require("fs/promises"), 1);
var path = __toESM(require("path"), 1);
var yaml = __toESM(require("js-yaml"), 1);
var mustache = __toESM(require("mustache"), 1);
var dotenv = __toESM(require("dotenv"), 1);
var import_glob = require("glob");
dotenv.config();
async function readFile2(filePath) {
  return fs.readFile(filePath, "utf-8");
}
async function writeFile2(filePath, content) {
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
  const templateContent = await readFile2(templatePath);
  const renderedContent = mustache.render(templateContent, values);
  const outputPath = path.join("output", path.relative("templates", templatePath));
  const outputExtension = path.extname(outputPath);
  const finalOutputPath = outputExtension === ".json" ? outputPath.replace(/\.json$/, ".yml") : outputPath;
  await writeFile2(finalOutputPath, renderedContent);
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
  let version = "";
  try {
    version = JSON.parse(await readFile2(path.resolve(__dirname, "../package.json"))).version;
  } catch (error) {
    console.error("Error: Could not read package.json file.");
    process.exit(1);
  }
  import_commander.program.version(version, "-v, --version").argument("[basePath]", "Base path for templates and values", "k8s").option("-f, --values <paths...>", "Path to values files").option("--set <values...>", "Set values on the command line").option("--verbose", "Enable verbose logging").helpOption("-h, --help", "Display help for command").parse(process.argv);
  const options = import_commander.program.opts();
  const basePath = path.resolve(process.cwd(), import_commander.program.args[0] || "k8s");
  const templatesPath = path.join(basePath, "templates");
  const valuesFiles = options.values || [];
  const setValues = options.set || [];
  const verbose = options.verbose || false;
  try {
    const valueObjects = await Promise.all(
      [path.join(basePath, "values.yml"), path.join(basePath, "values.yaml"), path.join(basePath, "values.json"), ...valuesFiles].filter((file) => fs.access(file).then(() => true).catch(() => false)).map(async (file) => parseYamlOrJson(await readFile2(file)))
    );
    const mergedValues = mergeValues([...valueObjects, parseSetValues(setValues)]);
    const finalValues = { "": { Values: mergedValues, ENV: process.env } };
    try {
      const chartContent = await readFile2(path.join(basePath, "Chart.yml"));
      finalValues[""].Chart = parseYamlOrJson(chartContent);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    await clearOutputFolder();
    const templateFiles = await (0, import_glob.glob)("**/*.{yml,yaml,json}", { cwd: templatesPath });
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
