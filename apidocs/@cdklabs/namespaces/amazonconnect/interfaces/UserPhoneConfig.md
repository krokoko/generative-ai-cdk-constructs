[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / UserPhoneConfig

# Interface: UserPhoneConfig

User phone configuration

## Properties

### afterContactWorkTimeLimit?

> `readonly` `optional` **afterContactWorkTimeLimit**: `number`

After contact work time limit in seconds

#### Required

no

#### Default

```ts
- no limit
```

***

### autoAccept?

> `readonly` `optional` **autoAccept**: `boolean`

Auto-accept calls

#### Required

no

#### Default

```ts
- false
```

***

### deskPhoneNumber?

> `readonly` `optional` **deskPhoneNumber**: `string`

Desk phone number (required if phoneType is DESK_PHONE)
Must be in E.164 format

#### Required

conditional

#### Default

```ts
- no default
```

***

### phoneType

> `readonly` **phoneType**: [`PhoneType`](../enumerations/PhoneType.md)

The phone type

#### Required

yes

#### Default

```ts
- no default
```
