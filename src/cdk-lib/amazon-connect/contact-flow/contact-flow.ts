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
 * Minimum length for contact flow name
 * @internal
 */
const FLOW_NAME_MIN_LENGTH = 1;
/**
 * Maximum length for contact flow name
 * @internal
 */
const FLOW_NAME_MAX_LENGTH = 127;
/**
 * Maximum length for description
 * @internal
 */
const DESCRIPTION_MAX_LENGTH = 500;
/**
 * Minimum length for content
 * @internal
 */
const CONTENT_MIN_LENGTH = 1;
/**
 * Maximum length for content
 * @internal
 */
const CONTENT_MAX_LENGTH = 256000;

/******************************************************************************
 *                              ENUMS
 *****************************************************************************/
/**
 * Contact flow types
 */
export enum ContactFlowType {
  /**
   * Standard contact flow
   */
  CONTACT_FLOW = 'CONTACT_FLOW',
  /**
   * Customer queue flow
   */
  CUSTOMER_QUEUE = 'CUSTOMER_QUEUE',
  /**
   * Customer hold flow
   */
  CUSTOMER_HOLD = 'CUSTOMER_HOLD',
  /**
   * Customer whisper flow
   */
  CUSTOMER_WHISPER = 'CUSTOMER_WHISPER',
  /**
   * Agent hold flow
   */
  AGENT_HOLD = 'AGENT_HOLD',
  /**
   * Agent whisper flow
   */
  AGENT_WHISPER = 'AGENT_WHISPER',
  /**
   * Outbound whisper flow
   */
  OUTBOUND_WHISPER = 'OUTBOUND_WHISPER',
  /**
   * Agent transfer flow
   */
  AGENT_TRANSFER = 'AGENT_TRANSFER',
  /**
   * Queue transfer flow
   */
  QUEUE_TRANSFER = 'QUEUE_TRANSFER',
  /**
   * Campaign flow
   */
  CAMPAIGN = 'CAMPAIGN',
}

/**
 * Contact flow state
 */
export enum ContactFlowState {
  /**
   * Active flow
   */
  ACTIVE = 'ACTIVE',
  /**
   * Archived flow
   */
  ARCHIVED = 'ARCHIVED',
}

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Interface for Amazon Connect Contact Flow resources
 */
export interface IContactFlow extends IResource {
  /**
   * The ARN of the contact flow resource
   * @attribute
   */
  readonly contactFlowArn: string;
  /**
   * The name of the contact flow
   * @attribute
   */
  readonly contactFlowName: string;
  /**
   * Grant the given principal identity permissions to perform actions on this contact flow.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect Contact Flow.
 * Contains methods and attributes valid for ContactFlow either created with CDK or imported.
 */
export abstract class ContactFlowBase extends Resource implements IContactFlow {
  public abstract readonly contactFlowArn: string;
  public abstract readonly contactFlowName: string;

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
      resourceArns: [this.contactFlowArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect Contact Flow resource
 */
export interface ContactFlowProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The name of the contact flow
   * @required yes
   * @default - no default
   */
  readonly name: string;
  /**
   * The type of contact flow
   * @required yes
   * @default - no default
   */
  readonly type: ContactFlowType;
  /**
   * The content of the contact flow (JSON definition)
   * @required yes
   * @default - no default
   */
  readonly content: string;
  /**
   * The description of the contact flow
   * @required no
   * @default - no description
   */
  readonly description?: string;
  /**
   * The state of the contact flow
   * @required no
   * @default - ACTIVE
   */
  readonly state?: ContactFlowState;
  /**
   * Tags to apply to the contact flow resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Contact Flow.
 */
export interface ContactFlowAttributes {
  /**
   * The ARN of the contact flow.
   * @attribute
   */
  readonly contactFlowArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Contact Flows define the customer experience when they interact with your contact center.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/connect-contact-flows.html
 * @resource AWS::Connect::ContactFlow
 */
export class ContactFlow extends ContactFlowBase {
  /**
   * Creates a contact flow reference from an existing contact flow ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param contactFlowArn - ARN of the existing contact flow
   * @returns An IContactFlow reference to the existing contact flow
   */
  public static fromContactFlowArn(scope: Construct, id: string, contactFlowArn: string): IContactFlow {
    class Import extends ContactFlowBase {
      public readonly contactFlowArn = contactFlowArn;
      public readonly contactFlowName = Arn.split(contactFlowArn, ArnFormat.SLASH_RESOURCE_NAME).resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a contact flow reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing contact flow
   * @returns An IContactFlow reference to the existing contact flow
   */
  public static fromContactFlowAttributes(scope: Construct, id: string, attrs: ContactFlowAttributes): IContactFlow {
    return ContactFlow.fromContactFlowArn(scope, id, attrs.contactFlowArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the contact flow resource.
   * @attribute
   */
  public readonly contactFlowArn: string;
  /**
   * The name of the contact flow.
   * @attribute
   */
  public readonly contactFlowName: string;
  /**
   * The type of contact flow.
   */
  public readonly type: ContactFlowType;
  /**
   * The content of the contact flow.
   */
  public readonly content: string;
  /**
   * The description of the contact flow.
   */
  public readonly description?: string;
  /**
   * The state of the contact flow.
   */
  public readonly state?: ContactFlowState;
  /**
   * Tags applied to this contact flow resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnContactFlow;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: ContactFlowProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.contactFlowName = props.name;
    this.type = props.type;
    this.content = props.content;
    this.description = props.description;
    this.state = props.state;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateName();
    this._validateDescription();
    this._validateContent();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnContactFlowProps = {
      instanceArn: this.instance.instanceArn,
      name: this.contactFlowName,
      type: this.type,
      content: this.content,
      description: this.description,
      state: this.state,
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
    this.__resource = new amazonConnect.CfnContactFlow(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.contactFlowArn = this.__resource.attrContactFlowArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the contact flow name.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateName = (): void => {
    const errors = validateStringFieldLength({
      value: this.contactFlowName,
      fieldName: 'name',
      minLength: FLOW_NAME_MIN_LENGTH,
      maxLength: FLOW_NAME_MAX_LENGTH,
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
        minLength: 0,
        maxLength: DESCRIPTION_MAX_LENGTH,
      });

      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    }
  };

  /**
   * Validates the contact flow content.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateContent = (): void => {
    const errors = validateStringFieldLength({
      value: this.content,
      fieldName: 'content',
      minLength: CONTENT_MIN_LENGTH,
      maxLength: CONTENT_MAX_LENGTH,
    });

    // Validate JSON
    try {
      JSON.parse(this.content);
    } catch (e) {
      errors.push(`Content must be valid JSON: ${e}`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };
}
