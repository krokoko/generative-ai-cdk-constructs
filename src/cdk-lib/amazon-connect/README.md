# Amazon Connect Construct Library

<!--BEGIN STABILITY BANNER-->

---

![Stability: Experimental](https://img.shields.io/badge/stability-Experimental-important.svg?style=for-the-badge)

> All classes are under active development and subject to non-backward compatible changes or removal in any
> future version. These are not subject to the [Semantic Versioning](https://semver.org/) model.
> This means that while you may use them, you may need to update your source code when upgrading to a newer version of this package.

---

<!--END STABILITY BANNER-->

| **Language**                                                                                   | **Package**                             |
| :--------------------------------------------------------------------------------------------- | --------------------------------------- |
| ![Typescript Logo](https://docs.aws.amazon.com/cdk/api/latest/img/typescript32.png) TypeScript | `@cdklabs/generative-ai-cdk-constructs` |
| ![Python Logo](https://docs.aws.amazon.com/cdk/api/latest/img/python32.png) Python             | `cdklabs.generative_ai_cdk_constructs`  |
| ![Java Logo](https://docs.aws.amazon.com/cdk/api/latest/img/java32.png) Java                   | `io.github.cdklabs.generative_ai_cdk_constructs`|
| ![.Net](https://docs.aws.amazon.com/cdk/api/latest/img/dotnet32.png) .Net                   | `CdkLabs.GenerativeAICdkConstructs`|
| ![Go](https://docs.aws.amazon.com/cdk/api/latest/img/go32.png) Go                   | `github.com/cdklabs/generative-ai-cdk-constructs-go/generative-ai-cdk-constructs`|

Amazon Connect is a contact center as a service (CCaaS) solution that offers easy, self-service configuration and enables dynamic, personal, and natural customer engagement at any scale.

This construct library facilitates the deployment of Amazon Connect resources through a higher level, L2 set of constructs. It leverages underlying CloudFormation L1 resources to provision these Connect features.

For additional information about Amazon Connect, please refer to the [get started with Amazon Connect](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-get-started.html) guide.

## Table of Contents

- [Instance](#instance)
    - [Instance Properties](#instance-properties)
    - [Basic instance creation](#basic-instance-creation)
    - [Identity Management](#identity-management)
    - [Instance Attributes](#instance-attributes)

## Instance

To get started, you create an [Amazon Connect instance](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html), which is your a virtual contact center. Each instance contains all the resources and settings related to your contact center. This construct initiates an Amazon Connect instance with all the supported channels enabled. It does not attach any storage, such as Amazon Simple Storage Service (Amazon S3) or Amazon Kinesis.

Amazon Connect enforces a limit on the total number of instances that you can create or delete in 30 days. If you exceed this limit, you will get an error message indicating there has been an excessive number of attempts at creating or deleting instances. You must wait 30 days before you can restart creating and deleting instances in your account.

By default when you create an Amazon Connect instance, Next Generation Amazon Connect is enabled. Next Generation Amazon Connect is an AI-powered contact center solution that turns every customer touchpoint into a deeper relationship and better outcome. It's pricing model includes unlimited AI features in Amazon Connect. It's an all-inclusive channel pricing model that covers all optimization features for usage on your platform.

After you initially create your Amazon Connect instance, you can choose to disable this option and instead pay separately for channels and any optimization features you choose to use. For more information, see [Enable Next Generation Amazon Connect](https://docs.aws.amazon.com/connect/latest/adminguide/enable-nextgeneration-amazonconnect.html).

### Instance properties

| Name | Type | Required | Description |
|---|---|---|---|
| `attributes` | `InstanceSettings` | No | The attributes of the instance. Defaults to enable all options. |
| `identityManagement` | `IdentityManagement` | No | The identity management type. Defaults to managed by Amazon Connect. |
| `tags` | `{ [key: string]: string }` | No | Tags to apply to the instance resource. |

### Basic instance creation

By default, if not provided, the construct will enable all attributes and set Amazon Connect for identity management. For more details, please refer to the sections below.

```typescript fixture=default-connect
// Create a basic browser with public network access
const connectInstance = new genaicdk.amazonconnect.Instance(this, "MyBrowser", {});
```

### Identity Management

Before you set up your Amazon Connect instance, you should decide how you want to manage your Amazon Connect users. A user is anyone who needs an Amazon Connect account: agents, call center managers, analysts, and more.

You cannot change the option you select for identity management after you create an instance. Instead, you must delete the instance and create a new one. However, if you delete an instance, you lose its configuration settings and metrics data.

When you create your instance, you can choose from one of the following identity management solutions:

- Store users with Amazon Connect (`IdentityManagement.fromManaged()`)

Choose this option if you want to create and manage user accounts within Amazon Connect.

When you manage users in Amazon Connect, the user name and password for each user is specific to Amazon Connect. Users must remember a separate user name and password to log in to Amazon Connect.

```typescript fixture=default-connect
// Create a basic browser with public network access
const connectInstance = new genaicdk.amazonconnect.Instance(this, "MyBrowser", {
    identityManagement: genaicdk.amazonconnect.IdentityManagement.fromManaged()
});
```

You can optionally provide an instance alias to the `fromManaged()` method. By default, the construct will generate an alias for you.

- Link to an existing directory (`IdentityManagement.existingDirectory(directoryId: string)`)

Choose this option to use an existing Active Directory. Users will log in to Amazon Connect using their corporate credentials.

If you choose this option, the directory must be associated with your account, set up in AWS Directory Service, and be active in the same Region in which you create your instance. If you plan to choose this option, you should prepare your directory before you create your Amazon Connect instance. For more information, see [Use an existing directory for identity management in Amazon Connect](https://docs.aws.amazon.com/connect/latest/adminguide/directory-service.html).

```typescript fixture=default-connect
// Create a basic browser with public network access
const connectInstance = new genaicdk.amazonconnect.Instance(this, "MyBrowser", {
    identityManagement: genaicdk.amazonconnect.IdentityManagement.fromExistingDirectory('existingDirectoryId')
});
```

- SAML 2.0-based authentication (`IdentityManagement.fromSAML()`)

Choose this option if you want to use your existing network identity provider to federate users with Amazon Connect. Users can only log in to Amazon Connect by using the link configured through your identity provider. If you plan to choose this option, you should configure your environment for SAML before you create your Amazon Connect instance. For more information, see [Configure SAML with IAM for Amazon Connect](https://docs.aws.amazon.com/connect/latest/adminguide/configure-saml.html).

```typescript fixture=default-connect
// Create a basic browser with public network access
const connectInstance = new genaicdk.amazonconnect.Instance(this, "MyBrowser", {
    identityManagement: genaicdk.amazonconnect.IdentityManagement.fromSAML()
});
```

You can optionally provide an instance alias to the `fromSAML()` method. By default, the construct will generate an alias for you.

### Instance Attributes

Amazon Connect instance attributes are settings that control various features and functionalities at the instance level of your Amazon Connect contact center. These attributes are distinct from "contact attributes," which are dynamic key-value pairs associated with individual contacts or calls.

- Inbound Calls Enabled: Determines whether your Amazon Connect instance can receive incoming calls.
- Outbound Calls Enabled: Determines whether your Amazon Connect instance can make outgoing calls.
- Contact Flow Logs Enabled: Controls whether logs for contact flow execution are generated.
- Contact Lens Enabled: Activates Amazon Contact Lens for conversational analytics, enabling features like sentiment analysis and call summarization.
- Auto Resolve Best Voices Enabled: Specifies whether Amazon Connect automatically selects the best voice for text-to-speech (TTS) based on the language.
- Early Media Enabled: Controls whether early media (e.g., ringtones or announcements before the call connects) is enabled for outbound calls.
- Multi-Party Conference Enabled: Determines if multi-party conferencing is allowed within the instance.
- High Volume Outbound: Enables features designed for high-volume outbound campaigns.
- Enhanced Contact Monitoring: Provides advanced monitoring capabilities for contact interactions.
- Enhanced Chat Monitoring: Offers enhanced monitoring for chat interactions.
- Multi-Party Chat Conference: Enables multi-party chat conferencing within the instance.
