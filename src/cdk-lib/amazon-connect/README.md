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

* [Instance](#instance)
* [Hours of Operation](#hours-of-operation)
* [Security Profile](#security-profile)
* [Routing Profile](#routing-profile)
* [Queue](#queue)
* [User](#user)
* [Contact Flow](#contact-flow)
* [Phone Number](#phone-number)
* [Quick Connect](#quick-connect)
* [User Hierarchy Group](#user-hierarchy-group)

---

## Instance

To get started, you create an [Amazon Connect instance](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html), which is a virtual contact center. Each instance contains all the resources and settings related to your contact center. This construct initiates an Amazon Connect instance with all the supported channels enabled. It does not attach any storage, such as Amazon Simple Storage Service (Amazon S3) or Amazon Kinesis.

Amazon Connect enforces a limit on the total number of instances that you can create or delete in 30 days. If you exceed this limit, you will get an error message indicating there has been an excessive number of attempts at creating or deleting instances. You must wait 30 days before you can restart creating and deleting instances in your account.

By default when you create an Amazon Connect instance, Next Generation Amazon Connect is enabled. Next Generation Amazon Connect is an AI-powered contact center solution that turns every customer touchpoint into a deeper relationship and better outcome. It's pricing model includes unlimited AI features in Amazon Connect. It's an all-inclusive channel pricing model that covers all optimization features for usage on your platform.

After you initially create your Amazon Connect instance, you can choose to disable this option and instead pay separately for channels and any optimization features you choose to use. For more information, see [Enable Next Generation Amazon Connect](https://docs.aws.amazon.com/connect/latest/adminguide/enable-nextgeneration-amazonconnect.html).

### Instance Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `attributes` | `InstanceSettings` | No | The attributes of the instance. Defaults to enable all options. |
| `identityManagement` | `IdentityManagement` | No | The identity management type. Defaults to managed by Amazon Connect. |
| `tags` | `{ [key: string]: string }` | No | Tags to apply to the instance resource. |

### Basic Instance Creation

By default, if not provided, the construct will enable all attributes and set Amazon Connect for identity management. For more details, please refer to the sections below.

```typescript fixture=default-connect
// Create a basic instance with default settings
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
```

### Instance with Identity Management

Before you set up your Amazon Connect instance, you should decide how you want to manage your Amazon Connect users. A user is anyone who needs an Amazon Connect account: agents, call center managers, analysts, and more.

You cannot change the option you select for identity management after you create an instance. Instead, you must delete the instance and create a new one. However, if you delete an instance, you lose its configuration settings and metrics data.

When you create your instance, you can choose from one of the following identity management solutions:

- Store users with Amazon Connect (`IdentityManagement.fromManaged()`)

Choose this option if you want to create and manage user accounts within Amazon Connect.

When you manage users in Amazon Connect, the user name and password for each user is specific to Amazon Connect. Users must remember a separate user name and password to log in to Amazon Connect.

```typescript fixture=default-connect
// Create instance with SAML authentication
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {
  identityManagement: genaicdk.amazonconnect.IdentityManagement.fromSAML("mycompany-connect")
});
```

### Import Existing Instance

```typescript fixture=default-connect
const instance = genaicdk.amazonconnect.Instance.fromInstanceAttributes(this, "ImportedInstance", {
  instanceArn: "arn:aws:connect:us-east-1:123456789012:instance/12345678-1234-1234-1234-123456789012",
  serviceRoleArn: "arn:aws:iam::123456789012:role/ConnectServiceRole",
});
```

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

---

## Hours of Operation

[Hours of Operation](https://docs.aws.amazon.com/connect/latest/adminguide/set-hours-operation.html) define when your contact center is open for business. They specify the days and times when your agents are available to handle customer contacts. When customers call outside of your hours of operation, they can be routed to a different contact flow that plays a message indicating your business is closed.

Hours of operation are used by queues to determine when contacts should be handled. You can configure different hours for different queues, allowing you to have specialized hours for different types of customer service. For example, you might have standard business hours for general inquiries but extended hours for premium support customers.

Each hours of operation configuration requires a time zone specification using IANA time zone identifiers (e.g., "America/New_York", "Europe/London"). You can define operating hours for each day of the week, specifying start and end times. Days without specified hours are considered closed.

### HoursOfOperation Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Name of the hours of operation (1-127 characters) |
| `timeZone` | `string` | Yes | IANA time zone identifier (e.g., "America/New_York") |
| `config` | `HoursOfOperationConfig[]` | Yes | Daily schedule configuration |
| `description` | `string` | No | Description (1-250 characters) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic Hours of Operation

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const businessHours = new genaicdk.amazonconnect.HoursOfOperation(this, "BusinessHours", {
  instance: instance,
  name: "BusinessHours",
  description: "Standard business hours",
  timeZone: "America/New_York",
  config: [
    {
      day: genaicdk.amazonconnect.DayOfWeek.MONDAY,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 17, minutes: 0 },
    },
    {
      day: genaicdk.amazonconnect.DayOfWeek.TUESDAY,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 17, minutes: 0 },
    },
  ],
});
```

---

## Security Profile

[Security Profiles](https://docs.aws.amazon.com/connect/latest/adminguide/connect-security-profiles.html) control what users can do and see in Amazon Connect. They define permissions that determine which features, pages, and data users can access in the Amazon Connect admin website and Contact Control Panel (CCP). Think of security profiles as roles that you assign to users.

Amazon Connect includes several predefined security profiles that are designed for common roles in contact centers, such as Agent, CallCenterManager, and Admin. However, you can create custom security profiles to meet your organization's specific security requirements.

Each security profile contains a set of permissions that control access to various Amazon Connect features. For example, a security profile might allow users to view real-time metrics but not change routing profiles, or it might allow access to call recordings but not to customer payment information.

When you create users in Amazon Connect, you must assign at least one security profile to each user. Users can have multiple security profiles, and they receive all permissions from all assigned profiles. You can modify security profiles at any time, and changes take effect immediately for all users assigned to that profile.

### SecurityProfile Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `securityProfileName` | `string` | Yes | Security profile name (1-127 characters) |
| `description` | `string` | No | Profile description (0-250 characters) |
| `permissions` | `string[]` | No | Permission strings (max 500) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic Security Profile

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const agentProfile = new genaicdk.amazonconnect.SecurityProfile(this, "AgentProfile", {
  instance: instance,
  securityProfileName: "AgentProfile",
  description: "Basic agent permissions",
  permissions: [
    "BasicAgentAccess",
    "OutboundCallAccess",
  ],
});
```

---

## Routing Profile

[Routing Profiles](https://docs.aws.amazon.com/connect/latest/adminguide/routing-profiles.html) determine which queues agents handle and how many contacts they can handle simultaneously across channels. They are a critical component in routing customer contacts to the right agents at the right time.

A routing profile links queues to agents and defines how contacts are distributed among available agents. Each routing profile specifies:

- **Media Concurrency**: How many concurrent contacts an agent can handle for each channel (voice, chat, task, email). For voice, agents can only handle one call at a time, but for chat, agents typically handle multiple conversations simultaneously.

- **Queue Associations**: Which queues the agent can receive contacts from. You can assign multiple queues to a routing profile and set priorities and delays for each queue. This allows you to control which contacts agents handle first.

- **Default Outbound Queue**: The queue used when agents make outbound calls. This ensures proper tracking and reporting for outbound contacts.

When a contact arrives in a queue, Amazon Connect looks for available agents who have a routing profile associated with that queue. The routing profile's concurrency settings determine if the agent can accept the contact based on their current workload. For example, an agent might be handling three chat conversations (if their routing profile allows concurrency of 3 for chat) while simultaneously being unavailable for voice calls (voice concurrency is always 1).

Routing profiles also support queue prioritization and delay configuration. Priority (1-99, where 1 is highest) determines the order in which contacts from different queues are routed to agents. Delay specifies how long to wait before routing contacts from a particular queue to an agent.

### RoutingProfile Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Routing profile name (1-127 characters) |
| `description` | `string` | Yes | Profile description (1-250 characters) |
| `defaultOutboundQueue` | `IQueue` | Yes | Default outbound queue |
| `mediaConcurrencies` | `MediaConcurrency[]` | Yes | Channel concurrency settings |
| `queueConfigs` | `RoutingProfileQueueConfig[]` | No | Queue configurations |
| `agentAvailabilityTimer` | `AgentAvailabilityTimer` | No | Availability calculation method |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic Routing Profile

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const hours = new genaicdk.amazonconnect.HoursOfOperation(this, "Hours", {
  instance: instance,
  name: "Hours",
  timeZone: "UTC",
  config: [],
});
const queue = new genaicdk.amazonconnect.Queue(this, "BasicQueue", {
  instance: instance,
  name: "BasicQueue",
  hoursOfOperation: hours,
});

const routingProfile = new genaicdk.amazonconnect.RoutingProfile(this, "BasicRP", {
  instance: instance,
  name: "BasicRoutingProfile",
  description: "Basic routing profile",
  defaultOutboundQueue: queue,
  mediaConcurrencies: [
    {
      channel: genaicdk.amazonconnect.Channel.VOICE,
      concurrency: 1,
    },
    {
      channel: genaicdk.amazonconnect.Channel.CHAT,
      concurrency: 3,
    },
  ],
});
```

---

## Queue

[Queues](https://docs.aws.amazon.com/connect/latest/adminguide/create-queue.html) hold contacts waiting to be answered by agents. When customers call, chat, or submit tasks to your contact center, they are placed in queues until an available agent with the appropriate routing profile can handle their request.

Queues are the fundamental organizing principle for contact routing in Amazon Connect. They act as waiting rooms where customer contacts are held and prioritized before being routed to agents. Each queue is associated with specific hours of operation, which determine when the queue is active and accepting contacts.

Key features of queues include:

- **Capacity Management**: You can set a maximum number of contacts that a queue can hold. When the queue reaches capacity, you can route overflow contacts to a different queue or play a message indicating high call volume.

- **Hours of Operation**: Each queue must be associated with hours of operation. When contacts arrive outside these hours, you can route them to a different contact flow that handles after-hours scenarios.

- **Outbound Caller Configuration**: For outbound calls, queues can specify the caller ID name and number that appears to customers, as well as whisper flows that play to agents before they're connected to customers.

- **Priority and Delay**: When used with routing profiles, you can configure how quickly contacts from this queue are routed to agents and in what order relative to other queues.

Queues work together with routing profiles to create sophisticated routing strategies. For example, you might create separate queues for different product lines, customer tiers (VIP vs. standard), or types of inquiries (sales vs. support). Agents are assigned to these queues through their routing profiles, allowing you to ensure customers reach agents with the right skills and expertise.

### Queue Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Queue name (1-127 characters) |
| `hoursOfOperation` | `IHoursOfOperation` | Yes | Operating hours |
| `description` | `string` | No | Queue description (1-250 characters) |
| `maxContacts` | `number` | No | Maximum contacts in queue (minimum 0) |
| `outboundCallerConfig` | `OutboundCallerConfig` | No | Outbound caller ID settings |
| `status` | `QueueStatus` | No | Queue status (ENABLED or DISABLED) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic Queue

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const hours = new genaicdk.amazonconnect.HoursOfOperation(this, "BusinessHours", {
  instance: instance,
  name: "BusinessHours",
  timeZone: "America/New_York",
  config: [],
});

const queue = new genaicdk.amazonconnect.Queue(this, "SupportQueue", {
  instance: instance,
  name: "SupportQueue",
  description: "Customer support queue",
  hoursOfOperation: hours,
  maxContacts: 100,
});
```

---

## User

[Users](https://docs.aws.amazon.com/connect/latest/adminguide/user-management.html) are agents, managers, and administrators who need access to Amazon Connect. Users represent the people who work in your contact center, from frontline agents who handle customer contacts to supervisors who monitor performance and administrators who configure the system.

Each user in Amazon Connect must be configured with several key components:

- **Routing Profile**: Determines which queues the user can handle contacts from and how many simultaneous contacts they can manage across different channels. This is required for all users who will handle customer contacts.

- **Security Profiles**: Control what the user can access and do within Amazon Connect. Users must have at least one security profile, and can have up to 10 profiles. The combination of all assigned profiles determines their effective permissions.

- **Phone Configuration**: Specifies how the user will handle voice calls. Users can be configured with a soft phone (browser-based), desk phone (physical phone), or no phone (for users who only need access to metrics and configuration).

- **Hierarchy Group**: Optionally organizes users into reporting structures. This is useful for creating organizational hierarchies that match your business structure and for generating reports by team or department.

User phone configurations support several important settings:

- **Auto-Accept**: When enabled, incoming calls are automatically answered for the agent. When disabled, agents must manually accept each call.
- **After Contact Work (ACW) Time Limit**: The maximum time (in seconds) an agent can spend on post-call work before they're automatically moved back to Available status.
- **Desk Phone Number**: For users with desk phones, this is the phone number Amazon Connect will call to connect the agent to customer calls.

When you create users, you must provide a unique username. Optionally, you can set an initial password, provide identity information (name, email, phone), and assign the user to a hierarchy group for reporting purposes.

### User Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `username` | `string` | Yes | User login name (1-64 characters) |
| `routingProfile` | `IRoutingProfile` | Yes | Routing profile |
| `securityProfiles` | `ISecurityProfile[]` | Yes | Security profiles (1-10 profiles) |
| `phoneConfig` | `UserPhoneConfig` | Yes | Phone configuration |
| `identityInfo` | `UserIdentityInfo` | No | Personal information |
| `password` | `string` | No | User password (8-64 characters) |
| `hierarchyGroup` | `IUserHierarchyGroup` | No | User hierarchy group |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic User with Soft Phone

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const hours = new genaicdk.amazonconnect.HoursOfOperation(this, "Hours", {
  instance: instance,
  name: "Hours",
  timeZone: "UTC",
  config: [],
});
const queue = new genaicdk.amazonconnect.Queue(this, "Queue", {
  instance: instance,
  name: "Queue",
  hoursOfOperation: hours,
});
const routingProfile = new genaicdk.amazonconnect.RoutingProfile(this, "RP", {
  instance: instance,
  name: "RP",
  description: "Routing Profile",
  defaultOutboundQueue: queue,
  mediaConcurrencies: [{ channel: genaicdk.amazonconnect.Channel.VOICE, concurrency: 1 }],
});
const securityProfile = new genaicdk.amazonconnect.SecurityProfile(this, "SP", {
  instance: instance,
  securityProfileName: "SP",
});

const agent = new genaicdk.amazonconnect.User(this, "Agent", {
  instance: instance,
  username: "john.doe",
  routingProfile: routingProfile,
  securityProfiles: [securityProfile],
  phoneConfig: {
    phoneType: genaicdk.amazonconnect.PhoneType.SOFT_PHONE,
    autoAccept: true,
    afterContactWorkTimeLimit: 120,
  },
  identityInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  },
});
```

---

## Contact Flow

[Contact Flows](https://docs.aws.amazon.com/connect/latest/adminguide/connect-contact-flows.html) define the customer experience when they interact with your contact center. They are interactive workflows that control how contacts are routed and handled from the moment they arrive until they're completed. Think of contact flows as the "logic" of your contact center.

Contact flows use a visual designer interface where you create workflows by connecting blocks that perform different actions. These blocks can:

- Play prompts or messages to customers
- Get customer input through DTMF (phone keypad) or voice
- Check business hours or queue status
- Route contacts to specific queues based on conditions
- Invoke AWS Lambda functions for dynamic logic
- Set contact attributes for personalization
- Transfer contacts to external phone numbers
- Record conversations
- Integrate with other AWS services

Amazon Connect supports multiple types of contact flows, each designed for specific purposes:

- **Contact Flow**: The main flow that handles incoming contacts. This is where you define your IVR (Interactive Voice Response) logic.
- **Customer Queue Flow**: Plays while customers wait in queue. Typically used for hold music and periodic updates about queue position.
- **Customer Hold Flow**: Plays when an agent places a customer on hold during a conversation.
- **Customer Whisper Flow**: Plays to customers before being connected to an agent.
- **Agent Whisper Flow**: Plays to agents before they're connected to a customer, typically providing context about the contact.
- **Outbound Whisper Flow**: Plays to agents before outbound calls are connected.
- **Agent Hold Flow**: Plays to agents when they place a customer on hold.
- **Transfer to Agent Flow**: Used when transferring contacts between agents.
- **Transfer to Queue Flow**: Used when transferring contacts between queues.

Contact flows are defined using JSON that describes the flow structure, blocks, and connections. The Amazon Connect console provides a visual editor, but for infrastructure-as-code deployments, you export the JSON definition and use it with this construct.

### ContactFlow Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Contact flow name (1-127 characters) |
| `content` | `string` | Yes | Flow definition JSON (1-256,000 characters) |
| `type` | `ContactFlowType` | Yes | Flow type |
| `description` | `string` | No | Flow description (max 500 characters) |
| `state` | `ContactFlowState` | No | Flow state (ACTIVE or ARCHIVED) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic Contact Flow

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const contactFlow = new genaicdk.amazonconnect.ContactFlow(this, "WelcomeFlow", {
  instance: instance,
  name: "WelcomeFlow",
  description: "Welcome message and routing",
  type: genaicdk.amazonconnect.ContactFlowType.CONTACT_FLOW,
  content: JSON.stringify({
    Version: "2019-10-30",
    StartAction: "12345678-1234-1234-1234-123456789012",
    Actions: [],
  }),
});
```

---

## Phone Number

[Phone Numbers](https://docs.aws.amazon.com/connect/latest/adminguide/contact-center-phone-number.html) are used for inbound and outbound calls. They serve as the entry points for customers to reach your contact center via phone. When you set up phone numbers, you associate them with contact flows that define how incoming calls are handled.

Amazon Connect supports several types of phone numbers to meet different business needs:

- **DID (Direct Inward Dialing)**: Standard local phone numbers that customers in specific geographic areas can call. These numbers are typically associated with a particular city or region.

- **Toll-Free Numbers**: Numbers that customers can call without incurring charges. The contact center pays for these calls. Common in North America (1-800, 1-888, etc.).

- **UIFN (Universal International Freephone Number)**: International toll-free numbers that allow customers to call from multiple countries using the same number.

- **Shared Numbers**: Phone numbers shared across multiple Amazon Connect instances, useful for organizations with distributed contact centers.

- **Third-Party Numbers**: Numbers that you port from another carrier or provider into Amazon Connect. Supports both DID and toll-free numbers.

- **Short Codes**: Short numeric codes (typically 5-6 digits) used primarily for SMS messaging.

You can either claim new phone numbers directly from Amazon Connect's available inventory or port existing numbers from other carriers. When claiming a new number, you specify:

- **Country Code**: The ISO country code (e.g., "US", "GB", "AU")
- **Phone Number Type**: The type of number you want (toll-free, DID, etc.)
- **Prefix** (optional): If you want a number with a specific prefix

Once claimed or ported, phone numbers must be associated with a contact flow to handle incoming calls. You can also use phone numbers for outbound calling by configuring them as the caller ID in queue outbound caller configurations.

Phone numbers are associated with your Amazon Connect instance or, for multi-region setups, with a traffic distribution group that manages cross-region routing.

### PhoneNumber Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `targetArn` | `string` | Yes | Instance or traffic distribution group ARN |
| `countryCode` | `string` | Conditional | ISO country code (2 letters) |
| `type` | `PhoneNumberType` | Conditional | Phone number type |
| `prefix` | `string` | No | Phone number prefix |
| `sourcePhoneNumberArn` | `string` | Conditional | ARN of imported phone number |
| `description` | `string` | No | Description (1-500 characters) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Claim New Phone Number

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const phoneNumber = new genaicdk.amazonconnect.PhoneNumber(this, "TollFreeNumber", {
  targetArn: instance.instanceArn,
  countryCode: "US",
  type: genaicdk.amazonconnect.PhoneNumberType.TOLL_FREE,
  description: "Customer support toll-free number",
});
```

---

## Quick Connect

[Quick Connects](https://docs.aws.amazon.com/connect/latest/adminguide/quick-connects.html) allow agents to quickly transfer contacts to other agents, queues, or external numbers. They provide a streamlined way for agents to route contacts without needing to remember phone numbers, queue names, or navigate complex menus during live customer interactions.

Quick connects appear in the agent's Contact Control Panel (CCP) as a searchable list, allowing agents to quickly find and select the destination for a transfer. This improves efficiency and reduces the time customers spend waiting during transfers.

Amazon Connect supports three types of quick connects:

- **Phone Number Quick Connect**: Transfers contacts to an external phone number. Useful for transferring to specialized external support lines, partner organizations, or third-party services. The phone number must be in E.164 format (e.g., +18005551234).

- **Queue Quick Connect**: Transfers contacts to another queue within your Amazon Connect instance. When you create a queue quick connect, you also specify a contact flow that executes during the transfer. This allows you to play messages to customers during the queue transfer or set contact attributes.

- **User Quick Connect**: Transfers contacts directly to a specific agent. Like queue quick connects, user quick connects require a contact flow specification that defines what happens during the transfer (e.g., whisper flows that inform the receiving agent about the contact context).

Quick connects are particularly valuable in multi-tiered support scenarios. For example, a Tier 1 agent handling a complex technical issue can use a quick connect to transfer the customer to a Tier 2 specialist. The quick connect might trigger a whisper flow that provides the specialist with context about the customer's issue before they're connected.

You can organize quick connects by adding them to queues. This makes specific quick connects available only to agents handling contacts from certain queues, helping to organize the transfer options based on the type of contact being handled.

### QuickConnect Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Quick connect name (1-127 characters) |
| `quickConnectConfig` | `QuickConnectConfig` | Yes | Quick connect configuration |
| `description` | `string` | No | Description (1-250 characters) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Quick Connect to Phone Number

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const quickConnect = new genaicdk.amazonconnect.QuickConnect(this, "ExternalQC", {
  instance: instance,
  name: "ExternalSupport",
  description: "Transfer to external support line",
  quickConnectConfig: {
    quickConnectType: genaicdk.amazonconnect.QuickConnectType.PHONE_NUMBER,
    phoneConfig: {
      phoneNumber: "+18005551234",
    },
  },
});
```

---

## User Hierarchy Group

[User Hierarchy Groups](https://docs.aws.amazon.com/connect/latest/adminguide/agent-hierarchy.html) organize users into reporting structures (up to 5 levels). They create an organizational hierarchy that reflects your business structure, enabling you to group agents, supervisors, and managers in ways that support reporting, metrics analysis, and operational management.

User hierarchy groups are essential for organizations that need to track performance and generate reports at different organizational levels. For example, you might organize your contact center like this:

1. **Level 1**: Region (e.g., "North America", "EMEA", "APAC")
2. **Level 2**: Country (e.g., "United States", "United Kingdom", "Australia")
3. **Level 3**: City (e.g., "New York", "London", "Sydney")
4. **Level 4**: Department (e.g., "Sales", "Support", "Technical")
5. **Level 5**: Team (e.g., "Enterprise Sales", "Tier 1 Support", "Network Specialists")

This hierarchical structure enables several important capabilities:

- **Reporting and Analytics**: Generate metrics reports at any level of the hierarchy. For example, you can view performance metrics for the entire Sales department, or drill down to a specific team within that department.

- **Supervisor Access**: Supervisors can be granted access to view real-time metrics and historical reports for users within their hierarchy group and all child groups. This allows managers to monitor their teams without accessing data from other parts of the organization.

- **Agent Grouping**: Organize agents logically based on your business structure rather than by technical constraints. This makes it easier to understand performance patterns and identify areas for improvement.

- **Queue Configuration**: While queues define where contacts go, hierarchy groups define how people are organized. Together, they provide comprehensive control over both contact routing and organizational structure.

Each hierarchy group can have a parent group, creating the nested structure. When you assign a user to a hierarchy group, they're associated with that specific level, and all parent levels are implicitly included in their organizational path.

Hierarchy groups are optional but highly recommended for any organization with more than a handful of agents. They become essential as your contact center grows and you need sophisticated reporting and organizational management capabilities.

### UserHierarchyGroup Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Hierarchy group name (1-100 characters) |
| `parentGroup` | `IUserHierarchyGroup` | No | Parent group |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic Hierarchy

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

// Level 1: Department
const salesDept = new genaicdk.amazonconnect.UserHierarchyGroup(this, "Sales", {
  instance: instance,
  name: "Sales",
});

// Level 2: Team
const inboundTeam = new genaicdk.amazonconnect.UserHierarchyGroup(this, "InboundSales", {
  instance: instance,
  name: "InboundSales",
  parentGroup: salesDept,
});
```
