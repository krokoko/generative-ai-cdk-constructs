# Code Generation for JumpStart Models

This directory contains code generation scripts that automatically fetch and generate TypeScript code for AWS SageMaker JumpStart models and Deep Learning Container (DLC) images.

## Overview

The code generation process:
1. **Downloads model metadata** from AWS S3 public buckets (JumpStart content buckets)
2. **Processes and filters** the model specifications
3. **Generates TypeScript code** with model definitions and metadata
4. **Compresses model data** using zlib for efficient storage

## Files

- `generate-jumpstart-models.ts` - Generates code for JumpStart models
- `generate-dlc-container-images.ts` - Generates code for DLC container images
- `generate-utils.ts` - Utility functions for code generation
- `index.ts` - Main entry point that runs all generators

## How It Works

### JumpStart Models Generation

1. **Data Download** (`download_data()`):
   - Fetches the JumpStart manifest from S3 public buckets
   - Downloads model specifications for each model in the manifest
   - Filters models based on:
     - Framework (only: huggingface, huggingface-llm, djl-deepspeed, djl-fastertransformer, stabilityai)
     - Deprecation status (excludes deprecated models)
     - Model availability (must have artifact keys or model package ARNs)
   - Caches the raw data to `.cache/jumpstart-models-cache.json`

2. **Code Generation** (`generateCode()`):
   - Reads the cached model data
   - Transforms model specifications into a structured format
   - Generates:
     - `jumpstart-model.ts` - TypeScript class with model definitions
     - `jumpstart-models.json` - Compressed JSON data file with all model specs
   - Uses zlib compression to reduce the JSON file size

### Data Sources

The code generation pulls data from AWS S3 public buckets:
- **Manifest URL**: `https://{contentBucket}.s3.{region}.amazonaws.com/{manifestKey}`
- **Model Specs**: Individual model specification files referenced in the manifest
- **Region**: Currently processes `us-east-1` region (configurable in code)

### Generated Files

- `../jumpstart-model.ts` - Main model class file
- `../jumpstart-models.json` - Compressed JSON data file
- `../jumpstart-model-constants.ts` - Model name constants (new, for Java compatibility)

## Running Code Generation

```bash
cd src/patterns/gen-ai/aws-model-deployment-sagemaker/code-generation
npm install
npm run generate
```

Or from the project root:

```bash
yarn generate-models-containers
```

## Java Compilation Issue

### Problem

The generated `JumpStartModel` class contains ~10,400 static readonly properties (one per model). When JSII compiles this to Java, it creates a massive class initializer that exceeds Java's 64KB bytecode limit per method/class.

**Error**: `[ERROR] error: code too large`

### Solution

To fix the Java compilation issue, we've refactored the code generation to:

1. **Remove static readonly properties** from the `JumpStartModel` class
2. **Generate a separate constants file** (`jumpstart-model-constants.ts`) with string constants for all model names
3. **Use the existing `of()` method** for model instantiation

### Migration Guide

**Before** (causes Java compilation error):
```typescript
model: JumpStartModel.META_TEXTGENERATION_LLAMA_2_7B_F_2_0_2
```

**After** (Java-compatible):
```typescript
import { JumpStartModelConstants } from './jumpstart-model-constants';

model: JumpStartModel.of(JumpStartModelConstants.META_TEXTGENERATION_LLAMA_2_7B_F_2_0_2)
```

Or using string literals (less type-safe):
```typescript
model: JumpStartModel.of('META_TEXTGENERATION_LLAMA_2_7B_F_2_0_2')
```

### Benefits

- ✅ Fixes Java compilation (no more 64KB limit issue)
- ✅ Maintains type safety via constants file
- ✅ Reduces generated code size significantly
- ✅ Same runtime behavior (data still loaded from compressed JSON)

## Configuration

### Allowed Frameworks

Only models with these frameworks are included:
- `huggingface`
- `huggingface-llm`
- `djl-deepspeed`
- `djl-fastertransformer`
- `stabilityai`

### Regions

Currently processes only `us-east-1`. To add more regions, modify:
```typescript
const regionNames = Object.keys(regions).filter((c) => c === 'us-east-1');
```

## Troubleshooting

### Generation Fails with Network Errors

The download process includes retry logic (5 attempts with exponential backoff). If it still fails:
- Check network connectivity
- Verify S3 bucket URLs are accessible
- Check AWS service status

### Generated File Too Large

If the generated file is still too large:
- Consider filtering more models (by framework, region, etc.)
- Review the compression ratio of `jumpstart-models.json`
- Check if all required models are actually needed

### Java Compilation Still Fails

If Java compilation still fails after the fix:
- Verify the constants file was generated correctly
- Check that no static readonly properties remain in `JumpStartModel` class
- Ensure the `of()` method is being used instead of direct property access

## Maintenance

- **When to regenerate**: After AWS adds new JumpStart models or updates existing ones
- **Frequency**: Typically done as part of regular dependency updates or when new models are needed
- **Testing**: After regeneration, run tests to ensure all model references still work
