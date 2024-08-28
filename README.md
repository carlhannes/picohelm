# picohelm

A lightweight Kubernetes templating tool inspired by Helm, but with a focus on simplicity and ease of use.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Examples](#examples)
- [Secrets](#secrets)
- [Piping functionality](#piping-functionality)
- [Advanced piping example](#advanced-piping-example)
- [Available Pipes](#available-pipes)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [License](#license)

## Introduction

picohelm is an opinionated, lightweight alternative to Helm for Kubernetes templating, made for developers who want to focus on writing code, not managing Kubernetes resources. It fills the gap between raw Kubernetes configurations and the full-fledged Helm charting system. Do you want a simple k8s templating solution without the overhead of installing and managing Helm charts? Then picohelm is for you.

Picohelm supports a subset of Helm features, such as templating, values files, and command-line value setting. picohelm uses a syntax similar to Helm, making it easy for Helm users to transition to the future of Kubernetes templating - simplicity and speed. 

The first rule of picohelm is we don't talk about ConfigMaps. The second rule of picohelm is that we share it with our friends.

### Why picohelm?

- Lightweight and easy to use
- Supports environment variables out of the box
- No need to install or manage charts
- Perfect for CI/CD pipelines
- Familiar syntax for Helm users

## Features

- Mustache-compatible templating (using wontache for speed)
- Uses template syntax similar to Helm (e.g., `{{.Values.appName}}`)
- Support for `values.yml` (or `values.yaml`, `values.json`) files
- Command-line value setting with `--set`
- Input files using `-f` or `--values`
- Input files can be YAML or JSON
- Environment variable support via `.ENV` (e.g., `{{.ENV.DATABASE_URL}}`)
- Nested value support
- Parallel file processing for improved performance
- Verbose mode for debugging (using the `--verbose` flag)

## Installation

You can install picohelm globally using npm:

```bash
npm install -g picohelm
```

Or run it directly using npx:

```bash
npx picohelm
```

## Usage

Basic usage:

```bash
picohelm [basePath] [options]
```

Options:

- `-f, --values <paths...>`: Path to values files
- `--set <values...>`: Set values on the command line
- `--verbose`: Enable verbose logging
- `-o, --output, --out-dir <path>`: Output directory (default: output)
- `-t, --templates <path>`: Path to templates directory (default: templates)
- `-v, --version`: Output the version number
- `-h, --help`: Display help for command

Example:

```bash
picohelm . -f values.yml --set environment=production --verbose
```

## Project Structure

A typical picohelm project structure:

```
.
├── templates/
│   ├── deployment.yml
│   ├── service.yml
│   └── configmap.yml
├── values.yml
├── Chart.yml (optional)
└── output/ (generated)
```

## Examples

### Template File (templates/deployment.yml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{.Values.appName}}
spec:
  replicas: {{.Values.replicas}}
  template:
    spec:
      containers:
      - name: {{.Values.appName}}
        image: {{.Values.image}}:{{.Values.tag}}
        env:
        - name: DATABASE_URL
          value: {{.ENV.DATABASE_URL}}
```

### Values File (values.yml)

```yaml
appName: myapp
replicas: 3
image: myregistry/myapp
tag: v1.0.0
```

### Command

```bash
export DATABASE_URL=mongodb://db.example.com:27017 && picohelm . -f values.yml --set tag=v1.1.0
```

### Output (output/deployment.yml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: myapp
        image: myregistry/myapp:v1.1.0
        env:
        - name: DATABASE_URL
          value: mongodb://db.example.com:27017
```

## Secrets

Avoid storing secrets in templates or values files (or ENV for that matter). 
Use Kubernetes Secrets or a secret management tool like HashiCorp Vault instead.
Read more about [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

## Limitations

- picohelm does not support Helm charts or subcharts.
- It doesn't have built-in support for releasing or rolling back deployments.
- No support for Helm hooks or other advanced Helm features.

## Piping functionality

Pipes are a powerful and flexible way to manipulate data within your templates. Inspired by the piping concept found in Unix/Linux systems and templating engines like Go's (that's widely used in Helm), pipes allow you to transform values dynamically as they are rendered in your templates. By chaining together different transformations, you can build complex data processing logic directly within your template, keeping your code clean and concise. While it is not 100% compatible with the Go/Helm templating engine, it provides a similar experience and syntax for users familiar with Helm, and we try our best to maintain a 1:1 compatibility with Helm's built-in functions.

### How to Use Pipes

In your templates, you can apply pipes using the `|` symbol. The pipe operator allows you to pass the output of one expression as the input to a pipe function. You can also chain multiple pipes together to perform sequential transformations.

### Basic Example

```mustache
{{ .Values.name | upper }}
```

In the above example, the `upper` pipe transforms the `name` variable to uppercase.
If your values.yml file is `name: john doe`, the output will be `JOHN DOE`.

### Example with Multiple Pipes

```mustache
{{ .Values.description | trim | abbrev 10 }}
```

In this example, the `description` is first trimmed of whitespace, and then abbreviated to a maximum of 10 characters. For example, if your values.yml file is `description: "This is a long description"`, the output will be `This is a...`.

### Using Pipes with Arguments

Pipes can also accept arguments. If your values.yml file is:

```yaml
title: "I.Am.Henry.VIII"
```
and use the following template:

```mustache
{{ .Values.title | replace . - }}
```

The output will be `I-Am-Henry-VIII`.

## Advanced piping example 

Thanks to a combination of mustache / wontache functionality and the piping system, you can create complex templates that iterate over objects and arrays, apply transformations, and generate Kubernetes resources dynamically. Here is an example of how you can use pipes to generate multiple Kubernetes Secret resources from a single values file:

```yaml
{{#.Values.secrets | values}}
apiVersion: v1
kind: Secret
metadata:
  name: {{ _key }}
type: Opaque
data:
{{#_value | values}}
  {{_key}}: {{_value | b64enc }}
{{/_value | values}}
---
{{/.Values.secrets | values}}
```

In the example above, we iterate over .Values.secrets using the `| values` pipe, which expands an object to an array of objects with `_key` and `_value`, which then in turn can be iterated over again or piped.

Given the following `values.yml` file:

```yaml
secrets:
  postgres-secret:
    POSTGRES_PASSWORD: kabanoss
  rabbitmq-secret:
    RABBITMQ_PASSWORD: baconandcheese
```

It would yield the following output:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
data:
    POSTGRES_PASSWORD: a2FiYW5vc3M=
---
apiVersion: v1
kind: Secret
metadata:
  name: rabbitmq-secret
type: Opaque
data:
    RABBITMQ_PASSWORD: YmFjb25hbmRjaGVlc2U=
---
```

## Available Pipes

If you look in [PIPES.md](PIPES.md), you will find a list of all the available pipes and their descriptions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License
