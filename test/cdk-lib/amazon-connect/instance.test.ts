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
import { IdentityManagement } from '../../../src/cdk-lib/amazon-connect/instance/identity-management';
import { Instance } from '../../../src/cdk-lib/amazon-connect/instance/instance';

describe('Amazon Connect Instance default tests', () => {
  let template: Template;
  let app: cdk.App;
  let stack: cdk.Stack;
  // @ts-ignore
  let instance: Instance;

  beforeAll(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    instance = new Instance(stack, 'test-instance', {});

    app.synth();
    template = Template.fromStack(stack);
  });

  test('Should have the correct resources', () => {
    template.resourceCountIs('AWS::Connect::Instance', 1);
  });

  test('Should have Instance resource with expected properties', () => {
    template.hasResourceProperties('AWS::Connect::Instance', {
      Attributes: {
        AutoResolveBestVoices: true,
        ContactflowLogs: true,
        ContactLens: true,
        EarlyMedia: true,
        EnhancedChatMonitoring: true,
        EnhancedContactMonitoring: true,
        HighVolumeOutBound: true,
        InboundCalls: true,
        MultiPartyChatConference: true,
      },
      IdentityManagementType: 'CONNECT_MANAGED',
      InstanceAlias: cdk.assertions.Match.anyValue(),
    });
  });

  test('Should handle tags correctly when no tags are provided', () => {
    // Verify that the Instance resource exists and has basic properties
    const instanceResource = template.findResources('AWS::Connect::Instance');
    const resourceId = Object.keys(instanceResource)[0];
    const resource = instanceResource[resourceId];

    // The resource should have basic properties
    expect(resource.Properties).toHaveProperty('Attributes');
    expect(resource.Properties).toHaveProperty('IdentityManagementType');
    expect(resource.Properties).toHaveProperty('InstanceAlias');

    // Tags property handling - the important thing is that the construct works
    // The addPropertyOverride may or may not be visible in the template depending on CDK version
    if (resource.Properties.Tags) {
      expect(resource.Properties.Tags).toEqual(undefined);
    }
  });
});

describe('Amazon Connect Instance Identity Management tests', () => {
  let template: Template;
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeEach(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
  });

  test('Using Managed Identity Management with generated instance alias', () => {
    new Instance(stack, 'test-instance', {
      identityManagement: IdentityManagement.fromManaged(),
    });

    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Connect::Instance', {
      IdentityManagementType: 'CONNECT_MANAGED',
      InstanceAlias: cdk.assertions.Match.anyValue(),
    });
  });

  test('Using Managed Identity Management with provided instance alias', () => {
    new Instance(stack, 'test-instance', {
      identityManagement: IdentityManagement.fromManaged('myCustomAlias'),
    });

    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Connect::Instance', {
      IdentityManagementType: 'CONNECT_MANAGED',
      InstanceAlias: 'myCustomAlias',
    });
  });

  test('Using SAML Identity Management with generated instance alias', () => {
    new Instance(stack, 'test-instance', {
      identityManagement: IdentityManagement.fromSAML(),
    });

    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Connect::Instance', {
      IdentityManagementType: 'SAML',
      InstanceAlias: cdk.assertions.Match.anyValue(),
    });
  });

  test('Using SAML Identity Management with provided instance alias', () => {
    new Instance(stack, 'test-instance', {
      identityManagement: IdentityManagement.fromSAML('myCustomAlias'),
    });

    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Connect::Instance', {
      IdentityManagementType: 'SAML',
      InstanceAlias: 'myCustomAlias',
    });
  });

  test('Using Existing Directory Identity Management', () => {
    new Instance(stack, 'test-instance', {
      identityManagement: IdentityManagement.fromExistingDirectory('d-1234567890'),
    });

    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Connect::Instance', {
      IdentityManagementType: 'EXISTING_DIRECTORY',
      DirectoryId: 'd-1234567890',
    });
  });
});

describe('Amazon Connect Instance static methods tests', () => {
  // @ts-ignore
  let template: Template;
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeAll(() => {
    app = new cdk.App();
    cdk.Aspects.of(app).add(new AwsSolutionsChecks());
    stack = new cdk.Stack(app, 'test-stack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    app.synth();
    template = Template.fromStack(stack);
  });

  test('fromInstanceAttributes should create an Instance reference from existing attributes', () => {
    const instance = Instance.fromInstanceAttributes(stack, 'test-instance', {
      instanceArn: 'arn:aws:connect:us-east-1:123456789012:instance/test-instance',
      serviceRoleArn: 'arn:aws:iam::123456789012:role/test-instance-role',
      status: 'ACTIVE',
      createdAt: '2021-01-01T00:00:00Z',
    });
    expect(instance.instanceArn).toBe('arn:aws:connect:us-east-1:123456789012:instance/test-instance');
    expect(instance.serviceRole).toBeDefined();
    expect(instance.status).toBe('ACTIVE');
    expect(instance.createdAt).toBe('2021-01-01T00:00:00Z');
  });

  test('fromInstanceAttributes should create an Instance reference from existing attributes', () => {
    const instance = Instance.fromInstanceAttributes(stack, 'test-instance-2', {
      instanceArn: 'arn:aws:connect:us-east-1:123456789012:instance/test-instance',
      serviceRoleArn: 'arn:aws:iam::123456789012:role/test-instance-role',
    });
    expect(instance.instanceArn).toBe('arn:aws:connect:us-east-1:123456789012:instance/test-instance');
    expect(instance.serviceRole).toBeDefined();
    expect(instance.status).toBeUndefined();
    expect(instance.createdAt).toBeUndefined();
  });
});
