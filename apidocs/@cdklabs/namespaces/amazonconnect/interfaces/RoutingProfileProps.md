[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / RoutingProfileProps

# Interface: RoutingProfileProps

Properties for creating an Amazon Connect Routing Profile resource

## Properties

### agentAvailabilityTimer?

> `readonly` `optional` **agentAvailabilityTimer**: [`AgentAvailabilityTimer`](../enumerations/AgentAvailabilityTimer.md)

The agent availability timer

#### Required

no

#### Default

```ts
- TIME_SINCE_LAST_ACTIVITY
```

***

### defaultOutboundQueue

> `readonly` **defaultOutboundQueue**: [`IQueue`](IQueue.md)

The default outbound queue

#### Required

yes

#### Default

```ts
- no default
```

***

### description

> `readonly` **description**: `string`

The description of the routing profile

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

### mediaConcurrencies

> `readonly` **mediaConcurrencies**: [`MediaConcurrency`](MediaConcurrency.md)[]

The media concurrency configuration
At least one channel must be configured

#### Required

yes

#### Default

```ts
- no default
```

***

### name

> `readonly` **name**: `string`

The name of the routing profile

#### Required

yes

#### Default

```ts
- no default
```

***

### queueConfigs?

> `readonly` `optional` **queueConfigs**: [`RoutingProfileQueueConfig`](RoutingProfileQueueConfig.md)[]

The queue configurations

#### Required

no

#### Default

```ts
- no queue configs
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the routing profile resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```
