# json-schema-utils

![](https://img.shields.io/npm/v/@bizone-ai/json-schema-utils.svg)
[![Build](https://github.com/bizone-ai/json-schema-utils/actions/workflows/pr-tests.yml/badge.svg)](https://github.com/bizone-ai/json-schema-utils/actions/workflows/pr-tests.yml)

Various utilities for handling JSON Schemas (parse, join, generate, samples)

# Installation

`npm install @bizone-ai/json-schema-utils`

# API

```typescript
JSONSchemaUtils: {
    join: (pathsDescriptors: { targetPath: string; type: TypeSchema; }[], options?: JoinOptions) => TypeSchema;
    parse: (schema: TypeSchema, options?: ParsingOptions) => ParsedSchema;
    generate: (value: any, options?: GenerateSchemaOptions) => TypeSchema;
};

```

# License
[MIT](./LICENSE)
