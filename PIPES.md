# Pipe Documentation

## Introduction

Pipes are a powerful and flexible way to manipulate data within your templates. Inspired by the piping concept found in Unix/Linux systems and templating engines like Go (widely used in Helm), pipes allow you to transform values dynamically as they are rendered in your templates. By chaining together different transformations, you can build complex data processing logic directly within your template, keeping your code clean and concise. While it is not 100% compatible with the Go/Helm templating engine, it provides a similar experience and syntax for users familiar with Helm.

## Example `values.yml`

To better understand the following pipe functions, consider the following example `values.yml` file:

```yaml
exampleDict:
  name1: value1
  name2: value2
  name3: value3

exampleList:
  - apple
  - banana
  - cherry

exampleString: " Hello World "
exampleNestedList:
  - 1
  - 2
  - 3
  - 3
  - 4
  - 5
```

## Object and Array Pipes

### `hasKey`

**Description**: Checks if the provided key exists in the given object.

**Example**:

```mustache
{{ .Values.exampleDict | hasKey "name1" }}
```

**Result**: `true`

### `isFirst`

**Description**: Checks if the current element is the first in its parent array.

**Example**:

```mustache
{{ .Values.exampleList | values | isFirst }}
```

**Result**: `true` for the first element, `false` otherwise.

### `isLast`

**Description**: Checks if the current element is the last in its parent array.

**Example**:

```mustache
{{ .Values.exampleList | values | isLast }}
```

**Result**: `true` for the last element, `false` otherwise.

### `values`

**Description**: Returns a list of values from an object, each containing metadata such as `_key` and `_value`.

**Example**:

```mustache
{{ .Values.exampleDict | values }}
```

**Result**: A list containing `{_key: "name1", _value: "value1", ...}`, etc.

### `sortAlpha`

**Description**: Sorts an array of strings in alphabetical order.

**Example**:

```mustache
{{ .Values.exampleList | sortAlpha }}
```

**Result**: `["apple", "banana", "cherry"]`

### `reverse`

**Description**: Reverses the order of elements in an array.

**Example**:

```mustache
{{ .Values.exampleList | reverse }}
```

**Result**: `["cherry", "banana", "apple"]`

### `uniq`

**Description**: Removes duplicate elements from an array.

**Example**:

```mustache
{{ .Values.exampleNestedList | uniq }}
```

**Result**: `[1, 2, 3, 4, 5]`

### `json`

**Description**: Converts an object to a JSON string.

**Example**:

```mustache
{{ .Values.exampleDict | json }}
```

**Result**: `{"name1":"value1","name2":"value2","name3":"value3"}`

### `log`

**Description**: Logs the object to the console and returns the object as-is.

**Example**:

```mustache
{{ .Values.exampleDict | log }}
```

**Result**: Logs the object to the console and returns it for further use in the template.

## String Manipulation Pipes

### `trim`

**Description**: Removes whitespace from both sides of a string.

**Example**:

```mustache
{{ .Values.exampleString | trim }}
```

**Result**: `"Hello World"`

### `trimAll`

**Description**: Removes all occurrences of a specified character from both sides of a string.

**Example**:

```mustache
{{ "$5.00" | trimAll "$" }}
```

**Result**: `"5.00"`

### `trimSuffix`

**Description**: Removes a specified suffix from a string.

**Example**:

```mustache
{{ "hello-" | trimSuffix "-" }}
```

**Result**: `"hello"`

### `trimPrefix`

**Description**: Removes a specified prefix from a string.

**Example**:

```mustache
{{ "-hello" | trimPrefix "-" }}
```

**Result**: `"hello"`

### `uppercase`

**Description**: Converts a string to uppercase.

**Example**:

```mustache
{{ .Values.exampleString | uppercase }}
```

**Result**: `" HELLO WORLD "`

### `lowercase`

**Description**: Converts a string to lowercase.

**Example**:

```mustache
{{ .Values.exampleString | lowercase }}
```

**Result**: `" hello world "`

### `title`

**Description**: Converts a string to title case.

**Example**:

```mustache
{{ "hello world" | title }}
```

**Result**: `"Hello World"`

### `untitle`

**Description**: Converts a title-cased string to lowercase.

**Example**:

```mustache
{{ "Hello World" | untitle }}
```

**Result**: `"hello world"`

### `repeat`

**Description**: Repeats a string a specified number of times.

**Example**:

```mustache
{{ "hello" | repeat 3 }}
```

**Result**: `"hellohellohello"`

### `substr`

**Description**: Extracts a substring from a string based on start and end positions.

**Example**:

```mustache
{{ .Values.exampleString | substr 0 5 }}
```

**Result**: `" Hello"`

### `nospace`

**Description**: Removes all whitespace from a string.

**Example**:

```mustache
{{ "hello w o r l d" | nospace }}
```

**Result**: `"helloworld"`

### `trunc`

**Description**: Truncates a string to a specified length.

**Example**:

```mustache
{{ "hello world" | trunc 5 }}
```

**Result**: `"hello"`

### `abbrev`

**Description**: Abbreviates a string with ellipses if it exceeds a specified length.

**Example**:

```mustache
{{ "hello world" | abbrev 5 }}
```

**Result**: `"he..."`

### `abbrevboth`

**Description**: Abbreviates both sides of a string with ellipses, retaining the middle portion.

**Example**:

```mustache
{{ "1234 5678 9123" | abbrevboth 5 10 }}
```

**Result**: `"...5678..."`

### `initials`

**Description**: Extracts the initials from a string.

**Example**:

```mustache
{{ "First Try" | initials }}
```

**Result**: `"FT"`

### `wrap`

**Description**: Wraps text at a specified column count.

**Example**:

```mustache
{{ "This is a long line of text" | wrap 10 }}
```

