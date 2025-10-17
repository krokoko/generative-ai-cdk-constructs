[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / IdentityManagement

# Class: IdentityManagement

Interface for the identity management configuration.

## Properties

### directoryId?

> `readonly` `optional` **directoryId**: `string`

The identifier for the directory.

#### Required

yes

#### Default

```ts
- no directory id
```

***

### identityManagementType

> `readonly` **identityManagementType**: `string`

The type of identity management for the instance.

#### Required

yes

#### Default

```ts
- no identity management type
```

***

### instanceAlias?

> `readonly` `optional` **instanceAlias**: `string`

Create a custom URL. Use this URL to log into this instance of Amazon Connect.

#### Required

no

#### Default

```ts
- no alias
```

## Methods

### fromExistingDirectory()

> `static` **fromExistingDirectory**(`directoryId`): `IdentityManagement`

Amazon Connect uses an existing directory. You create users in the directory, and
then add and configure them in Amazon Connect. You can only associate a directory with only one Amazon Connect instance.

#### Parameters

##### directoryId

`string`

The identifier for the directory.

#### Returns

`IdentityManagement`

An IdentityManagement object.

***

### fromManaged()

> `static` **fromManaged**(`instanceAlias?`): `IdentityManagement`

Create and manage users in Amazon Connect. You cannot share users with other applications.

#### Parameters

##### instanceAlias?

`string`

The alias for the instance. If not provided, a random alias will be generated.

#### Returns

`IdentityManagement`

An IdentityManagement object.

***

### fromSAML()

> `static` **fromSAML**(`instanceAlias?`): `IdentityManagement`

AWS supports identity federation with Security Assertion Markup Language (SAML 2.0). This feature enables single sign-on (SSO) so
users can log into the AWS Management Console or call the AWS APIs without you having to create an IAM user for everyone in your organization.

#### Parameters

##### instanceAlias?

`string`

The alias for the instance. If not provided, a random alias will be generated.

#### Returns

`IdentityManagement`

An IdentityManagement object.
