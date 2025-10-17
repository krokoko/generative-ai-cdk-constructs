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

import { validateFieldPattern, validateStringFieldLength } from '../validation-helpers';

/******************************************************************************
 *                              CONSTANTS
 *****************************************************************************/
/**
 * Minimum length for instance alias
 * @internal
 */

const INSTANCE_ALIAS_MIN_LENGTH = 1;
/**
 * Maximum length for instance alias
 * @internal
 */
const INSTANCE_ALIAS_MAX_LENGTH = 45;

/**
 * Length for directory id
 * @internal
 */
const DIRECTORY_ID_LENGTH = 12; // 12 characters

/******************************************************************************
 *                                Interface
 *****************************************************************************/
/**
 * Interface for the identity management configuration.
 */
export class IdentityManagement {
  /**
   * AWS supports identity federation with Security Assertion Markup Language (SAML 2.0). This feature enables single sign-on (SSO) so
   * users can log into the AWS Management Console or call the AWS APIs without you having to create an IAM user for everyone in your organization.
   * @param instanceAlias - The alias for the instance. If not provided, a random alias will be generated.
   * @returns An IdentityManagement object.
   */
  public static fromSAML(instanceAlias?: string): IdentityManagement {
    const alias = instanceAlias || this._generateRandomInstanceAlias();
    return new IdentityManagement('SAML', undefined, alias);
  }

  /**
   * Amazon Connect uses an existing directory. You create users in the directory, and
   * then add and configure them in Amazon Connect. You can only associate a directory with only one Amazon Connect instance.
   * @param directoryId - The identifier for the directory.
   * @returns An IdentityManagement object.
   */
  public static fromExistingDirectory(directoryId: string): IdentityManagement {
    return new IdentityManagement('EXISTING_DIRECTORY', directoryId, undefined);
  }

  /**
   * Create and manage users in Amazon Connect. You cannot share users with other applications.
   * @param instanceAlias - The alias for the instance. If not provided, a random alias will be generated.
   * @returns An IdentityManagement object.
   */
  public static fromManaged(instanceAlias?: string): IdentityManagement {
    const alias = instanceAlias || this._generateRandomInstanceAlias();
    return new IdentityManagement('CONNECT_MANAGED', undefined, alias);
  }

  /**
   * Generates a random InstanceAlias string that meets Amazon Connect requirements.
   * Pattern: ^(?!d-)([\da-zA-Z]+)([-]*[\da-zA-Z])*$
   * Length: 1-45 characters
   * @returns A random instance alias string.
   * @internal This is an internal core function and should not be called directly.
   */
  private static _generateRandomInstanceAlias(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const hyphenChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';

    // Generate length between 1 and 45
    const length = Math.floor(Math.random() * 45) + 1;

    let alias = '';

    // First character must be alphanumeric (not 'd' to avoid 'd-' pattern)
    const firstChar = chars[Math.floor(Math.random() * chars.length)];
    alias += firstChar;

    // Generate remaining characters
    for (let i = 1; i < length; i++) {
      alias += hyphenChars[Math.floor(Math.random() * hyphenChars.length)];
    }

    // Ensure the alias doesn't start with 'd-' and ends with alphanumeric
    if (alias.startsWith('d-')) {
      alias = 'a' + alias.substring(1);
    }

    // Ensure it ends with alphanumeric character
    if (alias.endsWith('-')) {
      alias += chars[Math.floor(Math.random() * chars.length)];
    }

    // Truncate to 45 characters if needed
    if (alias.length > 45) {
      alias = alias.substring(0, 45);
    }

    return alias;
  }

  /**
   * The identifier for the directory.
   * @required yes
   * @default - no directory id
   */
  readonly directoryId?: string;
  /**
   * The type of identity management for the instance.
   * @required yes
   * @default - no identity management type
   */
  readonly identityManagementType: string;
  /**
   * Create a custom URL. Use this URL to log into this instance of Amazon Connect.
   * @required no
   * @default - no alias
   */
  readonly instanceAlias?: string;

  /**
   * Private constructor to prevent direct instantiation.
   * @param identityManagementType - The type of identity management for the instance.
   * @param directoryId - The identifier for the directory.
   * @param instanceAlias - The alias for the instance.
   * @internal This is an internal core function and should not be called directly.
   */
  private constructor(identityManagementType: string, directoryId?: string, instanceAlias?: string) {
    this.directoryId = directoryId;
    this.identityManagementType = identityManagementType;
    this.instanceAlias = instanceAlias;

    this._validateInstanceAlias();
    this._validateDirectoryId();
  }

  /**
   * Validates the instance alias.
   * @returns An array of error messages.
   */
  private _validateInstanceAlias = (): string[] => {
    const errors: string[] = [];

    if (this.instanceAlias) {
      errors.push(...validateStringFieldLength({
        value: this.instanceAlias,
        fieldName: 'instanceAlias',
        minLength: INSTANCE_ALIAS_MIN_LENGTH,
        maxLength: INSTANCE_ALIAS_MAX_LENGTH,
      }));

      // Check if instance alias matches the AWS API pattern: ^(?!d-)([\da-zA-Z]+)([-]*[\da-zA-Z])*$
      const validInstanceAliasPattern = /^(?!d-)([\da-zA-Z]+)([-]*[\da-zA-Z])*$/;
      errors.push(...validateFieldPattern(this.instanceAlias, 'instanceAlias', validInstanceAliasPattern));
    }

    return errors;
  };

  /**
   * Validates the directory id.
   * @returns An array of error messages.
   */
  private _validateDirectoryId = (): string[] => {
    const errors: string[] = [];

    if (this.directoryId) {
      errors.push(...validateStringFieldLength({
        value: this.directoryId,
        fieldName: 'directoryId',
        minLength: DIRECTORY_ID_LENGTH,
        maxLength: DIRECTORY_ID_LENGTH,
      }));

      // Check if directory id matches the AWS API pattern: ^d-[a-f0-9]{10}$
      const validDirectoryIdPattern = /^d-[0-9a-f]{10}$/;
      errors.push(...validateFieldPattern(this.directoryId, 'directoryId', validDirectoryIdPattern));
    }

    return errors;
  };
}
