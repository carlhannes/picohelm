# Available pipes

### String Manipulation

- **`trim`**: Removes whitespace from both sides of a string.
- **`trimAll`**: Removes all occurrences of a specified character from both sides of a string.
- **`trimSuffix`**: Removes a specified suffix from a string.
- **`trimPrefix`**: Removes a specified prefix from a string.
- **`uppercase`**: Converts a string to uppercase.
- **`lowercase`**: Converts a string to lowercase.
- **`title`**: Converts a string to title case.
- **`untitle`**: Converts a title-cased string to lowercase.
- **`repeat`**: Repeats a string a specified number of times.
- **`substr`**: Extracts a substring from a string based on start and end positions.
- **`nospace`**: Removes all whitespace from a string.
- **`trunc`**: Truncates a string to a specified length.
- **`abbrev`**: Abbreviates a string with ellipses if it exceeds a specified length.
- **`abbrevboth`**: Abbreviates both sides of a string with ellipses, retaining the middle portion.
- **`initials`**: Extracts the initials from a string.
- **`wrap`**: Wraps text at a specified column count.
- **`wrapWith`**: Wraps text with a custom string at a specified column count.
- **`contains`**: Checks if a string contains another string.
- **`hasPrefix`**: Checks if a string starts with a specified prefix.
- **`hasSuffix`**: Checks if a string ends with a specified suffix.
- **`quote`**: Wraps a string in double quotes.
- **`squote`**: Wraps a string in single quotes.
- **`cat`**: Concatenates multiple strings together with spaces.
- **`indent`**: Indents every line in a string by a specified number of spaces.
- **`nindent`**: Adds a new line and indents every line in a string by a specified number of spaces.
- **`replace`**: Replaces all occurrences of a substring with another string.
- **`plural`**: Pluralizes a string based on the provided count.
- **`snakecase`**: Converts a string from camelCase to snake_case.
- **`camelcase`**: Converts a string from snake_case to CamelCase.
- **`kebabcase`**: Converts a string from camelCase to kebab-case.
- **`swapcase`**: Swaps the case of each character in a string.
- **`shuffle`**: Randomly shuffles the characters in a string.

### Regular Expressions

- **`regexMatch`**: Returns `true` if the input string contains a match for the regular expression.
- **`regexFindAll`**: Returns an array of all matches for the regular expression in the input string.
- **`regexFind`**: Returns the first match for the regular expression in the input string.
- **`regexReplaceAll`**: Replaces all matches of the regular expression with the replacement string (supports `$1`, `$2`, etc. for group captures).
- **`regexReplaceAllLiteral`**: Replaces all matches of the regular expression with the literal replacement string.
- **`regexSplit`**: Splits the input string using a regular expression pattern.
- **`regexQuoteMeta`**: Escapes all regular expression metacharacters in the input string.

### Encoding/Decoding

- **`b64enc`**: Encodes a string to Base64.
- **`b64dec`**: Decodes a Base64 string.
- **`b32enc`**: Encodes a string to Base32.
- **`b32dec`**: Decodes a Base32 string.
