# Developer Guide

## Table of contents

- [Introduction](#introduction)
- [Pre-requisites](#pre-requisites)
- [Preparing your build environment](#preparing-your-build-environment)
- [Tools](#tools)
    - [Linter](#linter)
    - [Husky](#husky-and-commitlint)
    - [Code generation](#code-generation)
- [GitHub workflows](#github-workflows)
    - [Bandit](#bandit)
    - [CodeCov](#codecov)
    - [Build](#build)
    - [CommitLint](#commitlint)
    - [GitHub merit badger](#github-merit-badger)
    - [Monthly repo metrics](#monthly-repo-metrics)
    - [ORT Toolkit](#ort-toolkit)
    - [Semgrep](#semgrep)
    - [Update contributors](#update-contributors)
- [Working on your construct](#working-on-your-construct)
- [Testing](#testing)
- [Testing Your Construct Locally](#testing-your-construct-locally)
    - [Step 1: Building the Generative AI CDK Construct Library](#step-1-building-the-generative-ai-cdk-construct-library)
    - [Step 2: Packaging the constructs](#step-2-packaging-the-constructs)
    - [Step 3: Integrating with your application](#step-3-integrating-with-your-application)
    - [Step 4: Deploying to AWS](#step-4-deploying-to-aws)
- [Project structure](#project-structure)

## Introduction

AWS Generative AI CDK Constructs are built in TypeScript using Projen (http://projen.io/). This is to support all the associated testing, code checking, and compilation for TypeScript and Python clients. At the moment, there is no dedicated development container, thus you need to configure your local development environment following the steps described below.

## Pre-requisites

- An AWS account. We recommend you deploy this solution in a new account
- [AWS CLI](https://aws.amazon.com/cli/): configure your credentials

```
aws configure --profile [your-profile] 
AWS Access Key ID [None]: xxxxxx
AWS Secret Access Key [None]:yyyyyyyyyy
Default region name [None]: us-east-1 
Default output format [None]: json
```

- [Node](https://nodejs.org/en) >= v20.9.0
- [AWS CDK](https://github.com/aws/aws-cdk/releases/tag/v2.116.0) >= 2.116.0
- [Python](https://www.python.org/downloads/) >=3.9
- [Projen](https://github.com/projen/projen) >= 0.78.8
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/cli/install/) >= 1.22.19

You can use the command below to install the dependencies listed above
```
npm install -g npm aws-cdk yarn projen
```

## Preparing your Build Environment

| Action                                                                                                               |                                                                                                                                                                                                                                  |
| :--------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open the [repository](https://github.com/awslabs/generative-ai-cdk-constructs). | As you are reading this file from the repo, you are probably already there.                                                                                                                       |
| Using the "fork" button in the upper right, fork the repo into your GitHub account.                                    | Some git/GitHub expertise is assumed.                                                                            |
| Clone forked repo to your local development environment.                                                              | If you wish to work off a branch in your repository, create and clone that branch. You will create a PR back to `main` in the generative-ai-cdk-constructs repository eventually, you can do that from fork/main or fork/*branch* |
| `cd generative-ai-cdk-construct`                                                                        | This is the home directory of the repo and where you will open your text editor, run builds, etc.                                                                                                                           |
| `code .`                                                                                                             | Opens the project in VSCode. You can use the editor of your choice, just adapt this step to your specific use case.                                                                                                              |
| `npx projen install`                                                                                                         | This command will generate project files (dependencies, etc.) from the configuration file and install them.                                                                                                                      |

## Tools

The project come with an assortment of tasks that handle various development activities, from compiling to publishing. Those were generated automatically through Projen and are available [here](https://projen.io/docs/project-types/aws-cdk-construct-library#tasks). Tasks can be composed together, and can be run as local commands or turned into GitHub workflows. You can list all tasks with ```projen --help```. Some additional tasks were added or modified as part of this project.

### Linter

The linter ([ESlint](https://eslint.org/)) is executed automatically as part of the ```projen build``` command. You can also execute it separately through ```projen eslint```.
The linter uses an additional package (header) to run through all the Typescript files in the src/ directory and add automatically the license header if missing.

### Husky and CommitLint

The repository uses [CommitLint](https://commitlint.js.org/#/) as a commit linting tool, and [Husky](https://typicode.github.io/husky/) which will run every time you try to add a commit message (through git hooks). If the commit message doesn’t follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format, CommitLint will error out. Your commits need to be prefixed with the keyword fix, chore or feat and include in parenthesis the module being updated, followd by a semicolon and the commit message. For example:
```
chore(documentation): update documentation to reflect new cdk version used
```

### Code generation

The SageMaker constructs provide strongly type fields (available JumpStart models, Deep Learning Container images) to improve the developer experience. Those fields are generated through a code generation step available in [code generation](./src/patterns/gen-ai/aws-model-deployment-sagemaker/code-generation/). A projen task is exposed to run this step (```projen generate-models-containers```). 

## GitHub workflows

In addition to the default GitHub workflows generated by Projen, the following workflows were added or modified (associated code is available [here](./projenrc/github-workflows.ts)):

### Bandit

This GitHub workflow runs [Bandit](https://github.com/PyCQA/bandit), a tool designed to find common security issues in Python code. The produced artifacts can be reviewed to verify that any update to the repository doesn't introduce vulnerabilities. 

### CodeCov

This workflow sends code coverage metrics to [CodeCov](https://codecov.io/). 

### Build

Controlled by the buildWorkflow field. On a 'pull_request' or 'workflow_dispatch' the library will be built and checked for anti-tamper (ensure no manual changes to generated files). If you face an error related to a mutation, this means you probably did not run ```projen build``` locally following your changes and some files were not committed. 

### CommitLint

Runs CommitLint on the PR commits, and fails if the commits didn't follow the Conventional Commit format.

### GitHub merit badger

GitHub workflow which adds well-known merit badges to pull requests that come in to your repository. More information available [here](https://github.com/aws-github-ops/github-merit-badger).

### Monthly repo metrics

GitHub workflow which generates metrics on the issues (includes issues and pull requests) over the last 30 days. 

### Ort toolkit

This workflow runs the [ORT toolkit](https://github.com/oss-review-toolkit/ort) on each pull request. ORT is a FOSS policy automation and orchestration toolkit which you can use to manage your (open source) software dependencies in a strategic, safe and efficient manner.

### Semgrep

This workfow runs [Semgrep](https://semgrep.dev/) to scan code and package dependencies for known issues, software vulnerabilities, and detected secrets.

### Update contributors

GitHub workflow that runs monthly to create a pull request for updating a CONTRIBUTORS file with the top contributors.

## Working on Your Construct

Projen is opinionated and mandates that all project configuration be done through the .projenrc.ts file. For instance if you directly change package.json then Projen will detect that during the release phase and will fail the release attempt. Hence, it is a good idea to do projen synth by running the projen command on the constructs/ directory where the .projenrc.ts file is before pushing the code to our repository.

| Action                                            | Explanation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :-------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (optional)<br/>`git checkout -b your-branch-name` | If you're working in a different branch than main in your forked repo and haven't changed your local branch, now is a good time to do so.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `mkdir src/patterns/<generative ai>/<construct name> `                     | Creates a dedicated folder to work on your construct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `cd src/patterns/<generative ai>/<construct name>`                         | Change directory to the folder where you want to change code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| *Do all your code editing*                        | Open your code editor and create the construct or perform your edits on an existing construct. Your construct code must be located in the src folder. Put only the TypeScript files related to your construct in that folder. If you need to bundle additional code, add it to a separate folder in the root folder of this repo (see existing examples, like `lambda` and `resources` folders.) Use an existing construct as an example of the structure that is expected (architecture.png, README.md, index.ts). For the architecture diagram of your construct, please use the provided Draw.io project located in the /docs folder. Create a new tab with your construct name. Finally, export your construct in the src/index.ts file. An example of the expected project structure is provided at the end of this document. Common code containing helper functions to standardize and accelerate development is located in the src/common folder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `npx projen build`                                | This is the build command for the library. It will build, lint, add license header files, and run the unit and integration tests. If you make any substantive changes to the code, you will almost certainly see some or all of the tests fail. The next section will describe how testing works in AWS Generative AI CDK Constructs and how to write, refresh, and execute tests. In the meantime, you can at least check if your code transpiles correctly without running the tests by running `npx projen compile`. |

## Testing

AWS Generative AI CDK Constructs uses unit testing. Unit testing targets specific aspects of a construct or one of the functions in the common library. You can learn more about unit testing CDK constructs [here](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) and [here](https://aws.amazon.com/blogs/developer/testing-infrastructure-with-the-aws-cloud-development-kit-cdk/).

All test files can be found in the /test directory under each sub-directory.


| Action            | Explanation                                |
| :------------------ | :------------------------------------------- |
| `npx projen test` | This will run all tests (unit) |

---
## Testing Your Construct Locally

You can use the samples repository to test your locally changed constructs. This is also useful for development.

### Step 1: Building the Generative AI CDK Construct library

In your local version of the Generative AI Construct library,  open your command line interface and execute the command ```projen compile```. This command compiles the project in your repository.

### Step 2: Packaging the Constructs

1. Depending on the bindings you want to use, execute either:
- ```projen package:js  ```: Create js language bindings
- ```projen package:python```: Create python language bindings

The command above creates a new .tgz or .whl package of all constructs in the dist/js or dist/python folder.

2. Locate the produced artifact:
- For js: find the generated .tgz file, typically named ```dist/js/generative-ai-cdk-constructs-0.0.0.jsii.tgz```
- For python: find the generated .whl file, typically named ```dist/python/cdklabs.generative_ai_cdk_constructs-0.0.0-py3-none-any.whl```


### Step 3: Integrating with your application

There are 2 ways to test your changes locally:
- Use the [official samples repository](https://github.com/aws-samples/generative-ai-cdk-constructs-samples) which includes a collection of functional use case implementations to demonstrate the usage of AWS Generative AI CDK Constructs. You can modify an existing sample to include your locally build changes.
- As an alternative, you can also create a new CDK application using:
    - cdk init app --language typescript for Typescript
    - cdk init app --language python for Python

Regarless of the method selected, we will call the application consuming your local changes the ```destination application```.

1. Drag and Drop the artifact file into your destination application repository, ideally at the root like "samples/document_explorer".

2. If you use an application which already consumes the generative ai cdk constructs package: 
- For js:
    - Open package.json in your destination application
    - Under dependencies, locate the entry for "@cdklabs/generative-ai-cdk-constructs"
    - Remove the existing entry and delete the library from your node_modules folder
- for python:
    ```pip uninstall cdklabs.generative-ai-cdk-constructs```

3. Install the local artifact:
- For Js: ```npm i ./generative-ai-cdk-constructs-0.0.0.jsii.tgz```
- For Python: ```pip install ./cdklabs.generative_ai_cdk_constructs-0.0.0-py3-none-any.whl``` 

### Step 4: Deploying to AWS

1. Navigate to your destination application directory:
2. AWS CDK Deployment:
  - Ensure you are authenticated to AWS with the necessary permissions.
  - Run ```cdk deploy``` to deploy the new backend with your generative AI constructs into the AWS Cloud.
3. Verify Deployment:
  - Log into your AWS console and verify that the resources have been deployed successfully.
  - Check for any errors in the AWS CloudFormation console and address them as necessary.

### Testing and Verification

- After deployment, you may want to test the functionalities of the generative AI constructs in the AWS environment.
- Ensure all integrations and functionalities are working as expected.

## Project structure

```
.
|--docs/ (draw.io project containing architecture diagrams for all constructs)
|--lib/ (Build output)
|--lambda/ (Lambda functions code)
|--layers/ (Lambda layers code)
|--resources (If you need additional resources packaged with your library)
|--projenrc (Folder containing utilities for the main projenrc file)
|--src/ (Source .ts files)
    |--common/ (Common code reused accross constructs, not meant to be exposed to the end user)
        |--helpers
            |-- README.md (Documentation for helper functions)
            |-- *-helper.ts (Helper source file)
    |--cdk-lib/ (lower level constructs, exposed to the end user)
    |--patterns/ (L3 pattenrs constructs source files are here)
        |--<gen-ai>
            |--<pattern-name>
                |--index.ts (Construct source file)
                |--README.md (Construct documentation)
                |--architecture.png (Construct diagram)
    |--index.ts (Constructs need to be exported from this index.ts file)
|--test/
    |--cdk-lib/ (Lower level constructs)
    |--common/ (Common code reused accross constructs)
        |--helpers
            |-- *-helper.test.ts (Helper source file)
    |--patterns/
        |--<gen-ai>
            |--<pattern-name>
                |--*.test.ts (construct test files)
```


&copy; Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
