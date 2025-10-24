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
import { validateFieldPattern, validateStringFieldLength } from '../validation-helpers';

/******************************************************************************
 *                              CONSTANTS
 *****************************************************************************/
/**
 * Minimum length for security profile name
 * @internal
 */
const PROFILE_NAME_MIN_LENGTH = 1;
/**
 * Maximum length for security profile name
 * @internal
 */
const PROFILE_NAME_MAX_LENGTH = 127;
/**
 * Maximum length for description
 * @internal
 */
const DESCRIPTION_MAX_LENGTH = 250;
/**
 * Maximum number of permissions
 * @internal
 */
const MAX_PERMISSIONS = 500;

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Interface for Amazon Connect Security Profile resources
 */
export interface ISecurityProfile extends IResource {
  /**
   * The ARN of the security profile resource
   * @attribute
   */
  readonly securityProfileArn: string;
  /**
   * The name of the security profile
   * @attribute
   */
  readonly securityProfileName: string;
  /**
   * Grant the given principal identity permissions to perform actions on this security profile.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect Security Profile.
 * Contains methods and attributes valid for SecurityProfile either created with CDK or imported.
 */
export abstract class SecurityProfileBase extends Resource implements ISecurityProfile {
  public abstract readonly securityProfileArn: string;
  public abstract readonly securityProfileName: string;

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
      resourceArns: [this.securityProfileArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect Security Profile resource
 */
export interface SecurityProfileProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The name of the security profile
   * Pattern: ^[ a-zA-Z0-9_@-]+$
   * @required yes
   * @default - no default
   */
  readonly securityProfileName: string;
  /**
   * The description of the security profile
   * @required no
   * @default - no description
   */
  readonly description?: string;
  /**
   * The list of permissions assigned to the security profile
   * Maximum 500 permissions
   * @required no
   * @default - no permissions
   */
  readonly permissions?: string[];
  /**
   * Tags to apply to the security profile resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect Security Profile.
 */
export interface SecurityProfileAttributes {
  /**
   * The ARN of the security profile.
   * @attribute
   */
  readonly securityProfileArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect Security Profiles control what users can do and see in Amazon Connect.
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/connect-security-profiles.html
 * @resource AWS::Connect::SecurityProfile
 */
export class SecurityProfile extends SecurityProfileBase {
  /**
   * Creates a security profile reference from an existing security profile ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param securityProfileArn - ARN of the existing security profile
   * @returns An ISecurityProfile reference to the existing security profile
   */
  public static fromSecurityProfileArn(
    scope: Construct,
    id: string,
    securityProfileArn: string,
  ): ISecurityProfile {
    class Import extends SecurityProfileBase {
      public readonly securityProfileArn = securityProfileArn;
      public readonly securityProfileName = Arn.split(securityProfileArn, ArnFormat.SLASH_RESOURCE_NAME)
        .resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a security profile reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing security profile
   * @returns An ISecurityProfile reference to the existing security profile
   */
  public static fromSecurityProfileAttributes(
    scope: Construct,
    id: string,
    attrs: SecurityProfileAttributes,
  ): ISecurityProfile {
    return SecurityProfile.fromSecurityProfileArn(scope, id, attrs.securityProfileArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the security profile resource.
   * @attribute
   */
  public readonly securityProfileArn: string;
  /**
   * The name of the security profile.
   * @attribute
   */
  public readonly securityProfileName: string;
  /**
   * The description of the security profile.
   */
  public readonly description?: string;
  /**
   * The list of permissions assigned to the security profile.
   */
  public readonly permissions?: string[];
  /**
   * Tags applied to this security profile resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnSecurityProfile;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: SecurityProfileProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.securityProfileName = props.securityProfileName;
    this.description = props.description;
    this.permissions = props.permissions;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateName();
    this._validateDescription();
    this._validatePermissions();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnSecurityProfileProps = {
      instanceArn: this.instance.instanceArn,
      securityProfileName: this.securityProfileName,
      description: this.description,
      permissions: this.permissions,
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
    this.__resource = new amazonConnect.CfnSecurityProfile(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.securityProfileArn = this.__resource.attrSecurityProfileArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the security profile name.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateName = (): void => {
    const errors = validateStringFieldLength({
      value: this.securityProfileName,
      fieldName: 'securityProfileName',
      minLength: PROFILE_NAME_MIN_LENGTH,
      maxLength: PROFILE_NAME_MAX_LENGTH,
    });

    // Pattern: ^[ a-zA-Z0-9_@-]+$
    const validNamePattern = /^[ a-zA-Z0-9_@-]+$/;
    errors.push(...validateFieldPattern(this.securityProfileName, 'securityProfileName', validNamePattern));

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
   * Validates the permissions.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validatePermissions = (): void => {
    if (this.permissions && this.permissions.length > MAX_PERMISSIONS) {
      throw new Error(`Maximum ${MAX_PERMISSIONS} permissions allowed, but ${this.permissions.length} provided`);
    }
  };
}
