[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / ContactFlowProps

# Interface: ContactFlowProps

Properties for creating an Amazon Connect Contact Flow resource

## Properties

### content

> `readonly` **content**: `string`

The content of the contact flow (JSON definition)

#### Required

yes

#### Default

```ts
- no default
```

***

### description?

> `readonly` `optional` **description**: `string`

The description of the contact flow

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

The name of the contact flow

#### Required

yes

#### Default

```ts
- no default
```

***

### state?

> `readonly` `optional` **state**: [`ContactFlowState`](../enumerations/ContactFlowState.md)

The state of the contact flow

#### Required

no

#### Default

```ts
- ACTIVE
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the contact flow resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```

***

### type

> `readonly` **type**: [`ContactFlowType`](../enumerations/ContactFlowType.md)

The type of contact flow

#### Required

yes

#### Default

```ts
- no default
```
