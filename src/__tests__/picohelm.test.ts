/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from 'fs/promises';
import path from 'path';
import {
  readFile,
  writeFile,
  clearOutputFolder,
  processTemplate,
  parseYamlOrJson,
  mergeValues,
  parseSetValues,
} from '../functions';

jest.mock('fs/promises');
jest.mock('glob');

describe('Main functionality tests', () => {
  const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
  const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
  const mockReaddir = fs.readdir as jest.MockedFunction<typeof fs.readdir>;
  const mockUnlink = fs.unlink as jest.MockedFunction<typeof fs.unlink>;
  const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should read and parse a YAML file', async () => {
    const yamlContent = 'key: value';
    mockReadFile.mockResolvedValueOnce(yamlContent);

    const parsed = parseYamlOrJson(await readFile('test.yml'));

    expect(mockReadFile).toHaveBeenCalledWith('test.yml', 'utf-8');
    expect(parsed).toEqual({ key: 'value' });
  });

  it('should write content to a file and create directories if needed', async () => {
    const filePath = 'output/test.yml';
    const content = 'some content';

    await writeFile(filePath, content);

    expect(mockMkdir).toHaveBeenCalledWith(path.dirname(filePath), { recursive: true });
    expect(mockWriteFile).toHaveBeenCalledWith(filePath, content, 'utf-8');
  });

  it('should clear the output folder if no non-YAML files exist', async () => {
    // @ts-expect-error wants dirents but we're mocking it as string[]
    mockReaddir.mockResolvedValueOnce(['file1.yml', 'file2.yaml']);
    const outputPath = 'output';

    await clearOutputFolder(outputPath);

    expect(mockReaddir).toHaveBeenCalled();
    expect(mockUnlink).toHaveBeenCalledTimes(2);
  });

  it('should throw an error if non-YAML files exist in the output folder', async () => {
    // @ts-expect-error wants dirents but we're mocking it as string[]
    mockReaddir.mockResolvedValueOnce(['file1.yml', 'file2.txt']);
    const outputPath = 'output';

    await expect(clearOutputFolder(outputPath)).rejects.toThrow('Non-YAML files found in output folder');
  });

  it('should process a template and write the rendered content to a file', async () => {
    const templateContent = 'Hello, {{name}}!';
    const values = { name: 'World' };
    const templatePath = 'templates/test.yml';
    const outputPath = 'output/test.yml';

    mockReadFile.mockResolvedValueOnce(templateContent);

    await processTemplate(templatePath, values, false, outputPath);

    expect(mockReadFile).toHaveBeenCalledWith(templatePath, 'utf-8');
    expect(mockWriteFile).toHaveBeenCalledWith('output/test.yml', 'Hello, World!', 'utf-8');
  });

  it('should merge multiple value objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const merged = mergeValues([obj1, obj2]);

    expect(merged).toEqual({ a: 1, b: 2 });
  });

  it('should parse set values and convert them to nested objects', () => {
    const setValues = ['a.b=1', 'a.c=2', 'd=3'];
    const parsed = parseSetValues(setValues);

    expect(parsed).toEqual({
      a: { b: '1', c: '2' },
      d: '3',
    });
  });
});

describe('Additional tests to adhere to readme', () => {
  const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
  const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should inject environment variables into templates', async () => {
    process.env.DATABASE_URL = 'mongodb://db.example.com:27017';
    const templateContent = `
    env:
      - name: DATABASE_URL
        value: {{.ENV.DATABASE_URL}}
    `;
    const values = {};
    const templatePath = 'templates/env.yml';
    const outputPath = 'output/env.yml';

    mockReadFile.mockResolvedValueOnce(templateContent);

    await processTemplate(templatePath, { '': { Values: values, ENV: process.env } }, false, outputPath);

    expect(mockWriteFile).toHaveBeenCalledWith(
      'output/env.yml',
      `
    env:
      - name: DATABASE_URL
        value: mongodb://db.example.com:27017
    `,
      'utf-8',
    );
  });

  it('should handle nested values in the values file', async () => {
    const templateContent = `
    metadata:
      name: {{.Values.app.name}}
    `;
    const values = {
      app: {
        name: 'my-nested-app',
      },
    };
    const templatePath = 'templates/nested.yml';
    const outputPath = 'output/nested.yml';

    mockReadFile.mockResolvedValueOnce(templateContent);

    await processTemplate(templatePath, { '': { Values: values, ENV: process.env } }, false, outputPath);

    expect(mockWriteFile).toHaveBeenCalledWith(
      'output/nested.yml',
      `
    metadata:
      name: my-nested-app
    `,
      'utf-8',
    );
  });

  it('should override values with --set command-line arguments', async () => {
    const templateContent = `
    image: {{.Values.image}}:{{.Values.tag}}
    `;
    const values = {
      image: 'myregistry/myapp',
      tag: 'v1.0.0',
    };
    const setValues = ['tag=v1.1.0'];
    const templatePath = 'templates/image.yml';
    const outputPath = 'output/image.yml';

    mockReadFile.mockResolvedValueOnce(templateContent);

    const finalValues = { '': { Values: mergeValues([values, parseSetValues(setValues)]), ENV: process.env } };

    await processTemplate(templatePath, finalValues, false, outputPath);

    expect(mockWriteFile).toHaveBeenCalledWith(
      'output/image.yml',
      `
    image: myregistry/myapp:v1.1.0
    `,
      'utf-8',
    );
  });

  it('should process both YAML and JSON files', () => {
    const yamlContent = 'appName: myapp';
    const jsonContent = '{"appName": "myapp"}';

    const yamlValues = parseYamlOrJson(yamlContent);
    const jsonValues = parseYamlOrJson(jsonContent);

    expect(yamlValues).toEqual({ appName: 'myapp' });
    expect(jsonValues).toEqual({ appName: 'myapp' });
  });
});
