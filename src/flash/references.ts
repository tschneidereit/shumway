/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path='../../build/ts/avm2.d.ts' />
/// <reference path='../../build/ts/swf.d.ts' />

///<reference path='module.ts' />
///<reference path='../htmlparser.ts' />
///<reference path='../TextContent.ts' />
///<reference path='settings.ts' />

///<reference path='symbol.ts' />

///<reference path='../rtmp/references.ts' />

///<reference path='geom/Matrix.ts' />
///<reference path='geom/Matrix3D.ts' />
///<reference path='geom/Orientation3D.ts' />
///<reference path='geom/PerspectiveProjection.ts' />
///<reference path='geom/Point.ts' />
///<reference path='geom/Rectangle.ts' />
///<reference path='geom/Transform.ts' />
///<reference path='geom/Utils3D.ts' />
///<reference path='geom/Vector3D.ts' />

///<reference path='accessibility/Accessibility.ts' />
///<reference path='accessibility/AccessibilityImplementation.ts' />
///<reference path='accessibility/AccessibilityProperties.ts' />
// ///<reference path='accessibility/ISearchableText.ts' />
// ///<reference path='accessibility/ISimpleTextSelection.ts' />
// ///<reference path='automation/ActionGenerator.ts' />
// ///<reference path='automation/AutomationAction.ts' />
// ///<reference path='automation/Configuration.ts' />
// ///<reference path='automation/KeyboardAutomationAction.ts' />
// ///<reference path='automation/MouseAutomationAction.ts' />
// ///<reference path='automation/StageCapture.ts' />
// ///<reference path='automation/StageCaptureEvent.ts' />
// ///<reference path='desktop/Clipboard.ts' />
// ///<reference path='desktop/ClipboardFormats.ts' />
// ///<reference path='desktop/ClipboardTransferMode.ts' />

///<reference path='events/Event.ts' />
///<reference path='events/EventDispatcher.ts' />
///<reference path='events/EventPhase.ts' />
// ///<reference path='events/AccelerometerEvent.ts' />
// ///<reference path='events/ActivityEvent.ts' />
// ///<reference path='events/ContextMenuEvent.ts' />
// ///<reference path='events/DataEvent.ts' />
///<reference path='events/TextEvent.ts' />
///<reference path='events/ErrorEvent.ts' />
///<reference path='events/AsyncErrorEvent.ts' />
// ///<reference path='events/FocusEvent.ts' />
// ///<reference path='events/FullScreenEvent.ts' />
///<reference path='events/GameInputEvent.ts' />
// ///<reference path='events/GeolocationEvent.ts' />
///<reference path='events/GestureEvent.ts' />
// ///<reference path='events/GesturePhase.ts' />
///<reference path='events/HTTPStatusEvent.ts' />
///<reference path='events/IEventDispatcher.ts' />
// ///<reference path='events/IMEEvent.ts' />
///<reference path='events/IOErrorEvent.ts' />
///<reference path='events/KeyboardEvent.ts' />
///<reference path='events/MouseEvent.ts' />
// ///<reference path='events/NetDataEvent.ts' />
// ///<reference path='events/NetFilterEvent.ts' />
// ///<reference path='events/NetMonitorEvent.ts' />
///<reference path='events/NetStatusEvent.ts' />
// ///<reference path='events/OutputProgressEvent.ts' />
// ///<reference path='events/PressAndTapGestureEvent.ts' />
///<reference path='events/ProgressEvent.ts' />
// ///<reference path='events/SampleDataEvent.ts' />
///<reference path='events/SecurityErrorEvent.ts' />
// ///<reference path='events/ShaderEvent.ts' />
// ///<reference path='events/SoftKeyboardEvent.ts' />
// ///<reference path='events/SoftKeyboardTrigger.ts' />
// ///<reference path='events/StageVideoAvailabilityEvent.ts' />
// ///<reference path='events/StageVideoEvent.ts' />
///<reference path='events/StatusEvent.ts' />
// ///<reference path='events/SyncEvent.ts' />
// ///<reference path='events/ThrottleEvent.ts' />
// ///<reference path='events/ThrottleType.ts' />
///<reference path='events/TimerEvent.ts' />
///<reference path='events/TouchEvent.ts' />
// ///<reference path='events/TransformGestureEvent.ts' />
///<reference path='events/UncaughtErrorEvent.ts' />
///<reference path='events/UncaughtErrorEvents.ts' />
// ///<reference path='events/VideoEvent.ts' />

