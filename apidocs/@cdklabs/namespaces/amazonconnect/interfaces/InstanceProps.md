[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / InstanceProps

# Interface: InstanceProps

Properties for creating a Amazon Connect Instance resource

## Properties

### attributes?

> `readonly` `optional` **attributes**: [`InstanceSettings`](InstanceSettings.md)

A toggle for an individual feature at the instance level.

#### Required

no

#### Default

```ts
- all true
```

***

### identityManagement?

> `readonly` `optional` **identityManagement**: [`IdentityManagement`](../classes/IdentityManagement.md)

The identity management for the instance.

#### Required

yes

#### Default

```ts
- managed by Amazon Connect
```

***

### tags?

> `readonly` `optional` **tags**: `object`

A list of key:value pairs of tags to apply to this instance resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Default

```ts
{} no tags
```

#### Required

no
