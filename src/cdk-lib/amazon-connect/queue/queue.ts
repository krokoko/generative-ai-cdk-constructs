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
import { IHoursOfOperation } from '../hours-of-operation/hours-of-operation';
import { IInstance } from '../instance/instance';
import { validateStringFieldLength } from '../validation-helpers';

/******************************************************************************
 *                              CONSTANTS
 *****************************************************************************/
/**
 * Minimum length for queue name
 * @internal
 */
const QUEUE_NAME_MIN_LENGTH = 1;
/**
 * Maximum length for queue name
 * @internal
 */
const QUEUE_NAME_MAX_LENGTH = 127;
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
 * Queue status
 */
export enum QueueStatus {
  /**
   * Queue is enabled and accepting contacts
   */
  ENABLED = 'ENABLED',
  /**
   * Queue is disabled
   */
  DISABLED = 'DISABLED',
}

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Outbound caller configuration for a queue
 */
export interface OutboundCallerConfig {
  /**
   * The caller ID name
   * @required no
   * @default - no caller ID name
   */
  readonly outboundCallerIdName?: string;
  /**
   * The ARN of the outbound caller ID number (phone number ARN without instance)
   * @required no
   * @default - no caller ID number
   */
  readonly outboundCallerIdNumberArn?: string;
  /**
   * The ARN of the outbound whisper flow
   * @required no
   * @default - no outbound flow
   */
  readonly outboundFlowArn?: string;
}

/**
 * Interface for Amazon Connect Queue resources
 */
export interface IQueue extends IResource {
  /**
   * The ARN of the queue resource
   * @attribute
   */
  readonly queueArn: string;
  /**
   * The name of the queue
   * @attribute
   */
  readonly queueName: string;
  /**
   * Grant the given principal identity permissions to perform actions on this queue.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect Queue.
 * Contains methods and attributes valid for Queue either created with CDK or imported.
 */
export abstract class QueueBase extends Resource implements IQueue {
  public abstract readonly queueArn: string;
  public abstract readonly queueName: string;

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
      resourceArns: [this.queueArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect Queue resource
 */
export interface QueueProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The name of the queue
   * @required yes
   * @default - no default
   */
  readonly name: string;
  /**
   * The hours of operation for the queue
   * @required yes
   * @default - no default
   */
  readonly hoursOfOperation: IHoursOfOperation;
  /**
   * The description of the queue
   * @required no
   * @default - no description
   */
  readonly description?: string;
  /**
   * The maximum number of contacts that can be in the queue before it is considered full
   * @required no
   * @default - no limit (0)
   */
  readonly maxContacts?: number;
  /**
   * The outbound caller ID configuration
   * @required no
   * @default - no outbound caller configuration
   */
  readonly outboundCallerConfig?: OutboundCallerConfig;
  /**
   * The status of the queue
   * @required no
   * @default - ENABLED
   */
  readonly status?: QueueStatus;
  /**
   * Tags to apply to the queue resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Queue.
 */
export interface QueueAttributes {
  /**
   * The ARN of the queue.
   * @attribute
   */
  readonly queueArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Queues hold contacts waiting to be answered by agents.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/create-queue.html
 * @resource AWS::Connect::Queue
 */
export class Queue extends QueueBase {
  /**
   * Creates a queue reference from an existing queue ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param queueArn - ARN of the existing queue
   * @returns An IQueue reference to the existing queue
   */
  public static fromQueueArn(scope: Construct, id: string, queueArn: string): IQueue {
    class Import extends QueueBase {
      public readonly queueArn = queueArn;
      public readonly queueName = Arn.split(queueArn, ArnFormat.SLASH_RESOURCE_NAME).resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a queue reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing queue
   * @returns An IQueue reference to the existing queue
   */
  public static fromQueueAttributes(scope: Construct, id: string, attrs: QueueAttributes): IQueue {
    return Queue.fromQueueArn(scope, id, attrs.queueArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the queue resource.
   * @attribute
   */
  public readonly queueArn: string;
  /**
   * The name of the queue.
   * @attribute
   */
  public readonly queueName: string;
  /**
   * The description of the queue.
   */
  public readonly description?: string;
  /**
   * The maximum number of contacts in the queue.
   */
  public readonly maxContacts?: number;
  /**
   * The outbound caller configuration.
   */
  public readonly outboundCallerConfig?: OutboundCallerConfig;
  /**
   * The status of the queue.
   */
  public readonly status?: QueueStatus;
  /**
   * Tags applied to this queue resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  /**
   * The hours of operation
   */
  private readonly hoursOfOperation: IHoursOfOperation;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnQueue;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: QueueProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.queueName = props.name;
    this.hoursOfOperation = props.hoursOfOperation;
    this.description = props.description;
    this.maxContacts = props.maxContacts;
    this.outboundCallerConfig = props.outboundCallerConfig;
    this.status = props.status;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateName();
    this._validateDescription();
    this._validateMaxContacts();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnQueueProps = {
      instanceArn: this.instance.instanceArn,
      name: this.queueName,
      hoursOfOperationArn: this.hoursOfOperation.hoursOfOperationArn,
      description: this.description,
      maxContacts: this.maxContacts,
      outboundCallerConfig: this.outboundCallerConfig
        ? {
          outboundCallerIdName: this.outboundCallerConfig.outboundCallerIdName,
          outboundCallerIdNumberArn: this.outboundCallerConfig.outboundCallerIdNumberArn,
          outboundFlowArn: this.outboundCallerConfig.outboundFlowArn,
        }
        : undefined,
      status: this.status,
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
    this.__resource = new amazonConnect.CfnQueue(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.queueArn = this.__resource.attrQueueArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the queue name.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateName = (): void => {
    const errors = validateStringFieldLength({
      value: this.queueName,
      fieldName: 'name',
      minLength: QUEUE_NAME_MIN_LENGTH,
      maxLength: QUEUE_NAME_MAX_LENGTH,
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
    if (this.description) {
      const errors = validateStringFieldLength({
        value: this.description,
        fieldName: 'description',
        minLength: DESCRIPTION_MIN_LENGTH,
        maxLength: DESCRIPTION_MAX_LENGTH,
      });

      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    }
  };

  /**
   * Validates the maximum contacts.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateMaxContacts = (): void => {
    if (this.maxContacts !== undefined && this.maxContacts < 0) {
      throw new Error('maxContacts must be greater than or equal to 0');
    }
  };
}