**Result**: 
```
This is a
long line
of text
```

### `wrapWith`

**Description**: Wraps text with a custom string at a specified column count.

**Example**:

```mustache
{{ "Hello World" | wrapWith 5 "\t" }}
```

**Result**: `"Hello\tWorld"`

### `contains`

**Description**: Checks if a string contains another string.

**Example**:

```mustache
{{ "catch" | contains "cat" }}
```

**Result**: `true`

### `hasPrefix`

**Description**: Checks if a string starts with a specified prefix.

**Example**:

```mustache
{{ "catch" | hasPrefix "cat" }}
```

**Result**: `true`

### `hasSuffix`

**Description**: Checks if a string ends with a specified suffix.

**Example**:

```mustache
{{ "catch" | hasSuffix "ch" }}
```

**Result**: `true`

### `quote`

**Description**: Wraps a string in double quotes.

**Example**:

```mustache
{{ .Values.exampleString | quote }}
```

**Result**: `"\" Hello World \""`

### `squote`

**Description**: Wraps a string in single quotes.

**Example**:

```mustache
{{ .Values.exampleString | squote }}
```

**Result**: `"' Hello World '"`

### `cat`

**Description**: Concatenates multiple strings together with spaces.

**Example**:

```mustache
{{ cat "hello" "beautiful" "world" }}
```

**Result**: `"hello beautiful world"`

### `indent`

**Description**: Indents every line of a string by a specified number of spaces.

**Example**:

```mustache
{{ "This is a test" | indent 4 }}
```

**Result**: `"    This is a test"`

### `nindent`

**Description**: Adds a new line and indents every line of a string by a specified number of spaces.

**Example**:

```mustache
{{ "This is a test" | nindent 4 }}
```

**Result**: `"\n    This is a test"`

### `replace`

**Description**: Replaces all occurrences of a substring with another string.

**Example**:

```mustache
{{ "I Am Henry VIII" | replace " " "-" }}
```

**Result**: `"I-Am-Henry-VIII"`

### `plural`

**Description**: Pluralizes

 a string based on the provided count.

**Example**:

```mustache
{{ plural 2 "one anchovy" "many anchovies" }}
```

**Result**: `"many anchovies"`

### `snakecase`

**Description**: Converts a string from camelCase to snake_case.

**Example**:

```mustache
{{ "FirstName" | snakecase }}
```

**Result**: `"first_name"`

### `camelcase`

**Description**: Converts a string from snake_case to CamelCase.

**Example**:

```mustache
{{ "http_server" | camelcase }}
```

**Result**: `"HttpServer"`

### `kebabcase`

**Description**: Converts a string from camelCase to kebab-case.

**Example**:

```mustache
{{ "FirstName" | kebabcase }}
```

**Result**: `"first-name"`

### `swapcase`

**Description**: Swaps the case of each character in a string.

**Example**:

```mustache
{{ "This Is A.Test" | swapcase }}
```

**Result**: `"tHIS iS a.tEST"`

### `shuffle`

**Description**: Randomly shuffles the characters in a string.

**Example**:

```mustache
{{ "hello" | shuffle }}
```

**Result**: `"olhel"` (or other random permutations)

## Regular Expression Pipes

### `regexMatch`

**Description**: Returns `true` if the input string contains a match for the regular expression.

**Example**:

```mustache
{{ "test@acme.com" | regexMatch "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$" }}
```

**Result**: `true`

### `regexFindAll`

**Description**: Returns an array of all matches for the regular expression in the input string.

**Example**:

```mustache
{{ "123456789" | regexFindAll "[2,4,6,8]" -1 }}
```

**Result**: `["2", "4", "6", "8"]`

### `regexFind`

**Description**: Returns the first match for the regular expression in the input string.

**Example**:

```mustache
{{ "abcd1234" | regexFind "[a-zA-Z][1-9]" }}
```

**Result**: `"d1"`

### `regexReplaceAll`

**Description**: Replaces all matches of the regular expression with the replacement string (supports `$1`, `$2`, etc., for group captures).

**Example**:

```mustache
{{ "-ab-axxb-" | regexReplaceAll "a(x*)b" "${1}W" }}
```

**Result**: `"-W-xxW-"`

### `regexReplaceAllLiteral`

**Description**: Replaces all matches of the regular expression with the literal replacement string.

**Example**:

```mustache
{{ "-ab-axxb-" | regexReplaceAllLiteral "a(x*)b" "${1}" }}
```

**Result**: `"-${1}-${1}-"`

### `regexSplit`

**Description**: Splits the input string using a regular expression pattern.

**Example**:

```mustache
{{ "pizza" | regexSplit "z+" -1 }}
```

**Result**: `["pi", "a"]`

### `regexQuoteMeta`

**Description**: Escapes all regular expression metacharacters in the input string.

**Example**:

```mustache
{{ "1.2.3" | regexQuoteMeta }}
```

**Result**: `"1\\.2\\.3"`

## Encoding Pipes

### `b64enc`

**Description**: Encodes a string to Base64.

**Example**:

```mustache
{{ .Values.exampleString | b64enc }}
```

**Result**: `"SGVsbG8gV29ybGQ="`

### `b64dec`

**Description**: Decodes a Base64 string.

**Example**:

```mustache
{{ "SGVsbG8gV29ybGQ=" | b64dec }}
```

**Result**: `"Hello World"`

### `b32enc`

**Description**: Encodes a string to Base32.

**Example**:

```mustache
{{ .Values.exampleString | b32enc }}
```

**Result**: `"JBSWY3DPEBLW64TMMQ======"`

### `b32dec`

**Description**: Decodes a Base32 string.

**Example**:

```mustache
{{ "JBSWY3DPEBLW64TMMQ======" | b32dec }}
```

**Result**: `"Hello World"`