///<reference path='display/DisplayObject.ts' />
///<reference path='display/Bitmap.ts' />
///<reference path='display/Shape.ts' />
///<reference path='display/InteractiveObject.ts' />
///<reference path='display/SimpleButton.ts' />
///<reference path='display/DisplayObjectContainer.ts' />
///<reference path='display/JointStyle.ts' />
///<reference path='display/CapsStyle.ts' />
///<reference path='display/LineScaleMode.ts' />
///<reference path='display/GradientType.ts' />
///<reference path='display/SpreadMethod.ts' />
///<reference path='display/InterpolationMethod.ts' />
///<reference path='display/GraphicsBitmapFill.ts' />
///<reference path='display/GraphicsEndFill.ts' />
///<reference path='display/GraphicsGradientFill.ts' />
///<reference path='display/GraphicsPath.ts' />
///<reference path='display/GraphicsPathCommand.ts' />
///<reference path='display/GraphicsPathWinding.ts' />
// ///<reference path='display/GraphicsShaderFill.ts' />
///<reference path='display/GraphicsSolidFill.ts' />
///<reference path='display/GraphicsStroke.ts' />
///<reference path='display/GraphicsTrianglePath.ts' />
///<reference path='display/IDrawCommand.ts' />
///<reference path='display/IGraphicsData.ts' />
///<reference path='display/IGraphicsFill.ts' />
///<reference path='display/IGraphicsPath.ts' />
///<reference path='display/IGraphicsStroke.ts' />
///<reference path='display/Graphics.ts' />
///<reference path='display/Sprite.ts' />
///<reference path='display/MovieClip.ts' />
///<reference path='display/MovieClipSoundStream.ts' />
///<reference path='display/Stage.ts' />

///<reference path='display/ActionScriptVersion.ts' />
///<reference path='display/BlendMode.ts' />
///<reference path='display/ColorCorrection.ts' />
///<reference path='display/ColorCorrectionSupport.ts' />
///<reference path='display/FocusDirection.ts' />
///<reference path='display/FrameLabel.ts' />
///<reference path='display/BitmapData.ts' />
///<reference path='display/BitmapDataChannel.ts' />
///<reference path='display/BitmapEncodingColorSpace.ts' />
///<reference path='display/IBitmapDrawable.ts' />
///<reference path='display/JPEGEncoderOptions.ts' />
// ///<reference path='display/JPEGXREncoderOptions.ts' />
///<reference path='display/Loader.ts' />
///<reference path='display/LoaderInfo.ts' />
///<reference path='display/MorphShape.ts' />
///<reference path='display/NativeMenu.ts' />
///<reference path='display/NativeMenuItem.ts' />
///<reference path='display/PNGEncoderOptions.ts' />
///<reference path='display/PixelSnapping.ts' />
///<reference path='display/SWFVersion.ts' />
///<reference path='display/Scene.ts' />
// ///<reference path='display/Shader.ts' />
// ///<reference path='display/ShaderData.ts' />
// ///<reference path='display/ShaderInput.ts' />
// ///<reference path='display/ShaderJob.ts' />
// ///<reference path='display/ShaderParameter.ts' />
// ///<reference path='display/ShaderParameterType.ts' />
// ///<reference path='display/ShaderPrecision.ts' />
// ///<reference path='display/Stage3D.ts' />
///<reference path='display/StageAlign.ts' />
///<reference path='display/StageDisplayState.ts' />
///<reference path='display/StageQuality.ts' />
///<reference path='display/StageScaleMode.ts' />
///<reference path='display/TriangleCulling.ts' />
///<reference path='display/AVM1Movie.ts' />

