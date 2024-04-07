# json-schema-utils

![](https://img.shields.io/npm/v/@nlighten/json-schema-utils.svg)
[![Build](https://github.com/nlighten-oss/json-schema-utils/actions/workflows/pr-tests.yml/badge.svg)](https://github.com/nlighten-oss/json-schema-utils/actions/workflows/pr-tests.yml)

Various utilities for handling JSON Schemas (parse, join, generate, samples)

# Installation

`npm install @nlighten/json-schema-utils`

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
