[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / UserHierarchyGroupProps

# Interface: UserHierarchyGroupProps

Properties for creating an Amazon Connect User Hierarchy Group resource

## Properties

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

The name of the user hierarchy group

#### Required

yes

#### Default

```ts
- no default
```

***

### parentGroup?

> `readonly` `optional` **parentGroup**: [`IUserHierarchyGroup`](IUserHierarchyGroup.md)

The parent hierarchy group

#### Required

no

#### Default

```ts
- no parent (root level)
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the user hierarchy group resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```