// ///<reference path='display3D/Context3D.ts' />
// ///<reference path='display3D/Context3DBlendFactor.ts' />
// ///<reference path='display3D/Context3DClearMask.ts' />
// ///<reference path='display3D/Context3DCompareMode.ts' />
// ///<reference path='display3D/Context3DProfile.ts' />
// ///<reference path='display3D/Context3DProgramType.ts' />
// ///<reference path='display3D/Context3DRenderMode.ts' />
// ///<reference path='display3D/Context3DStencilAction.ts' />
// ///<reference path='display3D/Context3DTextureFormat.ts' />
// ///<reference path='display3D/Context3DTriangleFace.ts' />
// ///<reference path='display3D/Context3DVertexBufferFormat.ts' />
// ///<reference path='display3D/IndexBuffer3D.ts' />
// ///<reference path='display3D/Program3D.ts' />
// ///<reference path='display3D/VertexBuffer3D.ts' />
// ///<reference path='display3D/textures/CubeTexture.ts' />
// ///<reference path='display3D/textures/Texture.ts' />
// ///<reference path='display3D/textures/TextureBase.ts' />

// ///<reference path='errors/EOFError.ts' />
// ///<reference path='errors/IOError.ts' />
///<reference path='errors/IllegalOperationError.ts' />
// ///<reference path='errors/InvalidSWFError.ts' />
// ///<reference path='errors/MemoryError.ts' />
// ///<reference path='errors/ScriptTimeoutError.ts' />
// ///<reference path='errors/StackOverflowError.ts' />

///<reference path='external/ExternalInterface.ts' />

///<reference path='filters/BitmapFilterQuality.ts' />
///<reference path='filters/BitmapFilterType.ts' />
///<reference path='filters/BitmapFilter.ts' />
///<reference path='filters/BevelFilter.ts' />
///<reference path='filters/BlurFilter.ts' />
///<reference path='filters/ColorMatrixFilter.ts' />
///<reference path='filters/ConvolutionFilter.ts' />
///<reference path='filters/DisplacementMapFilterMode.ts' />
///<reference path='filters/DisplacementMapFilter.ts' />
///<reference path='filters/DropShadowFilter.ts' />
///<reference path='filters/GlowFilter.ts' />
///<reference path='filters/GradientBevelFilter.ts' />
///<reference path='filters/GradientGlowFilter.ts' />
// ///<reference path='filters/ShaderFilter.ts' />
///<reference path='geom/ColorTransform.ts' />

// ///<reference path='globalization/Collator.ts' />
// ///<reference path='globalization/CollatorMode.ts' />
// ///<reference path='globalization/CurrencyFormatter.ts' />
// ///<reference path='globalization/CurrencyParseResult.ts' />
// ///<reference path='globalization/DateTimeFormatter.ts' />
// ///<reference path='globalization/DateTimeNameContext.ts' />
// ///<reference path='globalization/DateTimeNameStyle.ts' />
// ///<reference path='globalization/DateTimeStyle.ts' />
// ///<reference path='globalization/LastOperationStatus.ts' />
// ///<reference path='globalization/LocaleID.ts' />
// ///<reference path='globalization/NationalDigitsType.ts' />
// ///<reference path='globalization/NumberFormatter.ts' />
// ///<reference path='globalization/NumberParseResult.ts' />
// ///<reference path='globalization/StringTools.ts' />

// ///<reference path='media/AudioDecoder.ts' />
///<reference path='media/Camera.ts' />
// ///<reference path='media/H264Level.ts' />
// ///<reference path='media/H264Profile.ts' />
// ///<reference path='media/H264VideoStreamSettings.ts' />
///<reference path='media/ID3Info.ts' />
///<reference path='media/Microphone.ts' />
// ///<reference path='media/MicrophoneEnhancedMode.ts' />
// ///<reference path='media/MicrophoneEnhancedOptions.ts' />
///<reference path='media/Sound.ts' />
///<reference path='media/SoundChannel.ts' />
// ///<reference path='media/SoundCodec.ts' />
///<reference path='media/SoundLoaderContext.ts' />
///<reference path='media/SoundMixer.ts' />
///<reference path='media/SoundTransform.ts' />
///<reference path='media/StageVideo.ts' />
///<reference path='media/StageVideoAvailability.ts' />
///<reference path='media/Video.ts' />
// ///<reference path='media/VideoCodec.ts' />
// ///<reference path='media/VideoStatus.ts' />
///<reference path='media/VideoStreamSettings.ts' />

