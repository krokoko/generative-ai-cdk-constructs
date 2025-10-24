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
 * Minimum length for hours of operation name
 * @internal
 */
const HOURS_NAME_MIN_LENGTH = 1;
/**
 * Maximum length for hours of operation name
 * @internal
 */
const HOURS_NAME_MAX_LENGTH = 127;
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
 * Days of the week for hours of operation configuration
 */
export enum DayOfWeek {
  /**
   * Sunday
   */
  SUNDAY = 'SUNDAY',
  /**
   * Monday
   */
  MONDAY = 'MONDAY',
  /**
   * Tuesday
   */
  TUESDAY = 'TUESDAY',
  /**
   * Wednesday
   */
  WEDNESDAY = 'WEDNESDAY',
  /**
   * Thursday
   */
  THURSDAY = 'THURSDAY',
  /**
   * Friday
   */
  FRIDAY = 'FRIDAY',
  /**
   * Saturday
   */
  SATURDAY = 'SATURDAY',
}

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Time slice for hours of operation
 */
export interface HoursOfOperationTimeSlice {
  /**
   * Hours component (0-23)
   * @required yes
   * @default - no default
   */
  readonly hours: number;
  /**
   * Minutes component (0-59)
   * @required yes
   * @default - no default
   */
  readonly minutes: number;
}

/**
 * Configuration for a single day's hours of operation
 */
export interface HoursOfOperationConfig {
  /**
   * Day of the week
   * @required yes
   * @default - no default
   */
  readonly day: DayOfWeek;
  /**
   * Start time
   * @required yes
   * @default - no default
   */
  readonly startTime: HoursOfOperationTimeSlice;
  /**
   * End time
   * @required yes
   * @default - no default
   */
  readonly endTime: HoursOfOperationTimeSlice;
}

/**
 * Interface for Amazon Connect Hours of Operation resources
 */
export interface IHoursOfOperation extends IResource {
  /**
   * The ARN of the hours of operation resource
   * @attribute
   */
  readonly hoursOfOperationArn: string;
  /**
   * The name of the hours of operation
   * @attribute
   */
  readonly hoursOfOperationName: string;
  /**
   * Grant the given principal identity permissions to perform actions on this hours of operation.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect Hours of Operation.
 * Contains methods and attributes valid for HoursOfOperation either created with CDK or imported.
 */
export abstract class HoursOfOperationBase extends Resource implements IHoursOfOperation {
  public abstract readonly hoursOfOperationArn: string;
  public abstract readonly hoursOfOperationName: string;

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
      resourceArns: [this.hoursOfOperationArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect Hours of Operation resource
 */
export interface HoursOfOperationProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The name of the hours of operation
   * @required yes
   * @default - no default
   */
  readonly name: string;
  /**
   * The time zone identifier (e.g., "America/New_York")
   * Must be a valid IANA time zone name
   * @required yes
   * @default - no default
   */
  readonly timeZone: string;
  /**
   * The configuration for the hours of operation
   * @required yes
   * @default - no default
   */
  readonly config: HoursOfOperationConfig[];
  /**
   * The description of the hours of operation
   * @required no
   * @default - no description
   */
  readonly description?: string;
  /**
   * Tags to apply to the hours of operation resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Hours of Operation.
 */
export interface HoursOfOperationAttributes {
  /**
   * The ARN of the hours of operation.
   * @attribute
   */
  readonly hoursOfOperationArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Hours of Operation define when your contact center is open for business.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/set-hours-operation.html
 * @resource AWS::Connect::HoursOfOperation
 */
export class HoursOfOperation extends HoursOfOperationBase {
  /**
   * Creates an hours of operation reference from an existing hours of operation ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param hoursOfOperationArn - ARN of the existing hours of operation
   * @returns An IHoursOfOperation reference to the existing hours of operation
   */
  public static fromHoursOfOperationArn(
    scope: Construct,
    id: string,
    hoursOfOperationArn: string,
  ): IHoursOfOperation {
    class Import extends HoursOfOperationBase {
      public readonly hoursOfOperationArn = hoursOfOperationArn;
      public readonly hoursOfOperationName = Arn.split(hoursOfOperationArn, ArnFormat.SLASH_RESOURCE_NAME)
        .resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates an hours of operation reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing hours of operation
   * @returns An IHoursOfOperation reference to the existing hours of operation
   */
  public static fromHoursOfOperationAttributes(
    scope: Construct,
    id: string,
    attrs: HoursOfOperationAttributes,
  ): IHoursOfOperation {
    return HoursOfOperation.fromHoursOfOperationArn(scope, id, attrs.hoursOfOperationArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the hours of operation resource.
   * @attribute
   */
  public readonly hoursOfOperationArn: string;
  /**
   * The name of the hours of operation.
   * @attribute
   */
  public readonly hoursOfOperationName: string;
  /**
   * The description of the hours of operation.
   */
  public readonly description?: string;
  /**
   * The time zone identifier.
   */
  public readonly timeZone: string;
  /**
   * The configuration for the hours of operation.
   */
  public readonly config: HoursOfOperationConfig[];
  /**
   * Tags applied to this hours of operation resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnHoursOfOperation;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: HoursOfOperationProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.hoursOfOperationName = props.name;
    this.timeZone = props.timeZone;
    this.config = props.config;
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
    const cfnProps: amazonConnect.CfnHoursOfOperationProps = {
      instanceArn: this.instance.instanceArn,
      name: this.hoursOfOperationName,
      timeZone: this.timeZone,
      config: this._renderConfig(),
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
    this.__resource = new amazonConnect.CfnHoursOfOperation(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.hoursOfOperationArn = this.__resource.attrHoursOfOperationArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the hours of operation name.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateName = (): void => {
    const errors = validateStringFieldLength({
      value: this.hoursOfOperationName,
      fieldName: 'name',
      minLength: HOURS_NAME_MIN_LENGTH,
      maxLength: HOURS_NAME_MAX_LENGTH,
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
   * Validates the hours of operation configuration.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateConfig = (): void => {
    const errors: string[] = [];

    if (!this.config || this.config.length === 0) {
      errors.push('At least one hours of operation config entry is required');
    }

    if (this.config.length > 100) {
      errors.push('Maximum 100 hours of operation config entries allowed');
    }

    this.config.forEach((entry, index) => {
      // Validate hours
      if (entry.startTime.hours < 0 || entry.startTime.hours > 23) {
        errors.push(`Config entry ${index}: startTime hours must be between 0 and 23`);
      }
      if (entry.endTime.hours < 0 || entry.endTime.hours > 23) {
        errors.push(`Config entry ${index}: endTime hours must be between 0 and 23`);
      }

      // Validate minutes
      if (entry.startTime.minutes < 0 || entry.startTime.minutes > 59) {
        errors.push(`Config entry ${index}: startTime minutes must be between 0 and 59`);
      }
      if (entry.endTime.minutes < 0 || entry.endTime.minutes > 59) {
        errors.push(`Config entry ${index}: endTime minutes must be between 0 and 59`);
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
   * Render the hours of operation configuration.
   * @returns HoursOfOperationConfigProperty array in CloudFormation format
   * @internal This is an internal core function and should not be called directly.
   */
  private _renderConfig(): amazonConnect.CfnHoursOfOperation.HoursOfOperationConfigProperty[] {
    return this.config.map((entry) => ({
      day: entry.day,
      startTime: {
        hours: entry.startTime.hours,
        minutes: entry.startTime.minutes,
      },
      endTime: {
        hours: entry.endTime.hours,
        minutes: entry.endTime.minutes,
      },
    }));
  }
}
