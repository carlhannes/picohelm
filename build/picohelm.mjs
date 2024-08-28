#!/usr/bin/env node

// src/picohelm.ts
import { program } from "commander";
import path2 from "path";
import dotenv from "dotenv";
import { glob } from "glob";

// package.json
var version = "0.3.2";

// src/functions.ts
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import wontache from "wontache";
async function readFile(filePath) {
  return fs.readFile(filePath, "utf-8");
}
async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
}
function parseYamlOrJson(content) {
  try {
    const result = yaml.load(content);
    return result;
  } catch (e) {
    return JSON.parse(content);
  }
}
async function processTemplate(templatePath, values, verbose, outputPath) {
  if (verbose) {
    console.log(`Processing ${path.relative(process.cwd(), templatePath)}`);
  }
  let renderedContent;
  try {
    const templateContent = await readFile(templatePath);
    const template = wontache(templateContent);
    renderedContent = template(values);
  } catch (error) {
    console.error(`Error in template ${templatePath}:
${error?.message}`);
    error.$processed = true;
    throw error;
  }
  const outputExtension = path.extname(outputPath);
  const finalOutputPath = outputExtension === ".json" ? outputPath.replace(/\.json$/, ".yml") : outputPath;
  await writeFile(finalOutputPath, renderedContent);
}
async function clearOutputFolder(outputPath) {
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

// src/pipes/encoding.ts
var BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var BASE32_PAD_CHAR = "=";
function base32Encode(input) {
  let output = "";
  let buffer = 0;
  let bitsLeft = 0;
  for (let i = 0; i < input.length; i += 1) {
    buffer = buffer << 8 | input.charCodeAt(i);
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      const index = buffer >> bitsLeft - 5 & 31;
      output += BASE32_ALPHABET[index];
      bitsLeft -= 5;
    }
  }
  if (bitsLeft > 0) {
    output += BASE32_ALPHABET[buffer << 5 - bitsLeft & 31];
  }
  while (output.length % 8 !== 0) {
    output += BASE32_PAD_CHAR;
  }
  return output;
}
function base32Decode(inputStr) {
  let buffer = 0;
  let bitsLeft = 0;
  let output = "";
  const input = inputStr.replace(new RegExp(BASE32_PAD_CHAR, "g"), "");
  for (let i = 0; i < input.length; i += 1) {
    const index = BASE32_ALPHABET.indexOf(input[i].toUpperCase());
    if (index === -1) continue;
    buffer = buffer << 5 | index;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      output += String.fromCharCode(buffer >> bitsLeft - 8 & 255);
      bitsLeft -= 8;
    }
  }
  return output;
}
var encodingPipes = {
  b64enc: (value) => Buffer.from(value.toString()).toString("base64"),
  b64dec: (value) => Buffer.from(value.toString(), "base64").toString("utf-8"),
  b32enc: (value) => base32Encode(value.toString()),
  b32dec: (value) => base32Decode(value.toString())
};
var encoding_default = encodingPipes;

// src/pipes/object-array-sort.ts
var objectArraySortPipes = {
  hasKey: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
  isLast: (arr) => {
    if (arr._parent) {
      return arr._parent[arr._parent.length - 1] === arr._value;
    }
    return false;
  },
  isFirst: (arr) => {
    if (arr._parent) {
      return arr._parent[0] === arr._value;
    }
    return false;
  },
  values: (obj) => Object.keys(obj).map((key) => ({
    _key: key,
    // @ts-expect-error this is so ugly but hey it works
    _value: obj[key],
    _parent: obj,
    // @ts-expect-error this is so ugly but hey it works
    toString: () => obj[key]
  })),
  // @ts-expect-error ugh
  sortAlpha: (arr) => {
    if (!Array.isArray(arr)) {
      return arr;
    }
    return arr.slice().sort((a, b) => a.localeCompare(b));
  },
  // @ts-expect-error ugh
  reverse: (arr) => Array.isArray(arr) ? arr.slice().reverse() : arr,
  // @ts-expect-error ugh
  uniq: (arr) => Array.from(new Set(arr)),
  // JSON
  json: (obj) => JSON.stringify(obj),
  // console.log
  log: (obj) => {
    console.log("Logging object: ", obj);
    return obj;
  }
};
var object_array_sort_default = objectArraySortPipes;

