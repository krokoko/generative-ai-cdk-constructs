[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / RoutingProfileQueueConfig

# Interface: RoutingProfileQueueConfig

Routing profile queue configuration

## Properties

### channel

> `readonly` **channel**: [`Channel`](../enumerations/Channel.md)

The channel type

#### Required

yes

#### Default

```ts
- no default
```

***

### delay?

> `readonly` `optional` **delay**: `number`

The delay in seconds before routing to this queue

#### Required

no

#### Default

```ts
- no delay
```

***

### priority?

> `readonly` `optional` **priority**: `number`

The priority of the queue (lower numbers = higher priority)

#### Required

no

#### Default

```ts
- no priority
```

***

### queue

> `readonly` **queue**: [`IQueue`](IQueue.md)

The queue

#### Required

yes

#### Default

```ts
- no default
```
