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

import * as zlib from 'zlib';
import * as data from './jumpstart-models.json';

export interface IInstanceAliase {
  region: string;
  aliases: { [key: string]: string };
}

export interface IInstanceValiant {
  instanceType: string;
  imageUri?: string;
  environment?: { [key: string]: string };
}

export interface IJumpStartModelSpec {
  modelId: string;
  version: string;
  defaultInstanceType: string;
  instanceTypes: string[];
  modelPackageArns?: { [region: string]: string };
  prepackedArtifactKey?: string;
  gatedBucket: boolean;
  artifactKey?: string;
  environment: { [key: string]: string | number | boolean };
  instanceAliases?: IInstanceAliase[];
  instanceVariants?: IInstanceValiant[];
  requiresEula: boolean;
}

export class JumpStartModel {
  public static of(name: string): JumpStartModel {
    return new JumpStartModel(name);
  }

  constructor(private readonly name: string) {}

  public bind(): IJumpStartModelSpec {
    const bufferSource = (data as { data: number[] }).data;
    const buffer = Buffer.from(bufferSource);
    const bufferStr = zlib.inflateRawSync(buffer);
    const json = JSON.parse(bufferStr.toString());

    return json[this.name];
  }
}