// src/pipes/string.ts
var escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var stringPipes = {
  trim: (value) => value.toString().trim(),
  trimAll: (char, value) => {
    const escapedChar = escapeRegExp(char.toString());
    return value.replace(new RegExp(`^${escapedChar}+|${escapedChar}+$`, "g"), "");
  },
  trimSuffix: (suffix, value) => value.endsWith(suffix.toString()) ? value.slice(0, -suffix.toString().length) : value,
  trimPrefix: (prefix, value) => value.startsWith(prefix.toString()) ? value.slice(prefix.toString().length) : value,
  upper: (value) => value.toString().toUpperCase(),
  lower: (value) => value.toString().toLowerCase(),
  title: (value) => value.toString().replace(/\b\w/g, (char) => char.toUpperCase()),
  untitle: (value) => value.toString().replace(/\b\w/g, (char) => char.toLowerCase()),
  repeat: (value, count) => value.toString().repeat(parseInt(count, 10)),
  substr: (value, start, end) => value.toString().substring(parseInt(start, 10), parseInt(end, 10)),
  nospace: (value) => value.toString().replace(/\s+/g, ""),
  trunc: (value, length) => parseInt(length, 10) > 0 ? value.toString().slice(0, parseInt(length, 10)) : value.toString().slice(parseInt(length, 10)),
  abbrev: (value, maxLength) => value.toString().length > parseInt(maxLength, 10) ? `${value.toString().slice(0, parseInt(maxLength, 10) - 3)}...` : value,
  abbrevboth: (value, leftOffset, maxLength) => {
    const len = parseInt(maxLength, 10);
    const left = parseInt(leftOffset, 10);
    if (value.toString().length <= len) return value;
    const remainingLength = len - 6;
    const rightOffset = value.toString().length - (remainingLength + left);
    if (remainingLength <= 0) return `...${value.toString().slice(-left)}...`;
    return `...${value.toString().slice(left, value.toString().toString().length - rightOffset)}...`;
  },
  initials: (value) => value.toString().split(/\s+/).map((word) => word.charAt(0).toUpperCase()).join(""),
  wrap: (value, width) => value.toString().replace(new RegExp(`(.{1,${width}})(\\s|$)`, "g"), "$1\n").trim(),
  wrapWith: (value, width, separator) => value.toString().replace(new RegExp(`(.{1,${width}})(\\s|$)`, "g"), `$1${separator}`).trim(),
  contains: (value, substring) => value.toString().includes(substring),
  hasPrefix: (value, prefix) => value.toString().startsWith(prefix),
  hasSuffix: (value, suffix) => value.toString().endsWith(suffix),
  quote: (value) => `"${value.toString()}"`,
  squote: (value) => `'${value.toString()}'`,
  cat: (...args) => args.join(" "),
  indent: (value, width) => value.toString().replace(/^/gm, " ".repeat(parseInt(width, 10))),
  nindent: (value, width) => `
${" ".repeat(parseInt(width, 10))}${value.toString().replace(/\n/g, `
${" ".repeat(parseInt(width, 10))}`)}`,
  replace: (value, oldSubStr, newSubStr) => value.toString().replace(new RegExp(oldSubStr, "g"), newSubStr),
  plural: (length, singular, plural) => parseInt(length.toString(), 10) === 1 ? singular : plural,
  snakecase: (value) => value.toString().replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase(),
  camelcase: (value) => value.toString().replace(/_([a-z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toUpperCase()),
  kebabcase: (value) => value.toString().replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
  swapcase: (value) => value.toString().split("").map((char) => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join(""),
  shuffle: (value) => value.toString().split("").sort(() => Math.random() - 0.5).join(""),
  regexMatch: (pattern, value) => new RegExp(pattern.toString()).test(value),
  regexFindAll: (pattern, value, n) => {
    const regex = new RegExp(pattern.toString(), "g");
    const matches = value.match(regex) || [];
    return n === "-1" ? matches : matches.slice(0, parseInt(n, 10));
  },
  regexFind: (pattern, value) => {
    const match = value.match(new RegExp(pattern.toString()));
    return match ? match[0] : "";
  },
  regexReplaceAll: (pattern, value, replacement) => {
    const regex = new RegExp(pattern.toString(), "g");
    return value.replace(regex, (_1, ...args) => replacement.replace(/\$\{(\d+)\}/g, (_2, groupIndex) => args[groupIndex - 1] || ""));
  },
  regexReplaceAllLiteral: (pattern, value, replacement) => {
    const regex = new RegExp(pattern.toString(), "g");
    return value.replace(regex, replacement);
  },
  regexSplit: (pattern, value, n) => {
    const limit = parseInt(n, 10);
    const regex = new RegExp(pattern.toString());
    if (limit === -1) {
      return value.split(regex);
    }
    const result = value.split(regex);
    return result.slice(0, limit);
  },
  regexQuoteMeta: (value) => value.toString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
};
var string_default = stringPipes;

// src/proxy.ts
var defaultPipes = {
  ...string_default,
  ...encoding_default,
  ...object_array_sort_default
};
function createProxy(context, additionalPipes) {
  const pipes = { ...defaultPipes, ...additionalPipes || {} };
  return new Proxy(context, {
    get(target, prop) {
      if (typeof prop === "symbol") {
        return target[prop];
      }
      if (typeof target[prop] !== "undefined") {
        const value = target[prop];
        if (typeof value === "object" && value !== null) {
          return createProxy(value, pipes);
        }
        return typeof value === "function" ? value.call(target) : value;
      }
      if (prop.includes("|")) {
        const [key, ...pipeSegments] = prop.split("|").map((p) => p.trim());
        let value = target[key];
        if (value === void 0) return void 0;
        for (const segment of pipeSegments) {
          const [pipeName, ...args] = segment.split(" ").map((arg) => arg.trim());
          if (pipes[pipeName]) {
            value = pipes[pipeName](value, ...args);
            if (typeof value === "object" && value !== null) {
              value = createProxy(value, pipes);
            }
          } else {
            throw new Error(`Pipe "${pipeName}" not found while processing "${prop}"`);
          }
        }
        return value;
      }
      return void 0;
    }
  });
}

// src/picohelm.ts
dotenv.config();
async function main() {
  program.version(version, "-v, --version").argument("[basePath]", "Base path for templates and values", ".").option("-f, --values <paths...>", "Path to values files").option("--set <values...>", "Set values on the command line").option("--verbose", "Enable verbose logging to see processed files and the merged values").option("-t, --templates", "Path to templates folder", "templates").option("-o, --output, --out-dir <path>", "Output directory", "output").helpOption("-h, --help", "Display help for command").parse(process.argv);
  const options = program.opts();
  const basePath = path2.resolve(process.cwd(), program.args[0] || ".");
  const templatesPath = options.templates[0] === "/" ? options.templates : path2.resolve(basePath, options.templates);
  const outputFolder = options.output[0] === "/" ? options.output : path2.resolve(basePath, options.output);
  const valuesFiles = options.values || [];
  const setValues = options.set || [];
  const verbose = options.verbose || false;
  try {
    const valueObjects = await Promise.all(
      [
        path2.join(basePath, "values.yml"),
        path2.join(basePath, "values.yaml"),
        path2.join(basePath, "values.json"),
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
    const mergedValues = mergeValues([
      ...valueObjects,
      parseSetValues(setValues)
    ]);
    let ChartValues = {};
    try {
      const chartContent = await readFile(path2.join(basePath, "Chart.yml"));
      ChartValues = parseYamlOrJson(chartContent);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    const finalValues = createProxy({
      // the empty string is the root context
      // this is to trick it to use {{ .Values }} instead of {{ Values }}
      // to mimic Helm's behavior
      // (i know you hate me for this)
      "": {
        Values: mergedValues,
        ENV: process.env,
        Chart: ChartValues
      }
    });
    if (verbose) {
      console.log(
        "Merged values:",
        JSON.stringify(finalValues, null, 2)
      );
    }
    await clearOutputFolder(outputFolder);
    const templateFiles = await glob("**/*.{yml,yaml,json}", { cwd: templatesPath });
    if (templateFiles.length === 0) {
      throw new Error("No template files found in the templates folder.");
    }
    const processTemplates = templateFiles.map(
      (file) => processTemplate(
        path2.join(templatesPath, file),
        finalValues,
        verbose,
        path2.join(outputFolder, file)
      )
    );
    await Promise.all(processTemplates);
    console.log(`Processed ${templateFiles.length} files successfully.`);
  } catch (error) {
    if (!error.$processed) {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}
main().then(() => process.exit(0)).catch(() => process.exit(1));
