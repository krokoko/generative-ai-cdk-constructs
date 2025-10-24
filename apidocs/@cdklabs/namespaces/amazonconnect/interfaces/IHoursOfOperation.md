[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / IHoursOfOperation

# Interface: IHoursOfOperation

Interface for Amazon Connect Hours of Operation resources

## Extends

- `IResource`

## Properties

### env

> `readonly` **env**: `ResourceEnvironment`

The environment this resource belongs to.
For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

#### Inherited from

`IResource.env`

***

### hoursOfOperationArn

> `readonly` **hoursOfOperationArn**: `string`

The ARN of the hours of operation resource

#### Attribute

***

### hoursOfOperationName

> `readonly` **hoursOfOperationName**: `string`

The name of the hours of operation

#### Attribute

***

### node

> `readonly` **node**: `Node`

The tree node.

#### Inherited from

`IResource.node`

***

### stack

> `readonly` **stack**: `Stack`

The stack in which this resource is defined.

#### Inherited from

`IResource.stack`

## Methods

### applyRemovalPolicy()

> **applyRemovalPolicy**(`policy`): `void`

Apply the given removal policy to this resource

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

#### Parameters

##### policy

`RemovalPolicy`

#### Returns

`void`

#### Inherited from

`IResource.applyRemovalPolicy`

***

### grant()

> **grant**(`grantee`, ...`actions`): `Grant`

Grant the given principal identity permissions to perform actions on this hours of operation.

#### Parameters

##### grantee

`IGrantable`

##### actions

...`string`[]

#### Returns

`Grant`
