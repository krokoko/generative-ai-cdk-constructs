[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / UserProps

# Interface: UserProps

Properties for creating an Amazon Connect User resource

## Properties

### directoryUserId?

> `readonly` `optional` **directoryUserId**: `string`

The directory user ID

#### Required

no

#### Default

```ts
- no directory user ID
```

***

### hierarchyGroup?

> `readonly` `optional` **hierarchyGroup**: [`IUserHierarchyGroup`](IUserHierarchyGroup.md)

The hierarchy group

#### Required

no

#### Default

```ts
- no hierarchy group
```

***

### identityInfo?

> `readonly` `optional` **identityInfo**: [`UserIdentityInfo`](UserIdentityInfo.md)

The identity information

#### Required

no

#### Default

```ts
- no identity info
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

### password?

> `readonly` `optional` **password**: `string`

The password (8-64 characters, must include uppercase, lowercase, number)

#### Required

no

#### Default

```ts
- no password
```

***

### phoneConfig

> `readonly` **phoneConfig**: [`UserPhoneConfig`](UserPhoneConfig.md)

The phone configuration

#### Required

yes

#### Default

```ts
- no default
```

***

### routingProfile

> `readonly` **routingProfile**: [`IRoutingProfile`](IRoutingProfile.md)

The routing profile

#### Required

yes

#### Default

```ts
- no default
```

***

### securityProfiles

> `readonly` **securityProfiles**: [`ISecurityProfile`](ISecurityProfile.md)[]

The security profiles (1-10 profiles)

#### Required

yes

#### Default

```ts
- no default
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the user resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```

***

### username

> `readonly` **username**: `string`

The username for the user
Pattern: [a-zA-Z0-9\_\-\.@]+

#### Required

yes

#### Default

```ts
- no default
```