// ///<reference path='net/DynamicPropertyOutput.ts' />
///<reference path='net/FileFilter.ts' />
///<reference path='net/FileReference.ts' />
///<reference path='net/FileReferenceList.ts' />
// ///<reference path='net/GroupSpecifier.ts' />
// ///<reference path='net/IDynamicPropertyOutput.ts' />
// ///<reference path='net/IDynamicPropertyWriter.ts' />
///<reference path='net/LocalConnection.ts' />
///<reference path='net/NetConnection.ts' />
// ///<reference path='net/NetGroup.ts' />
// ///<reference path='net/NetGroupInfo.ts' />
// ///<reference path='net/NetGroupReceiveMode.ts' />
// ///<reference path='net/NetGroupReplicationStrategy.ts' />
// ///<reference path='net/NetGroupSendMode.ts' />
// ///<reference path='net/NetGroupSendResult.ts' />
// ///<reference path='net/NetMonitor.ts' />
///<reference path='net/NetStream.ts' />
// ///<reference path='net/NetStreamAppendBytesAction.ts' />
///<reference path='net/NetStreamInfo.ts' />
///<reference path='net/NetStreamMulticastInfo.ts' />
///<reference path='net/NetStreamPlayOptions.ts' />
// ///<reference path='net/NetStreamPlayTransitions.ts' />
///<reference path='net/Responder.ts' />
// ///<reference path='net/SecureSocket.ts' />
///<reference path='net/SharedObject.ts' />
// ///<reference path='net/SharedObjectFlushStatus.ts' />
///<reference path='net/Socket.ts' />
///<reference path='net/URLLoader.ts' />
// ///<reference path='net/URLLoaderDataFormat.ts' />
///<reference path='net/URLRequest.ts' />
///<reference path='net/URLRequestHeader.ts' />
// ///<reference path='net/URLRequestMethod.ts' />
///<reference path='net/URLStream.ts' />
///<reference path='net/URLVariables.ts' />
// ///<reference path='net/XMLSocket.ts' />

// ///<reference path='printing/PrintJob.ts' />
// ///<reference path='printing/PrintJobOptions.ts' />
// ///<reference path='printing/PrintJobOrientation.ts' />
// ///<reference path='profiler/Telemetry.ts' />

// ///<reference path='sampler/ClassFactory.ts' />
// ///<reference path='sampler/DeleteObjectSample.ts' />
// ///<reference path='sampler/NewObjectSample.ts' />
// ///<reference path='sampler/Sample.ts' />
// ///<reference path='sampler/StackFrame.ts' />

// ///<reference path='security/CertificateStatus.ts' />
// ///<reference path='security/X500DistinguishedName.ts' />
// ///<reference path='security/X509Certificate.ts' />

///<reference path='sensors/Accelerometer.ts' />
///<reference path='sensors/Geolocation.ts' />
///<reference path='system/ApplicationDomain.ts' />
///<reference path='system/Capabilities.ts' />
///<reference path='system/FSCommand.ts' />
// ///<reference path='system/IMEConversionMode.ts' />
///<reference path='system/ImageDecodingPolicy.ts' />
///<reference path='system/LoaderContext.ts' />
///<reference path='system/JPEGLoaderContext.ts' />
///<reference path='system/Security.ts' />
///<reference path='system/SecurityDomain.ts' />
///<reference path='system/SecurityPanel.ts' />
///<reference path='system/TouchscreenType.ts' />

///<reference path='text/AntiAliasType.ts' />
// ///<reference path='text/CSMSettings.ts' />
///<reference path='text/FontStyle.ts' />
///<reference path='text/FontType.ts' />
///<reference path='text/Font.ts' />
///<reference path='text/GridFitType.ts' />
///<reference path='text/StaticText.ts' />
///<reference path='text/StyleSheet.ts' />
// ///<reference path='text/TextColorType.ts' />
///<reference path='text/TextDisplayMode.ts' />
// ///<reference path='text/TextExtent.ts' />
///<reference path='text/TextField.ts' />
///<reference path='text/TextFieldAutoSize.ts' />
///<reference path='text/TextFieldType.ts' />
///<reference path='text/TextFormat.ts' />
///<reference path='text/TextFormatAlign.ts' />
///<reference path='text/TextFormatDisplay.ts' />
///<reference path='text/TextInteractionMode.ts' />
///<reference path='text/TextLineMetrics.ts' />
// ///<reference path='text/TextRenderer.ts' />
///<reference path='text/TextRun.ts' />
///<reference path='text/TextSnapshot.ts' />

