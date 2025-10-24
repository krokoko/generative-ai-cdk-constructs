# Amazon Connect L2 CDK Constructs

* **Original Author(s):**: @alkrok
* **Tracking Issue**: TBD
* **API Bar Raiser**: TBD

The Amazon Connect L2 constructs simplify the deployment and management of Amazon Connect contact center resources by wrapping CloudFormation L1 constructs. They provide high-level, object-oriented approaches to creating and managing connect instances, users, queues, routing profiles, contact flows, and other essential resources.

A quick comparison between L1 and L2 Connect constructs:

1. Quick and easy creation of Connect resources:
   - Instance with sensible defaults for all attributes
   - Users with proper validation and type-safe configuration
   - Queues with automatic dependency management
   - Routing profiles with channel-specific settings
   - Contact flows with type validation

2. Simplified infrastructure management:
   - Automatic IAM role and policy management
   - Identity management with factory methods
   - Validation at construct level (fail fast)
   - Proper resource dependency handling

3. Helper methods for better developer experience:
   - `grant()` methods for IAM permissions
   - `fromArn()` and `fromAttributes()` for importing existing resources
   - Type-safe enums for configuration options
   - Fluent interfaces for complex configurations

4. Validation and error handling:
   - Compile-time configuration validation
   - User-friendly error messages
   - Pattern validation for ARNs, usernames, phone numbers
   - Automatic dependency management

**CHANGELOG**:
```feat(amazonconnect): Amazon Connect L2 CDK constructs for contact center resources```

## Working Backwards

### README

