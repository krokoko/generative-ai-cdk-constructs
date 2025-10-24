[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / MediaConcurrency

# Interface: MediaConcurrency

Media concurrency configuration

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

### concurrency

> `readonly` **concurrency**: `number`

The number of concurrent contacts
VOICE must be 1, CHAT and TASK can be 1-10

#### Required

yes

#### Default

```ts
- no default
```

***

### crossChannelBehavior?

> `readonly` `optional` **crossChannelBehavior**: `any`

Cross-channel behavior (advanced configuration)

#### Required

no

#### Default

```ts
- no cross-channel behavior
```
