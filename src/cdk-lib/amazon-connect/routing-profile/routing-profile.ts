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
import { IInstance } from '../instance/instance';
import { IQueue } from '../queue/queue';
import { validateStringFieldLength } from '../validation-helpers';

/******************************************************************************
 *                              CONSTANTS
 *****************************************************************************/
/**
 * Minimum length for routing profile name
 * @internal
 */
const PROFILE_NAME_MIN_LENGTH = 1;
/**
 * Maximum length for routing profile name
 * @internal
 */
const PROFILE_NAME_MAX_LENGTH = 127;
/**
 * Minimum length for description
 * @internal
 */
const DESCRIPTION_MIN_LENGTH = 1;
/**
 * Maximum length for description
 * @internal
 */
const DESCRIPTION_MAX_LENGTH = 250;

/******************************************************************************
 *                              ENUMS
 *****************************************************************************/
/**
 * Communication channel types
 */
export enum Channel {
  /**
   * Voice channel
   */
  VOICE = 'VOICE',
  /**
   * Chat channel
   */
  CHAT = 'CHAT',
  /**
   * Task channel
   */
  TASK = 'TASK',
  /**
   * Email channel
   */
  EMAIL = 'EMAIL',
}

/**
 * Agent availability timer types
 */
export enum AgentAvailabilityTimer {
  /**
   * Time since last activity
   */
  TIME_SINCE_LAST_ACTIVITY = 'TIME_SINCE_LAST_ACTIVITY',
  /**
   * Time since last inbound contact
   */
  TIME_SINCE_LAST_INBOUND = 'TIME_SINCE_LAST_INBOUND',
}

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Media concurrency configuration
 */
export interface MediaConcurrency {
  /**
   * The channel type
   * @required yes
   * @default - no default
   */
  readonly channel: Channel;
  /**
   * The number of concurrent contacts
   * VOICE must be 1, CHAT and TASK can be 1-10
   * @required yes
   * @default - no default
   */
  readonly concurrency: number;
  /**
   * Cross-channel behavior (advanced configuration)
   * @required no
   * @default - no cross-channel behavior
   */
  readonly crossChannelBehavior?: any;
}

/**
 * Routing profile queue configuration
 */
export interface RoutingProfileQueueConfig {
  /**
   * The channel type
   * @required yes
   * @default - no default
   */
  readonly channel: Channel;
  /**
   * The queue
   * @required yes
   * @default - no default
   */
  readonly queue: IQueue;
  /**
   * The delay in seconds before routing to this queue
   * @required no
   * @default - no delay
   */
  readonly delay?: number;
  /**
   * The priority of the queue (lower numbers = higher priority)
   * @required no
   * @default - no priority
   */
  readonly priority?: number;
}

/**
 * Interface for Amazon Connect Routing Profile resources
 */
