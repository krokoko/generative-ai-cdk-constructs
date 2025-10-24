/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import {
  Instance,
  HoursOfOperation,
  DayOfWeek,
  SecurityProfile,
  Queue,
  RoutingProfile,
  Channel,
  UserHierarchyGroup,
  ContactFlow,
  ContactFlowType,
  PhoneNumber,
  PhoneNumberType,
  QuickConnect,
  QuickConnectType,
  User,
  PhoneType,
} from '../../../src/cdk-lib/amazon-connect';

describe('Amazon Connect Hours of Operation tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
  });

  test('Should create hours of operation with correct properties', () => {
    new HoursOfOperation(stack, 'test-hours', {
      instance: instance,
      name: 'BusinessHours',
      timeZone: 'America/New_York',
      description: 'Standard business hours',
      config: [
        {
          day: DayOfWeek.MONDAY,
          startTime: { hours: 9, minutes: 0 },
          endTime: { hours: 17, minutes: 0 },
        },
      ],
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::HoursOfOperation', 1);
    template.hasResourceProperties('AWS::Connect::HoursOfOperation', {
      Name: 'BusinessHours',
      TimeZone: 'America/New_York',
      Description: 'Standard business hours',
    });
  });

  test('Should validate name length', () => {
    expect(() => {
      new HoursOfOperation(stack, 'test-hours-invalid', {
        instance: instance,
        name: '',
        timeZone: 'UTC',
        config: [],
      });
    }).toThrow();
  });
});

describe('Amazon Connect Security Profile tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
  });

  test('Should create security profile with correct properties', () => {
    new SecurityProfile(stack, 'test-profile', {
      instance: instance,
      securityProfileName: 'AgentProfile',
      description: 'Agent permissions',
      permissions: ['BasicAgentAccess'],
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::SecurityProfile', 1);
    template.hasResourceProperties('AWS::Connect::SecurityProfile', {
      SecurityProfileName: 'AgentProfile',
      Description: 'Agent permissions',
    });
  });

  test('Should import security profile from ARN', () => {
    const imported = SecurityProfile.fromSecurityProfileArn(
      stack,
      'imported',
      'arn:aws:connect:us-east-1:123456789012:instance/test/security-profile/profile-id',
    );

    expect(imported.securityProfileArn).toBeDefined();
  });
});

describe('Amazon Connect Queue tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;
  let hours: HoursOfOperation;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
    hours = new HoursOfOperation(stack, 'test-hours', {
      instance: instance,
      name: 'Hours',
      timeZone: 'UTC',
      config: [
        {
          day: DayOfWeek.MONDAY,
          startTime: { hours: 0, minutes: 0 },
          endTime: { hours: 23, minutes: 59 },
        },
      ],
    });
  });

  test('Should create queue with correct properties', () => {
    new Queue(stack, 'test-queue', {
      instance: instance,
      name: 'SupportQueue',
      hoursOfOperation: hours,
      description: 'Customer support',
      maxContacts: 100,
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::Queue', 1);
    template.hasResourceProperties('AWS::Connect::Queue', {
      Name: 'SupportQueue',
      Description: 'Customer support',
      MaxContacts: 100,
    });
  });
});

describe('Amazon Connect Routing Profile tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;
  let hours: HoursOfOperation;
  let queue: Queue;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
    hours = new HoursOfOperation(stack, 'test-hours', {
      instance: instance,
      name: 'Hours',
      timeZone: 'UTC',
      config: [],
    });
    queue = new Queue(stack, 'test-queue', {
      instance: instance,
      name: 'Queue',
      hoursOfOperation: hours,
    });
  });

  test('Should create routing profile with correct properties', () => {
    new RoutingProfile(stack, 'test-routing', {
      instance: instance,
      name: 'AgentRouting',
      description: 'Agent routing profile',
      defaultOutboundQueue: queue,
      mediaConcurrencies: [
        {
          channel: Channel.VOICE,
          concurrency: 1,
        },
        {
          channel: Channel.CHAT,
          concurrency: 3,
        },
      ],
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::RoutingProfile', 1);
    template.hasResourceProperties('AWS::Connect::RoutingProfile', {
      Name: 'AgentRouting',
      Description: 'Agent routing profile',
    });
  });

  test('Should validate VOICE channel concurrency is 1', () => {
    expect(() => {
      new RoutingProfile(stack, 'test-routing-invalid', {
        instance: instance,
        name: 'Invalid',
        description: 'Invalid',
        defaultOutboundQueue: queue,
        mediaConcurrencies: [
          {
            channel: Channel.VOICE,
            concurrency: 2, // Invalid - must be 1
          },
        ],
      });
    }).toThrow();
  });
});

