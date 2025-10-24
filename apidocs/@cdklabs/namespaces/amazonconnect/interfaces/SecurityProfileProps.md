[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / SecurityProfileProps

# Interface: SecurityProfileProps

Properties for creating an Amazon Connect Security Profile resource

## Properties

### description?

> `readonly` `optional` **description**: `string`

The description of the security profile

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

### permissions?

> `readonly` `optional` **permissions**: `string`[]

The list of permissions assigned to the security profile
Maximum 500 permissions

#### Required

no

#### Default

```ts
- no permissions
```

***

### securityProfileName

> `readonly` **securityProfileName**: `string`

The name of the security profile
Pattern: ^[ a-zA-Z0-9_@-]+$

#### Required

yes

#### Default

```ts
- no default
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the security profile resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```
