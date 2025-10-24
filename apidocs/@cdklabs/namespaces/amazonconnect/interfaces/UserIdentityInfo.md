[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / UserIdentityInfo

# Interface: UserIdentityInfo

User identity information

## Properties

### email?

> `readonly` `optional` **email**: `string`

Email (cannot be used with SAML)

#### Required

no

#### Default

```ts
- no default
```

***

### firstName?

> `readonly` `optional` **firstName**: `string`

First name (required for SAML)

#### Required

conditional

#### Default

```ts
- no default
```

***

### lastName?

> `readonly` `optional` **lastName**: `string`

Last name (required for SAML)

#### Required

conditional

#### Default

```ts
- no default
```

***

### mobile?

> `readonly` `optional` **mobile**: `string`

Mobile phone number (E.164 format)

#### Required

no

#### Default

```ts
- no default
```

***

### secondaryEmail?

> `readonly` `optional` **secondaryEmail**: `string`

Secondary email

#### Required

no

#### Default

```ts
- no default
```