describe('Amazon Connect User Hierarchy Group tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
  });

  test('Should create user hierarchy group', () => {
    new UserHierarchyGroup(stack, 'test-group', {
      instance: instance,
      name: 'Sales',
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::UserHierarchyGroup', 1);
    template.hasResourceProperties('AWS::Connect::UserHierarchyGroup', {
      Name: 'Sales',
    });
  });

  test('Should create nested hierarchy', () => {
    const parent = new UserHierarchyGroup(stack, 'parent', {
      instance: instance,
      name: 'Department',
    });

    new UserHierarchyGroup(stack, 'child', {
      instance: instance,
      name: 'Team',
      parentGroup: parent,
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::UserHierarchyGroup', 2);
  });
});

describe('Amazon Connect Contact Flow tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
  });

  test('Should create contact flow', () => {
    new ContactFlow(stack, 'test-flow', {
      instance: instance,
      name: 'WelcomeFlow',
      type: ContactFlowType.CONTACT_FLOW,
      content: JSON.stringify({
        Version: '2019-10-30',
        StartAction: '12345678-1234-1234-1234-123456789012',
        Actions: [],
      }),
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::ContactFlow', 1);
    template.hasResourceProperties('AWS::Connect::ContactFlow', {
      Name: 'WelcomeFlow',
      Type: 'CONTACT_FLOW',
    });
  });

  test('Should validate JSON content', () => {
    expect(() => {
      new ContactFlow(stack, 'test-flow-invalid', {
        instance: instance,
        name: 'Invalid',
        type: ContactFlowType.CONTACT_FLOW,
        content: 'not json',
      });
    }).toThrow();
  });
});

describe('Amazon Connect Phone Number tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
  });

  test('Should create phone number', () => {
    new PhoneNumber(stack, 'test-phone', {
      targetArn: instance.instanceArn,
      countryCode: 'US',
      type: PhoneNumberType.TOLL_FREE,
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::PhoneNumber', 1);
    template.hasResourceProperties('AWS::Connect::PhoneNumber', {
      CountryCode: 'US',
      Type: 'TOLL_FREE',
    });
  });

  test('Should validate country code and type are provided', () => {
    expect(() => {
      new PhoneNumber(stack, 'test-phone-invalid', {
        targetArn: instance.instanceArn,
      });
    }).toThrow();
  });
});

describe('Amazon Connect Quick Connect tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
  });

  test('Should create phone number quick connect', () => {
    new QuickConnect(stack, 'test-qc', {
      instance: instance,
      name: 'ExternalSupport',
      quickConnectConfig: {
        quickConnectType: QuickConnectType.PHONE_NUMBER,
        phoneConfig: {
          phoneNumber: '+18005551234',
        },
      },
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::QuickConnect', 1);
    template.hasResourceProperties('AWS::Connect::QuickConnect', {
      Name: 'ExternalSupport',
    });
  });

  test('Should validate phone config is provided for PHONE_NUMBER type', () => {
    expect(() => {
      new QuickConnect(stack, 'test-qc-invalid', {
        instance: instance,
        name: 'Invalid',
        quickConnectConfig: {
          quickConnectType: QuickConnectType.PHONE_NUMBER,
          // Missing phoneConfig
        },
      });
    }).toThrow();
  });
});

describe('Amazon Connect User tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let instance: Instance;
  let hours: HoursOfOperation;
  let queue: Queue;
  let routingProfile: RoutingProfile;
  let securityProfile: SecurityProfile;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    instance = new Instance(stack, 'test-instance', {});
    hours = new HoursOfOperation(stack, 'hours', {
      instance: instance,
      name: 'Hours',
      timeZone: 'UTC',
      config: [],
    });
    queue = new Queue(stack, 'queue', {
      instance: instance,
      name: 'Queue',
      hoursOfOperation: hours,
    });
    routingProfile = new RoutingProfile(stack, 'routing', {
      instance: instance,
      name: 'RP',
      description: 'RP',
      defaultOutboundQueue: queue,
      mediaConcurrencies: [{ channel: Channel.VOICE, concurrency: 1 }],
    });
    securityProfile = new SecurityProfile(stack, 'security', {
      instance: instance,
      securityProfileName: 'SP',
    });
  });

  test('Should create user with soft phone', () => {
    new User(stack, 'test-user', {
      instance: instance,
      username: 'john.doe',
      routingProfile: routingProfile,
      securityProfiles: [securityProfile],
      phoneConfig: {
        phoneType: PhoneType.SOFT_PHONE,
        autoAccept: true,
      },
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Connect::User', 1);
    template.hasResourceProperties('AWS::Connect::User', {
      Username: 'john.doe',
    });
  });

  test('Should validate security profiles count', () => {
    expect(() => {
      new User(stack, 'test-user-invalid', {
        instance: instance,
        username: 'invalid',
        routingProfile: routingProfile,
        securityProfiles: [], // Invalid - must have at least 1
        phoneConfig: {
          phoneType: PhoneType.SOFT_PHONE,
        },
      });
    }).toThrow();
  });

  test('Should validate desk phone number when phone type is DESK_PHONE', () => {
    expect(() => {
      new User(stack, 'test-user-desk-invalid', {
        instance: instance,
        username: 'desk.user',
        routingProfile: routingProfile,
        securityProfiles: [securityProfile],
        phoneConfig: {
          phoneType: PhoneType.DESK_PHONE,
          // Missing deskPhoneNumber
        },
      });
    }).toThrow();
  });
});
