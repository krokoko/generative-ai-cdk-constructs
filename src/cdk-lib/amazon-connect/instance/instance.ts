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

import { Arn, ArnFormat, IResource, Resource } from 'aws-cdk-lib';
import * as amazonConnect from 'aws-cdk-lib/aws-connect';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
// Internal libs
import { IdentityManagement } from './identity-management';

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Interface for Amazon Connect Instance resources
 */
export interface IInstance extends IResource {
  /**
   * The ARN of the instance resource
   * @attribute
   */
  readonly instanceArn: string;
  /**
   * The id of the instance
   * @attribute
   */
  readonly instanceId: string;
  /**
   * The service role of the instance.
   */
  readonly serviceRole?: iam.IRole;
  /**
   * The status of the instance
   * @attribute
   */
  readonly status?: string;
  /**
   * Timestamp when the instance was created
   * @attribute
   */
  readonly createdAt?: string;
  /**
   * Grant the given principal identity permissions to perform actions on this instance.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for a Amazon Connect Instance.
 * Contains methods and attributes valid for Instances either created with CDK or imported.
 */
export abstract class InstanceBase extends Resource implements IInstance {
  public abstract readonly instanceArn: string;
  public abstract readonly instanceId: string;
  public abstract readonly serviceRole?: iam.IRole;
  public abstract readonly status?: string;
  public abstract readonly createdAt?: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
  /**
   * Grants IAM actions to the IAM Principal
   * @param grantee - The IAM principal to grant permissions to
   * @param actions - The actions to grant
   * @returns An IAM Grant object representing the granted permissions
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant {
    return iam.Grant.addToPrincipal({
      grantee,
      actions,
      resourceArns: [this.instanceArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Settings for creating a Amazon Connect Instance resource
 */
export interface InstanceSettings {
  /**
   * Specifies whether Amazon Connect automatically selects
   * the best voice for text-to-speech (TTS) based on the language.
   * @required no
   * @default true
   */
  readonly autoResolveBestVoices: boolean;
  /**
   * Controls whether logs for contact flow execution are generated.
   * @required no
   * @default true
   */
  readonly contactflowLogs: boolean;
  /**
   * Activates Amazon Contact Lens for conversational analytics,
   * enabling features like sentiment analysis and call summarization.
   * @required no
   * @default true
   */
  readonly contactLens: boolean;
  /**
   * Controls whether early media (e.g., ringtones or announcements before the call connects)
   * is enabled for outbound calls.
   * @required no
   * @default true
   */
  readonly earlyMedia: boolean;
  /**
   * Offers enhanced monitoring for chat interactions.
   * @required no
   * @default true
   */
  readonly enhancedChatMonitoring: boolean;
  /**
   * Provides advanced monitoring capabilities for contact interactions.
   * @required no
   * @default true
   */
  readonly enhancedContactMonitoring: boolean;
  /**
   * Enables features designed for high-volume outbound campaigns.
   * @required no
   * @default true
   */
  readonly highVolumeOutBound: boolean;
  /**
   * Allow incoming calls.
   * Your contact center can handle incoming calls.
   * @required no
   * @default true
   */
  readonly inboundCalls?: boolean;
  /**
   * Enables multi-party chat conferencing within the instance.
   * @required no
   * @default true
   */
  readonly multiPartyChatConference: boolean;
  /**
   * Determines if multi-party conferencing is allowed within the instance.
   * @required no
   * @default true
   */
  readonly multiPartyConference: boolean;
  /**
   * Allow outgoing calls.
   * Your contact center can make outbound calls.
   * You can set which users can place outbound calls in user permissions.
   * @required no
   * @default true
   */
  readonly outboundCalls: boolean;
  /**
   * Enables the use of custom Text-to-Speech (TTS) voices.
   * @required no
   * @default true
   */
  readonly useCustomTtsVoices: boolean;
}

/**
 * Properties for creating a Amazon Connect Instance resource
 */
export interface InstanceProps {
  /**
   * A toggle for an individual feature at the instance level.
   * @required no
   * @default - all true
   */
  readonly attributes?: InstanceSettings;
  /**
   * The identity management for the instance.
   * @required yes
   * @default - managed by Amazon Connect
   */
  readonly identityManagement?: IdentityManagement;
  /**
   * A list of key:value pairs of tags to apply to this instance resource
   * @default {} no tags
   * @required no
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Instance.
 */
export interface InstanceAttributes {
  /**
   * The ARN of the instance.
   * @attribute
   */
  readonly instanceArn: string;
  /**
   * The ARN of the service role of the instance.
   */
  readonly serviceRoleArn: string;
  /**
   * The status of the instance.
   * @attribute
   */
  readonly status?: string;
  /**
   * Timestamp when the instance was created.
   * @attribute
   */
  readonly createdAt?: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * The first step in setting up your Amazon Connect contact center is to create
 * a virtual contact center instance. Each instance contains all the resources
 * and settings related to your contact center.
 *
 * @see https://docs.aws.amazon.com/connect/
 * @resource AWS::Connect::Instance
 */
export class Instance extends InstanceBase {
  /**
   * Static Method for importing an existing Amazon Connect Instance.
   */
  /**
   * Creates an instance reference from an existing instance's attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing instance
   * @returns An IInstance reference to the existing instance
   */
  public static fromInstanceAttributes(scope: Construct, id: string, attrs: InstanceAttributes): IInstance {
    class Import extends InstanceBase {
      public readonly instanceArn = attrs.instanceArn;
      public readonly instanceId = Arn.split(attrs.instanceArn, ArnFormat.SLASH_RESOURCE_NAME).resourceName!;
      public readonly serviceRole = iam.Role.fromRoleArn(scope, `${id}Role`, attrs.serviceRoleArn);
      public readonly status = attrs.status;
      public readonly createdAt = attrs.createdAt;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    // Return new Instance
    return new Import(scope, id);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the instance resource.
   * @attribute
   */
  public readonly instanceArn: string;
  /**
   * The id of the instance resource.
   * @attribute
   */
  public readonly instanceId: string;
  /**
   * The service role of the instance resource.
   */
  public readonly serviceRole?: iam.IRole;
  /**
   * Timestamp when the instance was created.
   * @attribute
   */
  public readonly createdAt?: string;
  /**
   * The status of the instance.
   * @attribute
   */
  public readonly status?: string;
  /**
   * Tags applied to this instance resource
   * A map of key-value pairs for resource tagging
   */
  public readonly tags?: { [key: string]: string };
  /**
   * Settings for an individual feature at the instance level.
   */
  public readonly attributes?: InstanceSettings;
  /**
   * The identifier for the directory.
   */
  public readonly directoryId?: string;
  /**
   * The type of identity management for the instance.
   */
  public readonly identityManagementType: string;
  /**
   * The alias for the instance.
   */
  public readonly instanceAlias?: string;
  /**
   * The identity management configuration for the instance.
   */
  private readonly identityManagement: IdentityManagement;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnInstance;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: InstanceProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties or defaults
    // ------------------------------------------------------
    this.identityManagement = props.identityManagement ?? IdentityManagement.fromManaged();
    this.attributes = props.attributes;
    this.directoryId = this.identityManagement.directoryId;
    this.identityManagementType = this.identityManagement.identityManagementType;
    this.instanceAlias = this.identityManagement.instanceAlias;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------

    // ------------------------------------------------------
    // CFN Props - With Lazy support
    // ------------------------------------------------------
    let cfnProps: amazonConnect.CfnInstanceProps = {
      attributes: this._renderInstanceAttributes(),
      directoryId: this.directoryId,
      identityManagementType: this.identityManagementType,
      instanceAlias: this.instanceAlias,
      tags: this.tags ? Object.entries(this.tags).map(([key, value]) => ({
        key,
        value,
      })) : undefined,
    };

    // ------------------------------------------------------
    // CFN Resource
    // ------------------------------------------------------
    this.__resource = new amazonConnect.CfnInstance(this, 'Resource', cfnProps);

    // Get attributes directly from the CloudFormation resource
    this.instanceArn = this.__resource.attrArn;
    this.instanceId = this.__resource.attrId;
    this.createdAt = this.__resource.attrCreatedTime;
    this.status = this.__resource.attrInstanceStatus;
    this.serviceRole = iam.Role.fromRoleArn(scope, `${id}Role`, this.__resource.attrServiceRole);
  }

  // ------------------------------------------------------
  // HELPER METHODS - addX()
  // ------------------------------------------------------

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------

  // ------------------------------------------------------
  // RENDERERS
  // ------------------------------------------------------
  /**
   * Render the instance attributes.
   *
   * @returns AttributesProperty object in CloudFormation format
   * @internal This is an internal core function and should not be called directly.
   */
  private _renderInstanceAttributes(): amazonConnect.CfnInstance.AttributesProperty {
    if (!this.attributes) {
      return {
        autoResolveBestVoices: true,
        contactflowLogs: true,
        contactLens: true,
        earlyMedia: true,
        enhancedChatMonitoring: true,
        enhancedContactMonitoring: true,
        highVolumeOutBound: true,
        inboundCalls: true,
        multiPartyChatConference: true,
        multiPartyConference: true,
        outboundCalls: true,
        useCustomTtsVoices: true,
      };
    }

    return {
      autoResolveBestVoices: this.attributes.autoResolveBestVoices ?? true,
      contactflowLogs: this.attributes.contactflowLogs ?? true,
      contactLens: this.attributes.contactLens ?? true,
      earlyMedia: this.attributes.earlyMedia ?? true,
      enhancedChatMonitoring: this.attributes.enhancedChatMonitoring ?? true,
      enhancedContactMonitoring: this.attributes.enhancedContactMonitoring ?? true,
      highVolumeOutBound: this.attributes.highVolumeOutBound ?? true,
      inboundCalls: this.attributes.inboundCalls ?? true,
      multiPartyChatConference: this.attributes.multiPartyChatConference ?? true,
      multiPartyConference: this.attributes.multiPartyConference ?? true,
      outboundCalls: this.attributes.outboundCalls ?? true,
      useCustomTtsVoices: this.attributes.useCustomTtsVoices ?? true,
    };
  }
}
