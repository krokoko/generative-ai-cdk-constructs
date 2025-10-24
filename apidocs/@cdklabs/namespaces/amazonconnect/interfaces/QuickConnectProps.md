[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / QuickConnectProps

# Interface: QuickConnectProps

Properties for creating an Amazon Connect Quick Connect resource

## Properties

### description?

> `readonly` `optional` **description**: `string`

The description of the quick connect

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

The name of the quick connect

#### Required

yes

#### Default

```ts
- no default
```

***

### quickConnectConfig

> `readonly` **quickConnectConfig**: [`QuickConnectConfig`](QuickConnectConfig.md)

The quick connect configuration

#### Required

yes

#### Default

```ts
- no default
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the quick connect resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```
