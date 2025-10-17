[**@cdklabs/generative-ai-cdk-constructs**](../../../../README.md)

***

[@cdklabs/generative-ai-cdk-constructs](../../../../README.md) / [amazonconnect](../README.md) / InstanceSettings

# Interface: InstanceSettings

Settings for creating a Amazon Connect Instance resource

## Properties

### autoResolveBestVoices

> `readonly` **autoResolveBestVoices**: `boolean`

Specifies whether Amazon Connect automatically selects
the best voice for text-to-speech (TTS) based on the language.

#### Required

no

#### Default

```ts
true
```

***

### contactflowLogs

> `readonly` **contactflowLogs**: `boolean`

Controls whether logs for contact flow execution are generated.

#### Required

no

#### Default

```ts
true
```

***

### contactLens

> `readonly` **contactLens**: `boolean`

Activates Amazon Contact Lens for conversational analytics,
enabling features like sentiment analysis and call summarization.

#### Required

no

#### Default

```ts
true
```

***

### earlyMedia

> `readonly` **earlyMedia**: `boolean`

Controls whether early media (e.g., ringtones or announcements before the call connects)
is enabled for outbound calls.

#### Required

no

#### Default

```ts
true
```

***

### enhancedChatMonitoring

> `readonly` **enhancedChatMonitoring**: `boolean`

Offers enhanced monitoring for chat interactions.

#### Required

no

#### Default

```ts
true
```

***

### enhancedContactMonitoring

> `readonly` **enhancedContactMonitoring**: `boolean`

Provides advanced monitoring capabilities for contact interactions.

#### Required

no

#### Default

```ts
true
```

***

### highVolumeOutBound

> `readonly` **highVolumeOutBound**: `boolean`

Enables features designed for high-volume outbound campaigns.

#### Required

no

#### Default

```ts
true
```

***

### inboundCalls?

> `readonly` `optional` **inboundCalls**: `boolean`

Allow incoming calls.
Your contact center can handle incoming calls.

#### Required

no

#### Default

```ts
true
```

***

### multiPartyChatConference

> `readonly` **multiPartyChatConference**: `boolean`

Enables multi-party chat conferencing within the instance.

#### Required

no

#### Default

```ts
true
```

***

### multiPartyConference

> `readonly` **multiPartyConference**: `boolean`

Determines if multi-party conferencing is allowed within the instance.

#### Required

no

#### Default

```ts
true
```

***

### outboundCalls

> `readonly` **outboundCalls**: `boolean`

Allow outgoing calls.
Your contact center can make outbound calls.
You can set which users can place outbound calls in user permissions.

#### Required

no

#### Default

```ts
true
```

***

### useCustomTtsVoices

> `readonly` **useCustomTtsVoices**: `boolean`

Enables the use of custom Text-to-Speech (TTS) voices.

#### Required

no

#### Default

```ts
true
```
