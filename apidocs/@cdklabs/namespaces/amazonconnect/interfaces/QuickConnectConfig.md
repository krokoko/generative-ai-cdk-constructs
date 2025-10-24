[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / QuickConnectConfig

# Interface: QuickConnectConfig

Quick connect configuration

## Properties

### phoneConfig?

> `readonly` `optional` **phoneConfig**: [`PhoneNumberQuickConnectConfig`](PhoneNumberQuickConnectConfig.md)

Phone number configuration (required if type is PHONE_NUMBER)

#### Required

conditional

#### Default

```ts
- no default
```

***

### queueConfig?

> `readonly` `optional` **queueConfig**: [`QueueQuickConnectConfig`](QueueQuickConnectConfig.md)

Queue configuration (required if type is QUEUE)

#### Required

conditional

#### Default

```ts
- no default
```

***

### quickConnectType

> `readonly` **quickConnectType**: [`QuickConnectType`](../enumerations/QuickConnectType.md)

The type of quick connect

#### Required

yes

#### Default

```ts
- no default
```

***

### userConfig?

> `readonly` `optional` **userConfig**: [`UserQuickConnectConfig`](UserQuickConnectConfig.md)

User configuration (required if type is USER)

#### Required

conditional

#### Default

```ts
- no default
```