// ///<reference path='text/engine/BreakOpportunity.ts' />
// ///<reference path='text/engine/CFFHinting.ts' />
// ///<reference path='text/engine/ContentElement.ts' />
// ///<reference path='text/engine/DigitCase.ts' />
// ///<reference path='text/engine/DigitWidth.ts' />
// ///<reference path='text/engine/EastAsianJustifier.ts' />
// ///<reference path='text/engine/ElementFormat.ts' />
// ///<reference path='text/engine/FontDescription.ts' />
// ///<reference path='text/engine/FontLookup.ts' />
// ///<reference path='text/engine/FontMetrics.ts' />
// ///<reference path='text/engine/FontPosture.ts' />
// ///<reference path='text/engine/FontWeight.ts' />
// ///<reference path='text/engine/GraphicElement.ts' />
// ///<reference path='text/engine/GroupElement.ts' />
// ///<reference path='text/engine/JustificationStyle.ts' />
// ///<reference path='text/engine/Kerning.ts' />
// ///<reference path='text/engine/LigatureLevel.ts' />
// ///<reference path='text/engine/LineJustification.ts' />
// ///<reference path='text/engine/RenderingMode.ts' />
// ///<reference path='text/engine/TextJustifier.ts' />
// ///<reference path='text/engine/SpaceJustifier.ts' />
// ///<reference path='text/engine/TabAlignment.ts' />
// ///<reference path='text/engine/TabStop.ts' />
// ///<reference path='text/engine/TextBaseline.ts' />
// ///<reference path='text/engine/TextBlock.ts' />
// ///<reference path='text/engine/TextElement.ts' />
// ///<reference path='text/engine/TextLine.ts' />
// ///<reference path='text/engine/TextLineCreationResult.ts' />
// ///<reference path='text/engine/TextLineMirrorRegion.ts' />
// ///<reference path='text/engine/TextLineValidity.ts' />
// ///<reference path='text/engine/TextRotation.ts' />
// ///<reference path='text/engine/TypographicCase.ts' />

// ///<reference path='text/ime/CompositionAttributeRange.ts' />
// ///<reference path='text/ime/IIMEClient.ts' />

///<reference path='trace/Trace.ts' />

///<reference path='ui/ContextMenu.ts' />
///<reference path='ui/ContextMenuBuiltInItems.ts' />
///<reference path='ui/ContextMenuClipboardItems.ts' />
///<reference path='ui/ContextMenuItem.ts' />
///<reference path='ui/GameInput.ts' />
///<reference path='ui/GameInputControl.ts' />
///<reference path='ui/GameInputControlType.ts' />
///<reference path='ui/GameInputDevice.ts' />
///<reference path='ui/GameInputFinger.ts' />
///<reference path='ui/GameInputHand.ts' />
// ///<reference path='ui/KeyLocation.ts' />
///<reference path='ui/Keyboard.ts' />
// ///<reference path='ui/KeyboardType.ts' />
///<reference path='ui/Mouse.ts' />
///<reference path='ui/MouseCursor.ts' />
///<reference path='ui/MouseCursorData.ts' />
///<reference path='ui/Multitouch.ts' />
///<reference path='ui/MultitouchInputMode.ts' />

///<reference path='utils/Endian.ts' />
///<reference path='utils/IDataInput2.ts' />
///<reference path='utils/IDataOutput2.ts' />
///<reference path='utils/IExternalizable.ts' />
///<reference path='utils/Timer.ts' />
///<reference path='utils/SetIntervalTimer.ts' />

///<reference path='avm1.d.ts' />

// ///<reference path='linker.ts' />
///<reference path='link.ts' />