export interface IRoutingProfile extends IResource {
  /**
   * The ARN of the routing profile resource
   * @attribute
   */
  readonly routingProfileArn: string;
  /**
   * The name of the routing profile
   * @attribute
   */
  readonly routingProfileName: string;
  /**
   * Grant the given principal identity permissions to perform actions on this routing profile.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect Routing Profile.
 * Contains methods and attributes valid for RoutingProfile either created with CDK or imported.
 */
export abstract class RoutingProfileBase extends Resource implements IRoutingProfile {
  public abstract readonly routingProfileArn: string;
  public abstract readonly routingProfileName: string;

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
      resourceArns: [this.routingProfileArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect Routing Profile resource
 */
export interface RoutingProfileProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The name of the routing profile
   * @required yes
   * @default - no default
   */
  readonly name: string;
  /**
   * The description of the routing profile
   * @required yes
   * @default - no default
   */
  readonly description: string;
  /**
   * The default outbound queue
   * @required yes
   * @default - no default
   */
  readonly defaultOutboundQueue: IQueue;
  /**
   * The media concurrency configuration
   * At least one channel must be configured
   * @required yes
   * @default - no default
   */
  readonly mediaConcurrencies: MediaConcurrency[];
  /**
   * The queue configurations
   * @required no
   * @default - no queue configs
   */
  readonly queueConfigs?: RoutingProfileQueueConfig[];
  /**
   * The agent availability timer
   * @required no
   * @default - TIME_SINCE_LAST_ACTIVITY
   */
  readonly agentAvailabilityTimer?: AgentAvailabilityTimer;
  /**
   * Tags to apply to the routing profile resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Routing Profile.
 */
export interface RoutingProfileAttributes {
  /**
   * The ARN of the routing profile.
   * @attribute
   */
  readonly routingProfileArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Routing Profiles determine which queues agents handle and
 * how many contacts they can handle simultaneously across channels.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/routing-profiles.html
 * @resource AWS::Connect::RoutingProfile
 */
export class RoutingProfile extends RoutingProfileBase {
  /**
   * Creates a routing profile reference from an existing routing profile ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param routingProfileArn - ARN of the existing routing profile
   * @returns An IRoutingProfile reference to the existing routing profile
   */
  public static fromRoutingProfileArn(scope: Construct, id: string, routingProfileArn: string): IRoutingProfile {
    class Import extends RoutingProfileBase {
      public readonly routingProfileArn = routingProfileArn;
      public readonly routingProfileName = Arn.split(routingProfileArn, ArnFormat.SLASH_RESOURCE_NAME).resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a routing profile reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing routing profile
   * @returns An IRoutingProfile reference to the existing routing profile
   */
  public static fromRoutingProfileAttributes(
    scope: Construct,
    id: string,
    attrs: RoutingProfileAttributes,
  ): IRoutingProfile {
    return RoutingProfile.fromRoutingProfileArn(scope, id, attrs.routingProfileArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the routing profile resource.
   * @attribute
   */
  public readonly routingProfileArn: string;
  /**
   * The name of the routing profile.
   * @attribute
   */
  public readonly routingProfileName: string;
  /**
   * The description of the routing profile.
   */
  public readonly description: string;
  /**
   * The default outbound queue.
   */
  public readonly defaultOutboundQueue: IQueue;
  /**
   * The media concurrency configuration.
   */
  public readonly mediaConcurrencies: MediaConcurrency[];
  /**
   * The queue configurations.
   */
  public readonly queueConfigs?: RoutingProfileQueueConfig[];
  /**
   * The agent availability timer.
   */
  public readonly agentAvailabilityTimer?: AgentAvailabilityTimer;
  /**
   * Tags applied to this routing profile resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnRoutingProfile;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: RoutingProfileProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.routingProfileName = props.name;
    this.description = props.description;
    this.defaultOutboundQueue = props.defaultOutboundQueue;
    this.mediaConcurrencies = props.mediaConcurrencies;
    this.queueConfigs = props.queueConfigs;
    this.agentAvailabilityTimer = props.agentAvailabilityTimer;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateName();
    this._validateDescription();
    this._validateMediaConcurrencies();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnRoutingProfileProps = {
      instanceArn: this.instance.instanceArn,
      name: this.routingProfileName,
      description: this.description,
      defaultOutboundQueueArn: this.defaultOutboundQueue.queueArn,
      mediaConcurrencies: this._renderMediaConcurrencies(),
      queueConfigs: this.queueConfigs ? this._renderQueueConfigs() : undefined,
      agentAvailabilityTimer: this.agentAvailabilityTimer,
      tags: this.tags
        ? Object.entries(this.tags).map(([key, value]) => ({
          key,
          value,
        }))
        : undefined,
    };

    // ------------------------------------------------------
    // CFN Resource
    // ------------------------------------------------------
    this.__resource = new amazonConnect.CfnRoutingProfile(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.routingProfileArn = this.__resource.attrRoutingProfileArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the routing profile name.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateName = (): void => {
    const errors = validateStringFieldLength({
      value: this.routingProfileName,
      fieldName: 'name',
      minLength: PROFILE_NAME_MIN_LENGTH,
      maxLength: PROFILE_NAME_MAX_LENGTH,
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };

  /**
   * Validates the description.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateDescription = (): void => {
    const errors = validateStringFieldLength({
      value: this.description,
      fieldName: 'description',
      minLength: DESCRIPTION_MIN_LENGTH,
      maxLength: DESCRIPTION_MAX_LENGTH,
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };

  /**
   * Validates the media concurrencies.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateMediaConcurrencies = (): void => {
    const errors: string[] = [];

    if (!this.mediaConcurrencies || this.mediaConcurrencies.length === 0) {
      errors.push('At least one media concurrency must be configured');
    }

    this.mediaConcurrencies.forEach((mc, index) => {
      if (mc.channel === Channel.VOICE && mc.concurrency !== 1) {
        errors.push(`Media concurrency ${index}: VOICE channel concurrency must be exactly 1`);
      }

      if ((mc.channel === Channel.CHAT || mc.channel === Channel.TASK) && (mc.concurrency < 1 || mc.concurrency > 10)) {
        errors.push(`Media concurrency ${index}: ${mc.channel} channel concurrency must be between 1 and 10`);
      }

      if (mc.concurrency < 1) {
        errors.push(`Media concurrency ${index}: concurrency must be at least 1`);
      }
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };

  // ------------------------------------------------------
  // RENDERERS
  // ------------------------------------------------------
  /**
   * Render the media concurrencies.
   * @returns MediaConcurrencyProperty array in CloudFormation format
   * @internal This is an internal core function and should not be called directly.
   */
  private _renderMediaConcurrencies(): amazonConnect.CfnRoutingProfile.MediaConcurrencyProperty[] {
    return this.mediaConcurrencies.map((mc) => ({
      channel: mc.channel,
      concurrency: mc.concurrency,
      crossChannelBehavior: mc.crossChannelBehavior,
    }));
  }

  /**
   * Render the queue configurations.
   * @returns RoutingProfileQueueConfigProperty array in CloudFormation format
   * @internal This is an internal core function and should not be called directly.
   */
  private _renderQueueConfigs(): amazonConnect.CfnRoutingProfile.RoutingProfileQueueConfigProperty[] {
    return this.queueConfigs!.map((qc) => ({
      queueReference: {
        channel: qc.channel,
        queueArn: qc.queue.queueArn,
      },
      delay: qc.delay ?? 0,
      priority: qc.priority ?? 1,
    }));
  }
}
