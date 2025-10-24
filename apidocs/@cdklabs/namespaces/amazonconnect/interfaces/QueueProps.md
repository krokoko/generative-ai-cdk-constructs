[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / QueueProps

# Interface: QueueProps

Properties for creating an Amazon Connect Queue resource

## Properties

### description?

> `readonly` `optional` **description**: `string`

The description of the queue

#### Required

no

#### Default

```ts
- no description
```

***

### hoursOfOperation

> `readonly` **hoursOfOperation**: [`IHoursOfOperation`](IHoursOfOperation.md)

The hours of operation for the queue

#### Required

yes

#### Default

```ts
- no default
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

### maxContacts?

> `readonly` `optional` **maxContacts**: `number`

The maximum number of contacts that can be in the queue before it is considered full

#### Required

no

#### Default

```ts
- no limit (0)
```

***

### name

> `readonly` **name**: `string`

The name of the queue

#### Required

yes

#### Default

```ts
- no default
```

***

### outboundCallerConfig?

> `readonly` `optional` **outboundCallerConfig**: [`OutboundCallerConfig`](OutboundCallerConfig.md)

The outbound caller ID configuration

#### Required

no

#### Default

```ts
- no outbound caller configuration
```

***

### status?

> `readonly` `optional` **status**: [`QueueStatus`](../enumerations/QueueStatus.md)

The status of the queue

#### Required

no

#### Default

```ts
- ENABLED
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the queue resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```
