[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / HoursOfOperationProps

# Interface: HoursOfOperationProps

Properties for creating an Amazon Connect Hours of Operation resource

## Properties

### config

> `readonly` **config**: [`HoursOfOperationConfig`](HoursOfOperationConfig.md)[]

The configuration for the hours of operation

#### Required

yes

#### Default

```ts
- no default
```

***

### description?

> `readonly` `optional` **description**: `string`

The description of the hours of operation

#### Required

no

#### Default

```ts
- no description
```

***

### instance

> `readonly` **instance**: [`IInstance`](IInstance.md)

The Amazon Connect instance

#### Required

yes

#### Default

```ts
- no default
```

***

### name

> `readonly` **name**: `string`

The name of the hours of operation

#### Required

yes

#### Default

```ts
- no default
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the hours of operation resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```

***

### timeZone

> `readonly` **timeZone**: `string`

The time zone identifier (e.g., "America/New_York")
Must be a valid IANA time zone name

#### Required

yes

#### Default

```ts
- no default
```
