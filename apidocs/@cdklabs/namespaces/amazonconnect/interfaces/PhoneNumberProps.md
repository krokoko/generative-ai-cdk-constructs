[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / PhoneNumberProps

# Interface: PhoneNumberProps

Properties for creating an Amazon Connect Phone Number resource

## Properties

### countryCode?

> `readonly` `optional` **countryCode**: `string`

The ISO country code (2 letters)
Required if not importing a phone number

#### Required

conditional

#### Default

```ts
- no default
```

***

### description?

> `readonly` `optional` **description**: `string`

The description of the phone number

#### Required

no

#### Default

```ts
- no description
```

***

### prefix?

> `readonly` `optional` **prefix**: `string`

The phone number prefix (includes + and country code)

#### Required

no

#### Default

```ts
- no prefix
```

***

### sourcePhoneNumberArn?

> `readonly` `optional` **sourcePhoneNumberArn**: `string`

The ARN of a phone number to import
Use this to import an existing phone number

#### Required

conditional

#### Default

```ts
- no default
```

***

### tags?

> `readonly` `optional` **tags**: `object`

Tags to apply to the phone number resource

#### Index Signature

\[`key`: `string`\]: `string`

#### Required

no

#### Default

```ts
- no tags
```

***

### targetArn

> `readonly` **targetArn**: `string`

The Amazon Connect instance or traffic distribution group ARN

#### Required

yes

#### Default

```ts
- no default
```

***

### type?

> `readonly` `optional` **type**: [`PhoneNumberType`](../enumerations/PhoneNumberType.md)

The type of phone number
Required if not importing a phone number

#### Required

conditional

#### Default

```ts
- no default
```
