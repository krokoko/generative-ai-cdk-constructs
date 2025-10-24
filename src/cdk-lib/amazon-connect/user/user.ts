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
import { IRoutingProfile } from '../routing-profile/routing-profile';
import { ISecurityProfile } from '../security-profile/security-profile';
import { IUserHierarchyGroup } from '../user-hierarchy-group/user-hierarchy-group';
import { validateFieldPattern, validateStringFieldLength } from '../validation-helpers';

/******************************************************************************
 *                              CONSTANTS
 *****************************************************************************/
/**
 * Minimum length for username
 * @internal
 */
const USERNAME_MIN_LENGTH = 1;
/**
 * Maximum length for username
 * @internal
 */
const USERNAME_MAX_LENGTH = 64;
/**
 * Minimum length for password
 * @internal
 */
const PASSWORD_MIN_LENGTH = 8;
/**
 * Maximum length for password
 * @internal
 */
const PASSWORD_MAX_LENGTH = 64;
/**
 * Maximum length for first name
 * @internal
 */
const FIRST_NAME_MAX_LENGTH = 255;
/**
 * Maximum length for last name
 * @internal
 */
const LAST_NAME_MAX_LENGTH = 300;

/******************************************************************************
 *                              ENUMS
 *****************************************************************************/
/**
 * Phone types for users
 */
export enum PhoneType {
  /**
   * Soft phone (browser-based)
   */
  SOFT_PHONE = 'SOFT_PHONE',
  /**
   * Desk phone
   */
  DESK_PHONE = 'DESK_PHONE',
}

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * User phone configuration
 */
export interface UserPhoneConfig {
  /**
   * The phone type
   * @required yes
   * @default - no default
   */
  readonly phoneType: PhoneType;
  /**
   * Auto-accept calls
   * @required no
   * @default - false
   */
  readonly autoAccept?: boolean;
  /**
   * After contact work time limit in seconds
   * @required no
   * @default - no limit
   */
  readonly afterContactWorkTimeLimit?: number;
  /**
   * Desk phone number (required if phoneType is DESK_PHONE)
   * Must be in E.164 format
   * @required conditional
   * @default - no default
   */
  readonly deskPhoneNumber?: string;
}

/**
 * User identity information
 */
export interface UserIdentityInfo {
  /**
   * First name (required for SAML)
   * @required conditional
   * @default - no default
   */
  readonly firstName?: string;
  /**
   * Last name (required for SAML)
   * @required conditional
   * @default - no default
   */
  readonly lastName?: string;
  /**
   * Email (cannot be used with SAML)
   * @required no
   * @default - no default
   */
  readonly email?: string;
  /**
   * Mobile phone number (E.164 format)
   * @required no
   * @default - no default
   */
  readonly mobile?: string;
  /**
   * Secondary email
   * @required no
   * @default - no default
   */
  readonly secondaryEmail?: string;
}

/**
 * Interface for Amazon Connect User resources
 */
