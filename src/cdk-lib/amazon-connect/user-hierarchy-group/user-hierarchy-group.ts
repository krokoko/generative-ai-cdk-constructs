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
 * Minimum length for hierarchy group name
 * @internal
 */
const GROUP_NAME_MIN_LENGTH = 1;
/**
 * Maximum length for hierarchy group name
 * @internal
 */
const GROUP_NAME_MAX_LENGTH = 100;

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Interface for Amazon Connect User Hierarchy Group resources
 */
export interface IUserHierarchyGroup extends IResource {
  /**
   * The ARN of the user hierarchy group resource
   * @attribute
   */
  readonly userHierarchyGroupArn: string;
  /**
   * The name of the user hierarchy group
   * @attribute
   */
  readonly userHierarchyGroupName: string;
  /**
   * Grant the given principal identity permissions to perform actions on this user hierarchy group.
   */
  grant(grantee: iam.IGrantable, ...actions: string[]): iam.Grant;
}

/******************************************************************************
 *                        ABSTRACT BASE CLASS
 *****************************************************************************/
/**
 * Abstract base class for Amazon Connect User Hierarchy Group.
 * Contains methods and attributes valid for UserHierarchyGroup either created with CDK or imported.
 */
export abstract class UserHierarchyGroupBase extends Resource implements IUserHierarchyGroup {
  public abstract readonly userHierarchyGroupArn: string;
  public abstract readonly userHierarchyGroupName: string;

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
      resourceArns: [this.userHierarchyGroupArn],
      scope: this,
    });
  }
}

/******************************************************************************
 *                        PROPS FOR NEW CONSTRUCT
 *****************************************************************************/
/**
 * Properties for creating an Amazon Connect User Hierarchy Group resource
 */
export interface UserHierarchyGroupProps {
  /**
   * The Amazon Connect instance
   * @required yes
   * @default - no default
   */
  readonly instance: IInstance;
  /**
   * The name of the user hierarchy group
   * @required yes
   * @default - no default
   */
  readonly name: string;
  /**
   * The parent hierarchy group
   * @required no
   * @default - no parent (root level)
   */
  readonly parentGroup?: IUserHierarchyGroup;
  /**
   * Tags to apply to the user hierarchy group resource
   * @required no
   * @default - no tags
   */
  readonly tags?: { [key: string]: string };
}

/******************************************************************************
 *                      ATTRS FOR IMPORTED CONSTRUCT
 *****************************************************************************/
/**
 * Attributes for specifying an imported Amazon Connect User Hierarchy Group.
 */
export interface UserHierarchyGroupAttributes {
  /**
   * The ARN of the user hierarchy group.
   * @attribute
   */
  readonly userHierarchyGroupArn: string;
}

/******************************************************************************
 *                                Class
 *****************************************************************************/
/**
 * Amazon Connect User Hierarchy Groups organize users into reporting structures (up to 5 levels).
 *
 * @see https://docs.aws.amazon.com/connect/latest/adminguide/agent-hierarchy.html
 * @resource AWS::Connect::UserHierarchyGroup
 */
export class UserHierarchyGroup extends UserHierarchyGroupBase {
  /**
   * Creates a user hierarchy group reference from an existing group ARN.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param userHierarchyGroupArn - ARN of the existing user hierarchy group
   * @returns An IUserHierarchyGroup reference to the existing group
   */
  public static fromUserHierarchyGroupArn(
    scope: Construct,
    id: string,
    userHierarchyGroupArn: string,
  ): IUserHierarchyGroup {
    class Import extends UserHierarchyGroupBase {
      public readonly userHierarchyGroupArn = userHierarchyGroupArn;
      public readonly userHierarchyGroupName = Arn.split(userHierarchyGroupArn, ArnFormat.SLASH_RESOURCE_NAME)
        .resourceName!;

      constructor(s: Construct, i: string) {
        super(s, i);
      }
    }

    return new Import(scope, id);
  }

  /**
   * Creates a user hierarchy group reference from existing attributes.
   *
   * @param scope - The construct scope
   * @param id - Identifier of the construct
   * @param attrs - Attributes of the existing user hierarchy group
   * @returns An IUserHierarchyGroup reference to the existing group
   */
  public static fromUserHierarchyGroupAttributes(
    scope: Construct,
    id: string,
    attrs: UserHierarchyGroupAttributes,
  ): IUserHierarchyGroup {
    return UserHierarchyGroup.fromUserHierarchyGroupArn(scope, id, attrs.userHierarchyGroupArn);
  }

  // ------------------------------------------------------
  // Attributes
  // ------------------------------------------------------
  /**
   * The ARN of the user hierarchy group resource.
   * @attribute
   */
  public readonly userHierarchyGroupArn: string;
  /**
   * The name of the user hierarchy group.
   * @attribute
   */
  public readonly userHierarchyGroupName: string;
  /**
   * The parent hierarchy group.
   */
  public readonly parentGroup?: IUserHierarchyGroup;
  /**
   * Tags applied to this user hierarchy group resource
   */
  public readonly tags?: { [key: string]: string };
  /**
   * The Amazon Connect instance
   */
  private readonly instance: IInstance;
  // ------------------------------------------------------
  // Internal Only
  // ------------------------------------------------------
  private readonly __resource: amazonConnect.CfnUserHierarchyGroup;

  // ------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------
  constructor(scope: Construct, id: string, props: UserHierarchyGroupProps) {
    super(scope, id);

    // ------------------------------------------------------
    // Set properties
    // ------------------------------------------------------
    this.instance = props.instance;
    this.userHierarchyGroupName = props.name;
    this.parentGroup = props.parentGroup;
    this.tags = props.tags;

    // ------------------------------------------------------
    // Validations
    // ------------------------------------------------------
    this._validateName();

    // ------------------------------------------------------
    // CFN Props
    // ------------------------------------------------------
    const cfnProps: amazonConnect.CfnUserHierarchyGroupProps = {
      instanceArn: this.instance.instanceArn,
      name: this.userHierarchyGroupName,
      parentGroupArn: this.parentGroup?.userHierarchyGroupArn,
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
    this.__resource = new amazonConnect.CfnUserHierarchyGroup(this, 'Resource', cfnProps);

    // Get attributes from the CloudFormation resource
    this.userHierarchyGroupArn = this.__resource.attrUserHierarchyGroupArn;
  }

  // ------------------------------------------------------
  // VALIDATORS
  // ------------------------------------------------------
  /**
   * Validates the user hierarchy group name.
   * @internal This is an internal core function and should not be called directly.
   */
  private _validateName = (): void => {
    const errors = validateStringFieldLength({
      value: this.userHierarchyGroupName,
      fieldName: 'name',
      minLength: GROUP_NAME_MIN_LENGTH,
      maxLength: GROUP_NAME_MAX_LENGTH,
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };
}