[Amazon Connect](https://aws.amazon.com/connect/) is a contact center as a service (CCaaS) solution that offers easy, self-service configuration and enables dynamic, personal, and natural customer engagement at any scale.

This construct library facilitates the deployment of Amazon Connect resources through a higher level, L2 set of constructs. It leverages underlying CloudFormation L1 resources to provision these Connect features.

For additional information about Amazon Connect, please refer to the [get started with Amazon Connect](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-get-started.html) guide.

## Table of Contents

- [Instance](#instance)
- [Hours of Operation](#hours-of-operation)
- [Security Profile](#security-profile)
- [Routing Profile](#routing-profile)
- [Queue](#queue)
- [User](#user)
- [Contact Flow](#contact-flow)
- [Phone Number](#phone-number)
- [Quick Connect](#quick-connect)
- [User Hierarchy Group](#user-hierarchy-group)

---

## Instance

To get started, you create an [Amazon Connect instance](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html), which is a virtual contact center. Each instance contains all the resources and settings related to your contact center.

### Instance Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `attributes` | `InstanceSettings` | No | The attributes of the instance. Defaults to enable all options. |
| `identityManagement` | `IdentityManagement` | No | The identity management type. Defaults to managed by Amazon Connect. |
| `tags` | `{ [key: string]: string }` | No | Tags to apply to the instance resource. |

### Basic Instance Creation

```typescript fixture=default-connect
// Create a basic instance with default settings
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
```

### Instance with Identity Management

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

---

## Hours of Operation

[Hours of Operation](https://docs.aws.amazon.com/connect/latest/adminguide/set-hours-operation.html) define when your contact center is open for business. They are used by queues to determine routing behavior.

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
    // ... other days
  ],
});
```

### 24/7 Hours of Operation

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const allDays = [
  genaicdk.amazonconnect.DayOfWeek.SUNDAY,
  genaicdk.amazonconnect.DayOfWeek.MONDAY,
  genaicdk.amazonconnect.DayOfWeek.TUESDAY,
  genaicdk.amazonconnect.DayOfWeek.WEDNESDAY,
  genaicdk.amazonconnect.DayOfWeek.THURSDAY,
  genaicdk.amazonconnect.DayOfWeek.FRIDAY,
  genaicdk.amazonconnect.DayOfWeek.SATURDAY,
];

const hours24x7 = new genaicdk.amazonconnect.HoursOfOperation(this, "Hours24x7", {
  instance: instance,
  name: "TwentyFourSeven",
  description: "24/7 operation",
  timeZone: "UTC",
  config: allDays.map(day => ({
    day,
    startTime: { hours: 0, minutes: 0 },
    endTime: { hours: 23, minutes: 59 },
  })),
});
```

---

## Security Profile

[Security Profiles](https://docs.aws.amazon.com/connect/latest/adminguide/connect-security-profiles.html) control what users can do and see in Amazon Connect.

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

### Import Existing Security Profile

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const profile = genaicdk.amazonconnect.SecurityProfile.fromSecurityProfileArn(
  this,
  "ImportedProfile",
  "arn:aws:connect:us-east-1:123456789012:instance/12345678/security-profile/67890"
);
```

---

## Routing Profile

[Routing Profiles](https://docs.aws.amazon.com/connect/latest/adminguide/routing-profiles.html) determine which queues agents handle and how many contacts they can handle simultaneously across channels.

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

### Routing Profile with Queue Priorities

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const salesQueue = new genaicdk.amazonconnect.Queue(this, "SalesQueue", {
  instance: instance,
  name: "SalesQueue",
  hoursOfOperation: hours,
});
const supportQueue = new genaicdk.amazonconnect.Queue(this, "SupportQueue", {
  instance: instance,
  name: "SupportQueue",
  hoursOfOperation: hours,
});

const routingProfile = new genaicdk.amazonconnect.RoutingProfile(this, "MultiQueueRP", {
  instance: instance,
  name: "MultiQueueRoutingProfile",
  description: "Routing profile with queue priorities",
  defaultOutboundQueue: salesQueue,
  mediaConcurrencies: [
    {
      channel: genaicdk.amazonconnect.Channel.VOICE,
      concurrency: 1,
    },
  ],
  queueConfigs: [
    {
      channel: genaicdk.amazonconnect.Channel.VOICE,
      queue: salesQueue,
      priority: 1,
      delay: 0,
    },
    {
      channel: genaicdk.amazonconnect.Channel.VOICE,
      queue: supportQueue,
      priority: 2,
      delay: 10,
    },
  ],
});
```

---

## Queue

[Queues](https://docs.aws.amazon.com/connect/latest/adminguide/create-queue.html) hold contacts waiting to be answered by agents.

### Queue Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Queue name (1-127 characters) |
| `hoursOfOperation` | `IHoursOfOperation` | Yes | Operating hours |
| `description` | `string` | No | Queue description (1-250 characters) |
| `maxContacts` | `number` | No | Maximum contacts in queue (minimum 0) |
| `outboundCallerConfig` | `OutboundCallerConfig` | No | Outbound caller ID settings |
| `quickConnects` | `IQuickConnect[]` | No | Associated quick connects |
| `status` | `QueueStatus` | No | Queue status (ENABLED or DISABLED) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic Queue

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const hours = new genaicdk.amazonconnect.HoursOfOperation(this, "BusinessHours", {
  instance: instance,
  name: "BusinessHours",
  timeZone: "America/New_York",
  config: [/* ... */],
});

const queue = new genaicdk.amazonconnect.Queue(this, "SupportQueue", {
  instance: instance,
  name: "SupportQueue",
  description: "Customer support queue",
  hoursOfOperation: hours,
  maxContacts: 100,
});
```

### Queue with Outbound Configuration

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const hours = new genaicdk.amazonconnect.HoursOfOperation(this, "Hours", {
  instance: instance,
  name: "Hours",
  timeZone: "UTC",
  config: [/* ... */],
});

const queue = new genaicdk.amazonconnect.Queue(this, "OutboundQueue", {
  instance: instance,
  name: "OutboundQueue",
  hoursOfOperation: hours,
  outboundCallerConfig: {
    outboundCallerIdName: "My Company",
    outboundCallerIdNumberArn: "arn:aws:connect:us-east-1:123456789012:phone-number/12345",
  },
});
```

---

## User

[Users](https://docs.aws.amazon.com/connect/latest/adminguide/user-management.html) are agents, managers, and administrators who need access to Amazon Connect.

### User Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `username` | `string` | Yes | User login name (1-64 characters, pattern: `[a-zA-Z0-9\_\-\.\@]+`) |
| `routingProfile` | `IRoutingProfile` | Yes | Routing profile ARN |
| `securityProfiles` | `ISecurityProfile[]` | Yes | Security profiles (1-10 profiles) |
| `phoneConfig` | `UserPhoneConfig` | Yes | Phone configuration |
| `identityInfo` | `UserIdentityInfo` | No | Personal information |
| `password` | `string` | No | User password (8-64 characters) |
| `directoryUserId` | `string` | No | Directory service user ID |
| `hierarchyGroup` | `IUserHierarchyGroup` | No | User hierarchy group |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Basic User with Soft Phone

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const routingProfile = new genaicdk.amazonconnect.RoutingProfile(this, "RP", {/* ... */});
const securityProfile = new genaicdk.amazonconnect.SecurityProfile(this, "SP", {/* ... */});

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

### User with Desk Phone

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const routingProfile = new genaicdk.amazonconnect.RoutingProfile(this, "RP", {/* ... */});
const securityProfile = new genaicdk.amazonconnect.SecurityProfile(this, "SP", {/* ... */});

const agent = new genaicdk.amazonconnect.User(this, "DeskPhoneAgent", {
  instance: instance,
  username: "jane.smith",
  routingProfile: routingProfile,
  securityProfiles: [securityProfile],
  phoneConfig: {
    phoneType: genaicdk.amazonconnect.PhoneType.DESK_PHONE,
    deskPhoneNumber: "+12125551234",
    autoAccept: false,
  },
  identityInfo: {
    firstName: "Jane",
    lastName: "Smith",
  },
});
```

---

## Contact Flow

[Contact Flows](https://docs.aws.amazon.com/connect/latest/adminguide/connect-contact-flows.html) define the customer experience when they interact with your contact center.

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
    Actions: [
      // Contact flow definition
    ],
  }),
});
```

### Import Contact Flow Content from File

```typescript fixture=default-connect
import * as fs from 'fs';
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const flowContent = fs.readFileSync('path/to/flow.json', 'utf-8');

const contactFlow = new genaicdk.amazonconnect.ContactFlow(this, "ImportedFlow", {
  instance: instance,
  name: "ImportedFlow",
  type: genaicdk.amazonconnect.ContactFlowType.CONTACT_FLOW,
  content: flowContent,
});
```

---

## Phone Number

[Phone Numbers](https://docs.aws.amazon.com/connect/latest/adminguide/contact-center-phone-number.html) are used for inbound and outbound calls.

### PhoneNumber Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance or traffic distribution group |
| `countryCode` | `string` | Conditional | ISO country code (2 letters) |
| `type` | `PhoneNumberType` | Conditional | Phone number type |
| `prefix` | `string` | No | Phone number prefix (includes + and country code) |
| `sourcePhoneNumberArn` | `string` | Conditional | ARN of imported phone number |
| `description` | `string` | No | Phone number description (1-500 characters) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Claim New Phone Number

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const phoneNumber = new genaicdk.amazonconnect.PhoneNumber(this, "TollFreeNumber", {
  instance: instance,
  countryCode: "US",
  type: genaicdk.amazonconnect.PhoneNumberType.TOLL_FREE,
  description: "Customer support toll-free number",
});
```

### Claim DID Number with Prefix

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});

const phoneNumber = new genaicdk.amazonconnect.PhoneNumber(this, "DIDNumber", {
  instance: instance,
  countryCode: "US",
  type: genaicdk.amazonconnect.PhoneNumberType.DID,
  prefix: "+1212",
  description: "New York office number",
});
```

---

## Quick Connect

[Quick Connects](https://docs.aws.amazon.com/connect/latest/adminguide/quick-connects.html) allow agents to quickly transfer contacts to other agents, queues, or external numbers.

### QuickConnect Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `instance` | `IInstance` | Yes | The Amazon Connect instance |
| `name` | `string` | Yes | Quick connect name (1-127 characters) |
| `quickConnectConfig` | `QuickConnectConfig` | Yes | Quick connect configuration |
| `description` | `string` | No | Description (1-250 characters) |
| `tags` | `{ [key: string]: string }` | No | Resource tags |

### Quick Connect to User

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const user = new genaicdk.amazonconnect.User(this, "Manager", {/* ... */});

const quickConnect = new genaicdk.amazonconnect.QuickConnect(this, "ManagerQC", {
  instance: instance,
  name: "TransferToManager",
  description: "Quick transfer to manager",
  quickConnectConfig: {
    quickConnectType: genaicdk.amazonconnect.QuickConnectType.USER,
    userConfig: {
      userArn: user.userArn,
      contactFlowArn: contactFlow.contactFlowArn,
    },
  },
});
```

### Quick Connect to Queue

```typescript fixture=default-connect
const instance = new genaicdk.amazonconnect.Instance(this, "MyInstance", {});
const queue = new genaicdk.amazonconnect.Queue(this, "EscalationQueue", {/* ... */});

const quickConnect = new genaicdk.amazonconnect.QuickConnect(this, "EscalationQC", {
  instance: instance,
  name: "EscalateToTier2",
  quickConnectConfig: {
    quickConnectType: genaicdk.amazonconnect.QuickConnectType.QUEUE,
    queueConfig: {
      queueArn: queue.queueArn,
      contactFlowArn: contactFlow.contactFlowArn,
    },
  },
});
```

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

[User Hierarchy Groups](https://docs.aws.amazon.com/connect/latest/adminguide/agent-hierarchy.html) organize users into reporting structures (up to 5 levels).

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

// Level 3: Region
const eastRegion = new genaicdk.amazonconnect.UserHierarchyGroup(this, "EastRegion", {
  instance: instance,
  name: "EastRegion",
  parentGroup: inboundTeam,
});
```

---

## Public FAQ

### What are we launching today?

We are launching comprehensive L2 CDK constructs for Amazon Connect that cover all major resources needed to build and manage a contact center:

- **Instance**: Virtual contact center with configurable attributes
- **Hours of Operation**: Business hours and schedules
- **Security Profile**: Role-based access control
- **Routing Profile**: Agent channel and queue configuration
- **Queue**: Contact holding and routing
- **User**: Agent, manager, and administrator accounts
- **Contact Flow**: Customer interaction flows
- **Phone Number**: Inbound/outbound telephony
- **Quick Connect**: Transfer shortcuts
- **User Hierarchy Group**: Organizational structure

### Why should I use this feature?

The Amazon Connect L2 constructs offer several advantages:

1. **Type Safety**: Strong TypeScript typing catches errors at compile time
2. **Validation**: Comprehensive validation of ARNs, patterns, and constraints
3. **Integration**: Seamless integration with other AWS CDK constructs
4. **Best Practices**: Sensible defaults following AWS recommendations
5. **Resource Management**: Automatic dependency handling and IAM permissions
6. **Developer Experience**: Intuitive APIs with helper methods and factory patterns

These constructs eliminate the complexity of CloudFormation templates and provide a better development experience for building contact centers.

## Internal FAQ

### Why are we doing this?

Amazon Connect is a powerful contact center platform, but setting it up requires coordinating many resources with complex dependencies. The L1 CloudFormation constructs require:

1. **Manual dependency management**: Ensuring resources are created in the correct order
2. **Complex validation**: Manually checking ARN patterns, string lengths, and constraints
3. **Boilerplate code**: Repetitive IAM role and policy definitions
4. **Limited type safety**: CloudFormation properties are loosely typed

L2 constructs solve these problems by providing:

- Automatic dependency resolution
- Runtime validation with clear error messages
- Sensible defaults for common configurations
- Type-safe APIs with IDE autocompletion
- Helper methods for IAM grants and resource imports

### Why should we _not_ do this?

Potential concerns:

1. **Abstraction overhead**: L2 constructs hide some CloudFormation details
2. **Learning curve**: Developers need to learn the L2 API
3. **Maintenance**: L2 constructs require updates when AWS adds features

However, the benefits of improved developer experience and reduced errors outweigh these concerns.

### What is the technical solution (design) of this feature?

The implementation follows CDK L2 construct patterns:

1. **Base Classes**: Abstract base classes for each resource type
2. **Factory Methods**: `fromArn()` and `fromAttributes()` for imports
3. **Validation**: Runtime validation using helper functions
4. **Enums**: Type-safe enums for configuration options
5. **Grant Methods**: IAM permission helpers following CDK patterns
6. **Dependencies**: Automatic CloudFormation dependencies
7. **Documentation**: Comprehensive JSDoc for all public APIs

### Is this a breaking change?

No. This is a new feature adding L2 constructs. The existing CloudFormation L1 constructs remain available.

### What alternative solutions did you consider?

1. **Use L1 constructs directly**: Requires more boilerplate and manual validation
2. **Use CloudFormation templates**: Less type-safe and harder to compose
3. **Use AWS CLI**: Requires manual resource management and scripting

L2 constructs provide the best developer experience with strong typing, validation, and integration with the CDK ecosystem.

### What are the drawbacks of this solution?

1. **Additional layer of abstraction**: Developers must understand both L2 and L1
2. **Potential for version drift**: L2 constructs may lag behind L1 CloudFormation resources
3. **Migration effort**: Existing CloudFormation users need to migrate code

These are acceptable tradeoffs for the improved developer experience.

### What is the high-level project plan?

**Phase 1: Core Resources (Current)**
- ✅ Instance (already implemented)
- HoursOfOperation
- SecurityProfile
- RoutingProfile
- Queue
- User

**Phase 2: Advanced Resources**
- ContactFlow
- PhoneNumber
- QuickConnect
- UserHierarchyGroup

**Phase 3: Testing and Documentation**
- Comprehensive unit tests
- Integration tests
- README documentation
- API documentation
- Code examples

**Phase 4: Review and Release**
- Code review
- API bar raiser approval
- Community feedback
- Stable release

### Are there any open issues that need to be addressed later?

1. **Contact Flow Builder**: Consider a higher-level API for building contact flows programmatically
2. **Multi-region support**: Consider traffic distribution groups for multi-region deployments
3. **Metrics and Monitoring**: Consider constructs for Connect metrics and dashboards
4. **Integration patterns**: Consider higher-level patterns for integrating Connect with Lambda, Lex, etc.

---

```
[X] Signed-off by API Bar Raiser @xxxxx
```
