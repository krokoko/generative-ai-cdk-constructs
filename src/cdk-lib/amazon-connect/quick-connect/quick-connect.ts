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
import { validateStringFieldLength } from '../validation-helpers';

/******************************************************************************
 *                              CONSTANTS
 *****************************************************************************/
/**
 * Minimum length for quick connect name
 * @internal
 */
const QC_NAME_MIN_LENGTH = 1;
/**
 * Maximum length for quick connect name
 * @internal
 */
const QC_NAME_MAX_LENGTH = 127;
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
 * Quick connect types
 */
export enum QuickConnectType {
  /**
   * Phone number quick connect
   */
  PHONE_NUMBER = 'PHONE_NUMBER',
  /**
   * Queue quick connect
   */
  QUEUE = 'QUEUE',
  /**
   * User quick connect
   */
  USER = 'USER',
}

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Phone number quick connect configuration
 */
export interface PhoneNumberQuickConnectConfig {
  /**
   * The phone number in E.164 format
   * @required yes
   * @default - no default
   */
  readonly phoneNumber: string;
}

/**
 * Queue quick connect configuration
 */
export interface QueueQuickConnectConfig {
  /**
   * The ARN of the queue
   * @required yes
   * @default - no default
   */
  readonly queueArn: string;
  /**
   * The ARN of the contact flow
   * @required yes
   * @default - no default
   */
  readonly contactFlowArn: string;
}

/**
 * User quick connect configuration
 */
export interface UserQuickConnectConfig {
  /**
   * The ARN of the user
   * @required yes
   * @default - no default
   */
  readonly userArn: string;
  /**
   * The ARN of the contact flow
   * @required yes
   * @default - no default
   */
  readonly contactFlowArn: string;
}

/**
 * Quick connect configuration
 */
export interface QuickConnectConfig {
  /**
   * The type of quick connect
   * @required yes
   * @default - no default
   */
  readonly quickConnectType: QuickConnectType;
  /**
   * Phone number configuration (required if type is PHONE_NUMBER)
   * @required conditional
   * @default - no default
   */
  readonly phoneConfig?: PhoneNumberQuickConnectConfig;
  /**
   * Queue configuration (required if type is QUEUE)
   * @required conditional
   * @default - no default
   */
  readonly queueConfig?: QueueQuickConnectConfig;
  /**
   * User configuration (required if type is USER)
   * @required conditional
   * @default - no default
   */
  readonly userConfig?: UserQuickConnectConfig;
}

/**
 * Interface for Amazon Connect Quick Connect resources
 */