export interface IUser extends IResource {
  /**
   * The ARN of the user resource
   * @attribute
   */
  readonly userArn: string;
  /**
   * The username
   * @attribute
   */
  readonly username: string;
  /**
   * Grant the given principal identity permissions to perform actions on this user.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect User.
 * Contains methods and attributes valid for User either created with CDK or imported.
 */
export abstract class UserBase extends Resource implements IUser {
  public abstract readonly userArn: string;
  public abstract readonly username: string;

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
      resourceArns: [this.userArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect User resource
 */
export interface UserProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The username for the user
   * Pattern: [a-zA-Z0-9\_\-\.\@]+
   * @required yes
   * @default - no default
   */
  readonly username: string;
  /**
   * The routing profile
   * @required yes
   * @default - no default
   */
  readonly routingProfile: IRoutingProfile;
  /**
   * The security profiles (1-10 profiles)
   * @required yes
   * @default - no default
   */
  readonly securityProfiles: ISecurityProfile[];
  /**
   * The phone configuration
   * @required yes
   * @default - no default
   */
  readonly phoneConfig: UserPhoneConfig;
  /**
   * The identity information
   * @required no
   * @default - no identity info
   */
  readonly identityInfo?: UserIdentityInfo;
  /**
   * The password (8-64 characters, must include uppercase, lowercase, number)
   * @required no
   * @default - no password
   */
  readonly password?: string;
  /**
   * The directory user ID
   * @required no
   * @default - no directory user ID
   */
  readonly directoryUserId?: string;
  /**
   * The hierarchy group
   * @required no
   * @default - no hierarchy group
   */
  readonly hierarchyGroup?: IUserHierarchyGroup;
  /**
   * Tags to apply to the user resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect User.
 */
export interface UserAttributes {
  /**
   * The ARN of the user.
   * @attribute
   */
  readonly userArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Users are agents, managers, and administrators who need access to Amazon Connect.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/user-management.html
 * @resource AWS::Connect::User
 */
export class User extends UserBase {
  /**
   * Creates a user reference from an existing user ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param userArn - ARN of the existing user
   * @returns An IUser reference to the existing user
   */
  public static fromUserArn(scope: Construct, id: string, userArn: string): IUser {
    class Import extends UserBase {
      public readonly userArn = userArn;
      public readonly username = Arn.split(userArn, ArnFormat.SLASH_RESOURCE_NAME).resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a user reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing user
   * @returns An IUser reference to the existing user
   */
  public static fromUserAttributes(scope: Construct, id: string, attrs: UserAttributes): IUser {
    return User.fromUserArn(scope, id, attrs.userArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the user resource.
   * @attribute
   */
  public readonly userArn: string;
  /**
   * The username.
   * @attribute
   */
  public readonly username: string;
  /**
   * The routing profile.
   */
  public readonly routingProfile: IRoutingProfile;
  /**
   * The security profiles.
   */
  public readonly securityProfiles: ISecurityProfile[];
  /**
   * The phone configuration.
   */
  public readonly phoneConfig: UserPhoneConfig;
  /**
   * The identity information.
   */
  public readonly identityInfo?: UserIdentityInfo;
  /**
   * The password.
   */
  public readonly password?: string;
  /**
   * The directory user ID.
   */
  public readonly directoryUserId?: string;
  /**
   * The hierarchy group.
   */
  public readonly hierarchyGroup?: IUserHierarchyGroup;
  /**
   * Tags applied to this user resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnUser;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: UserProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.username = props.username;
    this.routingProfile = props.routingProfile;
    this.securityProfiles = props.securityProfiles;
    this.phoneConfig = props.phoneConfig;
    this.identityInfo = props.identityInfo;
    this.password = props.password;
    this.directoryUserId = props.directoryUserId;
    this.hierarchyGroup = props.hierarchyGroup;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateUsername();
    this._validatePassword();
    this._validateSecurityProfiles();
    this._validatePhoneConfig();
    this._validateIdentityInfo();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnUserProps = {
      instanceArn: this.instance.instanceArn,
      username: this.username,
      routingProfileArn: this.routingProfile.routingProfileArn,
      securityProfileArns: this.securityProfiles.map((sp) => sp.securityProfileArn),
      phoneConfig: this._renderPhoneConfig(),
      identityInfo: this.identityInfo ? this._renderIdentityInfo() : undefined,
      password: this.password,
      directoryUserId: this.directoryUserId,
      hierarchyGroupArn: this.hierarchyGroup?.userHierarchyGroupArn,
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
    this.__resource = new amazonConnect.CfnUser(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.userArn = this.__resource.attrUserArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the username.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateUsername = (): void => {
    const errors = validateStringFieldLength({
      value: this.username,
      fieldName: 'username',
      minLength: USERNAME_MIN_LENGTH,
      maxLength: USERNAME_MAX_LENGTH,
    });

    // Pattern: [a-zA-Z0-9\_\-\.\@]+
    const usernamePattern = /^[a-zA-Z0-9_\-\.@]+$/;
    errors.push(...validateFieldPattern(this.username, 'username', usernamePattern));

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };

  /**
   * Validates the password.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validatePassword = (): void => {
    if (this.password) {
      const errors = validateStringFieldLength({
        value: this.password,
        fieldName: 'password',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
      });

      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    }
  };

  /**
   * Validates the security profiles.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateSecurityProfiles = (): void => {
    if (!this.securityProfiles || this.securityProfiles.length === 0) {
      throw new Error('At least one security profile is required');
    }

    if (this.securityProfiles.length > 10) {
      throw new Error('Maximum 10 security profiles allowed');
    }
  };

  /**
   * Validates the phone configuration.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validatePhoneConfig = (): void => {
    if (this.phoneConfig.phoneType === PhoneType.DESK_PHONE && !this.phoneConfig.deskPhoneNumber) {
      throw new Error('deskPhoneNumber is required when phoneType is DESK_PHONE');
    }

    if (this.phoneConfig.deskPhoneNumber) {
      // Validate E.164 format
      const e164Pattern = /^\+[1-9]\d{1,14}$/;
      const errors = validateFieldPattern(this.phoneConfig.deskPhoneNumber, 'deskPhoneNumber', e164Pattern);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    }

    if (
      this.phoneConfig.afterContactWorkTimeLimit !== undefined &&
      (this.phoneConfig.afterContactWorkTimeLimit < 0 || this.phoneConfig.afterContactWorkTimeLimit > 2000000)
    ) {
      throw new Error('afterContactWorkTimeLimit must be between 0 and 2,000,000 seconds');
    }
  };

  /**
   * Validates the identity information.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateIdentityInfo = (): void => {
    if (this.identityInfo) {
      const errors: string[] = [];

      if (this.identityInfo.firstName) {
        errors.push(
          ...validateStringFieldLength({
            value: this.identityInfo.firstName,
            fieldName: 'firstName',
            minLength: 0,
            maxLength: FIRST_NAME_MAX_LENGTH,
          }),
        );
      }

      if (this.identityInfo.lastName) {
        errors.push(
          ...validateStringFieldLength({
            value: this.identityInfo.lastName,
            fieldName: 'lastName',
            minLength: 0,
            maxLength: LAST_NAME_MAX_LENGTH,
          }),
        );
      }

      if (this.identityInfo.mobile) {
        const mobilePattern = /^\+[1-9]\d{1,14}$/;
        errors.push(...validateFieldPattern(this.identityInfo.mobile, 'mobile', mobilePattern));
      }

      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    }
  };

  // ------------------------------------------------------
  // RENDERERS
  // ------------------------------------------------------
  /**
   * Render the phone configuration.
   * @returns UserPhoneConfigProperty in CloudFormation format
   * @internal This is an internal core function and should not be called directly.
   */
  private _renderPhoneConfig(): amazonConnect.CfnUser.UserPhoneConfigProperty {
    return {
      phoneType: this.phoneConfig.phoneType,
      autoAccept: this.phoneConfig.autoAccept,
      afterContactWorkTimeLimit: this.phoneConfig.afterContactWorkTimeLimit,
      deskPhoneNumber: this.phoneConfig.deskPhoneNumber,
    };
  }

  /**
   * Render the identity information.
   * @returns UserIdentityInfoProperty in CloudFormation format
   * @internal This is an internal core function and should not be called directly.
   */
  private _renderIdentityInfo(): amazonConnect.CfnUser.UserIdentityInfoProperty {
    return {
      firstName: this.identityInfo!.firstName,
      lastName: this.identityInfo!.lastName,
      email: this.identityInfo!.email,
      mobile: this.identityInfo!.mobile,
      secondaryEmail: this.identityInfo!.secondaryEmail,
    };
  }
}
