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

import { IResource, Resource } from 'aws-cdk-lib';
import * as amazonConnect from 'aws-cdk-lib/aws-connect';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
// Internal libs
import { validateFieldPattern, validateStringFieldLength } from '../validation-helpers';

/******************************************************************************
 *                              CONSTANTS
 *****************************************************************************/
/**
 * Minimum length for description
 * @internal
 */
const DESCRIPTION_MIN_LENGTH = 1;
/**
 * Maximum length for description
 * @internal
 */
const DESCRIPTION_MAX_LENGTH = 500;

/******************************************************************************
 *                              ENUMS
 *****************************************************************************/
/**
 * Phone number types
 */
export enum PhoneNumberType {
  /**
   * Toll-free number
   */
  TOLL_FREE = 'TOLL_FREE',
  /**
   * Direct Inward Dialing
   */
  DID = 'DID',
  /**
   * Universal International Freephone Number
   */
  UIFN = 'UIFN',
  /**
   * Shared phone number
   */
  SHARED = 'SHARED',
  /**
   * Third-party DID
   */
  THIRD_PARTY_DID = 'THIRD_PARTY_DID',
  /**
   * Third-party toll-free
   */
  THIRD_PARTY_TF = 'THIRD_PARTY_TF',
  /**
   * Short code
   */
  SHORT_CODE = 'SHORT_CODE',
}

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Interface for Amazon Connect Phone Number resources
 */
export interface IPhoneNumber extends IResource {
  /**
   * The ARN of the phone number resource
   * @attribute
   */
  readonly phoneNumberArn: string;
  /**
   * The phone number (E.164 format)
   * @attribute
   */
  readonly address: string;
  /**
   * Grant the given principal identity permissions to perform actions on this phone number.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect Phone Number.
 * Contains methods and attributes valid for PhoneNumber either created with CDK or imported.
 */
export abstract class PhoneNumberBase extends Resource implements IPhoneNumber {
  public abstract readonly phoneNumberArn: string;
  public abstract readonly address: string;

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
      resourceArns: [this.phoneNumberArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect Phone Number resource
 */
export interface PhoneNumberProps {
  /**
   * The Amazon Connect instance or traffic distribution group ARN
   * @required yes
   * @default - no default
   */
  readonly targetArn: string;
  /**
   * The ISO country code (2 letters)
   * Required if not importing a phone number
   * @required conditional
   * @default - no default
   */
  readonly countryCode?: string;
  /**
   * The type of phone number
   * Required if not importing a phone number
   * @required conditional
   * @default - no default
   */
  readonly type?: PhoneNumberType;
  /**
   * The phone number prefix (includes + and country code)
   * @required no
   * @default - no prefix
   */
  readonly prefix?: string;
  /**
   * The ARN of a phone number to import
   * Use this to import an existing phone number
   * @required conditional
   * @default - no default
   */
  readonly sourcePhoneNumberArn?: string;
  /**
   * The description of the phone number
   * @required no
   * @default - no description
   */
  readonly description?: string;
  /**
   * Tags to apply to the phone number resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Phone Number.
 */
export interface PhoneNumberAttributes {
  /**
   * The ARN of the phone number.
   * @attribute
   */
  readonly phoneNumberArn: string;
  /**
   * The phone number address (E.164 format).
   * @attribute
   */
  readonly address: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Phone Numbers are used for inbound and outbound calls.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/contact-center-phone-number.html
 * @resource AWS::Connect::PhoneNumber
 */
export class PhoneNumber extends PhoneNumberBase {
  /**
   * Creates a phone number reference from an existing phone number ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param phoneNumberArn - ARN of the existing phone number
   * @param address - The phone number address (E.164 format)
   * @returns An IPhoneNumber reference to the existing phone number
   */
  public static fromPhoneNumberArn(scope: Construct, id: string, phoneNumberArn: string, address: string): IPhoneNumber {
    class Import extends PhoneNumberBase {
      public readonly phoneNumberArn = phoneNumberArn;
      public readonly address = address;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a phone number reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing phone number
   * @returns An IPhoneNumber reference to the existing phone number
   */
  public static fromPhoneNumberAttributes(scope: Construct, id: string, attrs: PhoneNumberAttributes): IPhoneNumber {
    return PhoneNumber.fromPhoneNumberArn(scope, id, attrs.phoneNumberArn, attrs.address);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the phone number resource.
   * @attribute
   */
  public readonly phoneNumberArn: string;
  /**
   * The phone number address (E.164 format).
   * @attribute
   */
  public readonly address: string;
  /**
   * The target ARN (instance or traffic distribution group).
   */
  public readonly targetArn: string;
  /**
   * The ISO country code.
   */
  public readonly countryCode?: string;
  /**
   * The type of phone number.
   */
  public readonly type?: PhoneNumberType;
  /**
   * The phone number prefix.
   */
  public readonly prefix?: string;
  /**
   * The source phone number ARN (for imports).
   */
  public readonly sourcePhoneNumberArn?: string;
  /**
   * The description of the phone number.
   */
  public readonly description?: string;
  /**
   * Tags applied to this phone number resource
   */
  public readonly tags?: { [key: string]: string };
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnPhoneNumber;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: PhoneNumberProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.targetArn = props.targetArn;
    this.countryCode = props.countryCode;
    this.type = props.type;
    this.prefix = props.prefix;
    this.sourcePhoneNumberArn = props.sourcePhoneNumberArn;
    this.description = props.description;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateConfiguration();
    this._validateDescription();
    this._validatePrefix();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnPhoneNumberProps = {
      targetArn: this.targetArn,
      countryCode: this.countryCode,
      type: this.type,
      prefix: this.prefix,
      sourcePhoneNumberArn: this.sourcePhoneNumberArn,
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
    this.__resource = new amazonConnect.CfnPhoneNumber(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.phoneNumberArn = this.__resource.attrPhoneNumberArn;
    this.address = this.__resource.attrAddress;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the phone number configuration.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateConfiguration = (): void => {
    const hasSourceArn = !!this.sourcePhoneNumberArn;
    const hasCountryAndType = !!this.countryCode && !!this.type;

    if (!hasSourceArn && !hasCountryAndType) {
      throw new Error('Either sourcePhoneNumberArn OR (countryCode AND type) must be provided');
    }

    if (hasSourceArn && hasCountryAndType) {
      throw new Error('Cannot specify both sourcePhoneNumberArn and (countryCode/type)');
    }

    // Validate country code pattern if provided
    if (this.countryCode) {
      const countryCodePattern = /^[A-Z]{2}$/;
      const errors = validateFieldPattern(this.countryCode, 'countryCode', countryCodePattern);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
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
   * Validates the prefix.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validatePrefix = (): void => {
    if (this.prefix) {
      // Prefix must start with + and contain only digits
      const prefixPattern = /^\+[0-9]{1,15}$/;
      const errors = validateFieldPattern(this.prefix, 'prefix', prefixPattern);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    }
  };
}