export interface IQuickConnect extends IResource {
  /**
   * The ARN of the quick connect resource
   * @attribute
   */
  readonly quickConnectArn: string;
  /**
   * The name of the quick connect
   * @attribute
   */
  readonly quickConnectName: string;
  /**
   * Grant the given principal identity permissions to perform actions on this quick connect.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect Quick Connect.
 * Contains methods and attributes valid for QuickConnect either created with CDK or imported.
 */
export abstract class QuickConnectBase extends Resource implements IQuickConnect {
  public abstract readonly quickConnectArn: string;
  public abstract readonly quickConnectName: string;

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
      resourceArns: [this.quickConnectArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect Quick Connect resource
 */
export interface QuickConnectProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The name of the quick connect
   * @required yes
   * @default - no default
   */
  readonly name: string;
  /**
   * The quick connect configuration
   * @required yes
   * @default - no default
   */
  readonly quickConnectConfig: QuickConnectConfig;
  /**
   * The description of the quick connect
   * @required no
   * @default - no description
   */
  readonly description?: string;
  /**
   * Tags to apply to the quick connect resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Quick Connect.
 */
export interface QuickConnectAttributes {
  /**
   * The ARN of the quick connect.
   * @attribute
   */
  readonly quickConnectArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Quick Connects allow agents to quickly transfer contacts to other agents, queues, or external numbers.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/quick-connects.html
 * @resource AWS::Connect::QuickConnect
 */
export class QuickConnect extends QuickConnectBase {
  /**
   * Creates a quick connect reference from an existing quick connect ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param quickConnectArn - ARN of the existing quick connect
   * @returns An IQuickConnect reference to the existing quick connect
   */
  public static fromQuickConnectArn(scope: Construct, id: string, quickConnectArn: string): IQuickConnect {
    class Import extends QuickConnectBase {
      public readonly quickConnectArn = quickConnectArn;
      public readonly quickConnectName = Arn.split(quickConnectArn, ArnFormat.SLASH_RESOURCE_NAME).resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a quick connect reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing quick connect
   * @returns An IQuickConnect reference to the existing quick connect
   */
  public static fromQuickConnectAttributes(scope: Construct, id: string, attrs: QuickConnectAttributes): IQuickConnect {
    return QuickConnect.fromQuickConnectArn(scope, id, attrs.quickConnectArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the quick connect resource.
   * @attribute
   */
  public readonly quickConnectArn: string;
  /**
   * The name of the quick connect.
   * @attribute
   */
  public readonly quickConnectName: string;
  /**
   * The quick connect configuration.
   */
  public readonly quickConnectConfig: QuickConnectConfig;
  /**
   * The description of the quick connect.
   */
  public readonly description?: string;
  /**
   * Tags applied to this quick connect resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnQuickConnect;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: QuickConnectProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.quickConnectName = props.name;
    this.quickConnectConfig = props.quickConnectConfig;
    this.description = props.description;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateName();
    this._validateDescription();
    this._validateConfig();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnQuickConnectProps = {
      instanceArn: this.instance.instanceArn,
      name: this.quickConnectName,
      quickConnectConfig: this._renderConfig(),
      description: this.description,
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
    this.__resource = new amazonConnect.CfnQuickConnect(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.quickConnectArn = this.__resource.attrQuickConnectArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the quick connect name.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateName = (): void => {
    const errors = validateStringFieldLength({
      value: this.quickConnectName,
      fieldName: 'name',
      minLength: QC_NAME_MIN_LENGTH,
      maxLength: QC_NAME_MAX_LENGTH,
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
   * Validates the quick connect configuration.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateConfig = (): void => {
    const { quickConnectType, phoneConfig, queueConfig, userConfig } = this.quickConnectConfig;

    if (quickConnectType === QuickConnectType.PHONE_NUMBER && !phoneConfig) {
      throw new Error('phoneConfig is required when quickConnectType is PHONE_NUMBER');
    }

    if (quickConnectType === QuickConnectType.QUEUE && !queueConfig) {
      throw new Error('queueConfig is required when quickConnectType is QUEUE');
    }

    if (quickConnectType === QuickConnectType.USER && !userConfig) {
      throw new Error('userConfig is required when quickConnectType is USER');
    }
  };

  // ------------------------------------------------------
  // RENDERERS
  // ------------------------------------------------------
  /**
   * Render the quick connect configuration.
   * @returns QuickConnectConfigProperty in CloudFormation format
   * @internal This is an internal core function and should not be called directly.
   */
  private _renderConfig(): amazonConnect.CfnQuickConnect.QuickConnectConfigProperty {
    const config: any = {
      quickConnectType: this.quickConnectConfig.quickConnectType,
    };

    if (this.quickConnectConfig.phoneConfig) {
      config.phoneConfig = {
        phoneNumber: this.quickConnectConfig.phoneConfig.phoneNumber,
      };
    }

    if (this.quickConnectConfig.queueConfig) {
      config.queueConfig = {
        queueArn: this.quickConnectConfig.queueConfig.queueArn,
        contactFlowArn: this.quickConnectConfig.queueConfig.contactFlowArn,
      };
    }

    if (this.quickConnectConfig.userConfig) {
      config.userConfig = {
        userArn: this.quickConnectConfig.userConfig.userArn,
        contactFlowArn: this.quickConnectConfig.userConfig.contactFlowArn,
      };
    }

    return config;
  }
}
