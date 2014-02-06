var playerGlobalNames = {};
var playerGlobalScripts = {};
(function () {
  var index = [
  {
    "name": "Object",
    "offset": 0,
    "length": 53432,
    "defs": [
      "Object",
      "Class",
      "Function",
      "Namespace",
      "Boolean",
      "Number",
      "int",
      "uint",
      "String",
      "Array",
      "AS3",
      "bugzilla",
      "decodeURI",
      "decodeURIComponent",
      "encodeURI",
      "encodeURIComponent",
      "isNaN",
      "isFinite",
      "parseInt",
      "parseFloat",
      "escape",
      "unescape",
      "isXMLName",
      "NaN",
      "Infinity",
      "undefined",
      "__AS3__.vec:Vector",
      "__AS3__.vec:Vector$object",
      "__AS3__.vec:Vector$int",
      "__AS3__.vec:Vector$uint",
      "__AS3__.vec:Vector$double",
      "avmplus:describeTypeJSON",
      "avmplus:extendsXml",
      "avmplus:implementsXml",
      "avmplus:constructorXml",
      "avmplus:constantXml",
      "avmplus:variableXml",
      "avmplus:accessorXml",
      "avmplus:methodXml",
      "avmplus:parameterXml",
      "avmplus:metadataXml",
      "avmplus:argXml",
      "avmplus:typeXml",
      "avmplus:factoryXml",
      "avmplus:describeParams",
      "avmplus:describeMetadata",
      "avmplus:finish",
      "avmplus:describeTraits",
      "avmplus:HIDE_NSURI_METHODS",
      "avmplus:INCLUDE_BASES",
      "avmplus:INCLUDE_INTERFACES",
      "avmplus:INCLUDE_VARIABLES",
      "avmplus:INCLUDE_ACCESSORS",
      "avmplus:INCLUDE_METHODS",
      "avmplus:INCLUDE_METADATA",
      "avmplus:INCLUDE_CONSTRUCTOR",
      "avmplus:INCLUDE_TRAITS",
      "avmplus:USE_ITRAITS",
      "avmplus:HIDE_OBJECT",
      "avmplus:FLASH10_FLAGS",
      "avmplus:describeType",
      "avmplus:getQualifiedClassName",
      "avmplus:getQualifiedSuperclassName"
    ]
  },
  {
    "name": "flash/xml/XMLTag",
    "offset": 53432,
    "length": 859,
    "defs": [
      "flash.xml:XMLTag"
    ]
  },
  {
    "name": "flash/net/NetStreamInfo",
    "offset": 54291,
    "length": 5307,
    "defs": [
      "flash.net:NetStreamInfo"
    ]
  },
  {
    "name": "flash/sampler/StackFrame",
    "offset": 59598,
    "length": 4475,
    "defs": [
      "flash.sampler:StackFrame",
      "flash.sampler:Sample",
      "flash.sampler:NewObjectSample",
      "flash.sampler:DeleteObjectSample",
      "flash.sampler:clearSamples",
      "flash.sampler:startSampling",
      "flash.sampler:stopSampling",
      "flash.sampler:pauseSampling",
      "flash.sampler:sampleInternalAllocs",
      "flash.sampler:setSamplerCallback",
      "flash.sampler:_setSamplerCallback",
      "flash.sampler:getSize",
      "flash.sampler:getMemberNames",
      "flash.sampler:getSamples",
      "flash.sampler:_getSamples",
      "flash.sampler:getSampleCount",
      "flash.sampler:getInvocationCount",
      "flash.sampler:getSetterInvocationCount",
      "flash.sampler:getGetterInvocationCount",
      "flash.sampler:_getInvocationCount",
      "flash.sampler:isGetterSetter",
      "flash.sampler:getLexicalScopes",
      "flash.sampler:getSavedThis",
      "flash.sampler:getMasterString",
      "flash.sampler:ClassFactory"
    ]
  },
  {
    "name": "flash/display3D/Context3DBlendFactor",
    "offset": 64073,
    "length": 1101,
    "defs": [
      "flash.display3D:Context3DBlendFactor"
    ]
  },
  {
    "name": "flash/net/registerClassAlias",
    "offset": 65174,
    "length": 429,
    "defs": [
      "flash.net:registerClassAlias",
      "flash.net:getClassByAlias"
    ]
  },
  {
    "name": "flash/display3D/Context3DStencilAction",
    "offset": 65603,
    "length": 896,
    "defs": [
      "flash.display3D:Context3DStencilAction"
    ]
  },
  {
    "name": "flash/text/engine/CFFHinting",
    "offset": 66499,
    "length": 504,
    "defs": [
      "flash.text.engine:CFFHinting"
    ]
  },
  {
    "name": "flash/display/IDrawCommand",
    "offset": 67003,
    "length": 280,
    "defs": [
      "flash.display:IDrawCommand"
    ]
  },
  {
    "name": "flash/net/Responder",
    "offset": 67283,
    "length": 600,
    "defs": [
      "flash.net:Responder"
    ]
  },
  {
    "name": "flash/utils/IDataInput",
    "offset": 67883,
    "length": 2232,
    "defs": [
      "flash.utils:IDataInput"
    ]
  },
  {
    "name": "flash/utils/ObjectInput",
    "offset": 70115,
    "length": 1952,
    "defs": [
      "flash.utils:ObjectInput"
    ]
  },
  {
    "name": "flash/events/EventPhase",
    "offset": 72067,
    "length": 504,
    "defs": [
      "flash.events:EventPhase"
    ]
  },
  {
    "name": "flash/net/URLLoaderDataFormat",
    "offset": 72571,
    "length": 551,
    "defs": [
      "flash.net:URLLoaderDataFormat"
    ]
  },
  {
    "name": "flash/net/IDynamicPropertyWriter",
    "offset": 73122,
    "length": 537,
    "defs": [
      "flash.net:IDynamicPropertyWriter"
    ]
  },
  {
    "name": "flash/geom/PerspectiveProjection",
    "offset": 73659,
    "length": 1312,
    "defs": [
      "flash.geom:PerspectiveProjection"
    ]
  },
  {
    "name": "flash/events/IEventDispatcher",
    "offset": 74971,
    "length": 1046,
    "defs": [
      "flash.events:IEventDispatcher"
    ]
  },
  {
    "name": "flash/events/EventDispatcher",
    "offset": 76017,
    "length": 3072,
    "defs": [
      "flash.events:EventDispatcher"
    ]
  },
  {
    "name": "flash/display/Stage3D",
    "offset": 79089,
    "length": 1225,
    "defs": [
      "flash.display:Stage3D"
    ]
  },
  {
    "name": "flash/sensors/Geolocation",
    "offset": 80314,
    "length": 932,
    "defs": [
      "flash.sensors:Geolocation"
    ]
  },
  {
    "name": "Error",
    "offset": 81246,
    "length": 5961,
    "defs": [
      "Error",
      "DefinitionError",
      "EvalError",
      "RangeError",
      "ReferenceError",
      "SecurityError",
      "SyntaxError",
      "TypeError",
      "URIError",
      "VerifyError",
      "UninitializedError",
      "ArgumentError",
      "flash.errors:IOError",
      "flash.errors:EOFError",
      "flash.errors:MemoryError",
      "flash.errors:IllegalOperationError"
    ]
  },
  {
    "name": "flash/text/engine/ContentElement",
    "offset": 87207,
    "length": 1868,
    "defs": [
      "flash.text.engine:ContentElement"
    ]
  },
  {
    "name": "flash/text/engine/TextElement",
    "offset": 89075,
    "length": 954,
    "defs": [
      "flash.text.engine:TextElement"
    ]
  },
  {
    "name": "flash/concurrent/Mutex",
    "offset": 90029,
    "length": 2484,
    "defs": [
      "flash.concurrent:Mutex",
      "flash.concurrent:Condition",
      "avm2.intrinsics.memory:mfence",
      "avm2.intrinsics.memory:casi32"
    ]
  },
  {
    "name": "flash/display/NativeMenu",
    "offset": 92513,
    "length": 604,
    "defs": [
      "flash.display:NativeMenu"
    ]
  },
  {
    "name": "flash/ui/ContextMenu",
    "offset": 93117,
    "length": 2359,
    "defs": [
      "flash.ui:ContextMenu"
    ]
  },
  {
    "name": "flash/net/drm/DRMManagerSession",
    "offset": 95476,
    "length": 20509,
    "defs": [
      "flash.net.drm:DRMManagerSession",
      "flash.net.drm:DRMAuthenticationContext",
      "flash.net.drm:DRMPlaybackTimeWindow",
      "flash.net.drm:DRMVoucher",
      "flash.net.drm:DRMVoucherDownloadContext",
      "flash.net.drm:DRMVoucherStoreContext",
      "flash.net.drm:DRMManager",
      "flash.net.drm:DRMModuleCycleProvider",
      "flash.net.drm:DRMURLDownloadContext"
    ]
  },
  {
    "name": "flash/display/IBitmapDrawable",
    "offset": 115985,
    "length": 281,
    "defs": [
      "flash.display:IBitmapDrawable"
    ]
  },
  {
    "name": "flash/display/DisplayObject",
    "offset": 116266,
    "length": 5912,
    "defs": [
      "flash.display:DisplayObject"
    ]
  },
  {
    "name": "flash/display/Bitmap",
    "offset": 122178,
    "length": 1149,
    "defs": [
      "flash.display:Bitmap"
    ]
  },
  {
    "name": "flash/globalization/DateTimeFormatter",
    "offset": 123327,
    "length": 2422,
    "defs": [
      "flash.globalization:DateTimeFormatter"
    ]
  },
  {
    "name": "flash/media/VideoStatus",
    "offset": 125749,
    "length": 545,
    "defs": [
      "flash.media:VideoStatus"
    ]
  },
  {
    "name": "flash/system/fscommand",
    "offset": 126294,
    "length": 632,
    "defs": [
      "flash.system:fscommand",
      "flash.system:FSCommand"
    ]
  },
  {
    "name": "adobe/utils/MMExecute",
    "offset": 126926,
    "length": 436,
    "defs": [
      "adobe.utils:MMExecute",
      "adobe.utils:MMEndCommand"
    ]
  },
  {
    "name": "flash/external/ExternalInterface",
    "offset": 127362,
    "length": 7206,
    "defs": [
      "flash.external:ExternalInterface"
    ]
  },
  {
    "name": "flash/security/CertificateStatus",
    "offset": 134568,
    "length": 939,
    "defs": [
      "flash.security:CertificateStatus"
    ]
  },
  {
    "name": "flash/system/Security",
    "offset": 135507,
    "length": 2365,
    "defs": [
      "flash.system:Security"
    ]
  },
  {
    "name": "flash/events/Event",
    "offset": 137872,
    "length": 4511,
    "defs": [
      "flash.events:Event"
    ]
  },
  {
    "name": "flash/events/KeyboardEvent",
    "offset": 142383,
    "length": 2329,
    "defs": [
      "flash.events:KeyboardEvent"
    ]
  },
  {
    "name": "flash/net/navigateToURL",
    "offset": 144712,
    "length": 392,
    "defs": [
      "flash.net:navigateToURL",
      "flash.net:sendToURL"
    ]
  },
  {
    "name": "flash/events/SoftKeyboardTrigger",
    "offset": 145104,
    "length": 562,
    "defs": [
      "flash.events:SoftKeyboardTrigger"
    ]
  },
  {
    "name": "flash/display3D/Context3DRenderMode",
    "offset": 145666,
    "length": 534,
    "defs": [
      "flash.display3D:Context3DRenderMode"
    ]
  },
  {
    "name": "flash/ui/GameInputControl",
    "offset": 146200,
    "length": 1234,
    "defs": [
      "flash.ui:GameInputControl"
    ]
  },
  {
    "name": "flash/geom/Matrix",
    "offset": 147434,
    "length": 4980,
    "defs": [
      "flash.geom:Matrix"
    ]
  },
  {
    "name": "flash/events/ThrottleType",
    "offset": 152414,
    "length": 534,
    "defs": [
      "flash.events:ThrottleType"
    ]
  },
  {
    "name": "flash/text/TextInteractionMode",
    "offset": 152948,
    "length": 526,
    "defs": [
      "flash.text:TextInteractionMode"
    ]
  },
  {
    "name": "flash/filters/DisplacementMapFilterMode",
    "offset": 153474,
    "length": 636,
    "defs": [
      "flash.filters:DisplacementMapFilterMode"
    ]
  },
  {
    "name": "flash/geom/Rectangle",
    "offset": 154110,
    "length": 5057,
    "defs": [
      "flash.geom:Rectangle"
    ]
  },
  {
    "name": "flash/net/drm/AuthenticationMethod",
    "offset": 159167,
    "length": 1246,
    "defs": [
      "flash.net.drm:AuthenticationMethod",
      "flash.net.drm:LoadVoucherSetting",
      "flash.net.drm:AddToDeviceGroupSetting"
    ]
  },
  {
    "name": "flash/utils/Timer",
    "offset": 160413,
    "length": 2134,
    "defs": [
      "flash.utils:Timer"
    ]
  },
  {
    "name": "flash/utils/SetIntervalTimer",
    "offset": 162547,
    "length": 1758,
    "defs": [
      "flash.utils:SetIntervalTimer",
      "flash.utils:setInterval",
      "flash.utils:setTimeout",
      "flash.utils:clearInterval",
      "flash.utils:clearTimeout"
    ]
  },
  {
    "name": "flash/text/engine/TextJustifier",
    "offset": 164305,
    "length": 1512,
    "defs": [
      "flash.text.engine:TextJustifier"
    ]
  },
  {
    "name": "flash/media/Microphone",
    "offset": 165817,
    "length": 3070,
    "defs": [
      "flash.media:Microphone"
    ]
  },
  {
    "name": "flash/sensors/Accelerometer",
    "offset": 168887,
    "length": 958,
    "defs": [
      "flash.sensors:Accelerometer"
    ]
  },
  {
    "name": "flash/display3D/textures/TextureBase",
    "offset": 169845,
    "length": 622,
    "defs": [
      "flash.display3D.textures:TextureBase"
    ]
  },
  {
    "name": "flash/display3D/textures/Texture",
    "offset": 170467,
    "length": 1061,
    "defs": [
      "flash.display3D.textures:Texture"
    ]
  },
  {
    "name": "flash/net/drm/DRMDeviceGroup",
    "offset": 171528,
    "length": 1200,
    "defs": [
      "flash.net.drm:DRMDeviceGroup"
    ]
  },
  {
    "name": "flash/display/InteractiveObject",
    "offset": 172728,
    "length": 4152,
    "defs": [
      "flash.display:InteractiveObject"
    ]
  },
  {
    "name": "flash/display/DisplayObjectContainer",
    "offset": 176880,
    "length": 2730,
    "defs": [
      "flash.display:DisplayObjectContainer"
    ]
  },
  {
    "name": "flash/display/FocusDirection",
    "offset": 179610,
    "length": 11058,
    "defs": [
      "flash.display:FocusDirection",
      "flash.display:Stage"
    ]
  },
  {
    "name": "flash/events/UncaughtErrorEvents",
    "offset": 190668,
    "length": 573,
    "defs": [
      "flash.events:UncaughtErrorEvents"
    ]
  },
  {
    "name": "flash/display/IGraphicsData",
    "offset": 191241,
    "length": 289,
    "defs": [
      "flash.display:IGraphicsData"
    ]
  },
  {
    "name": "flash/display/IGraphicsFill",
    "offset": 191530,
    "length": 289,
    "defs": [
      "flash.display:IGraphicsFill"
    ]
  },
  {
    "name": "flash/display/GraphicsEndFill",
    "offset": 191819,
    "length": 485,
    "defs": [
      "flash.display:GraphicsEndFill"
    ]
  },
  {
    "name": "flash/accessibility/Accessibility",
    "offset": 192304,
    "length": 842,
    "defs": [
      "flash.accessibility:Accessibility"
    ]
  },
  {
    "name": "flash/text/GridFitType",
    "offset": 193146,
    "length": 503,
    "defs": [
      "flash.text:GridFitType"
    ]
  },
  {
    "name": "flash/globalization/CollatorMode",
    "offset": 193649,
    "length": 517,
    "defs": [
      "flash.globalization:CollatorMode"
    ]
  },
  {
    "name": "adobe/utils/CustomActions",
    "offset": 194166,
    "length": 799,
    "defs": [
      "adobe.utils:CustomActions"
    ]
  },
  {
    "name": "flash/errors/StackOverflowError",
    "offset": 194965,
    "length": 1011,
    "defs": [
      "flash.errors:StackOverflowError",
      "flash.errors:ScriptTimeoutError",
      "flash.errors:InvalidSWFError"
    ]
  },
  {
    "name": "flash/media/VideoCodec",
    "offset": 195976,
    "length": 510,
    "defs": [
      "flash.media:VideoCodec"
    ]
  },
  {
    "name": "flash/geom/Point",
    "offset": 196486,
    "length": 2138,
    "defs": [
      "flash.geom:Point"
    ]
  },
  {
    "name": "flash/ui/Mouse",
    "offset": 198624,
    "length": 996,
    "defs": [
      "flash.ui:Mouse"
    ]
  },
  {
    "name": "flash/xml/XMLParser",
    "offset": 199620,
    "length": 619,
    "defs": [
      "flash.xml:XMLParser"
    ]
  },
  {
    "name": "flash/net/NetGroupInfo",
    "offset": 200239,
    "length": 2622,
    "defs": [
      "flash.net:NetGroupInfo"
    ]
  },
  {
    "name": "flash/display/ShaderJob",
    "offset": 202861,
    "length": 1486,
    "defs": [
      "flash.display:ShaderJob"
    ]
  },
  {
    "name": "flash/text/FontStyle",
    "offset": 204347,
    "length": 547,
    "defs": [
      "flash.text:FontStyle"
    ]
  },
  {
    "name": "flash/accessibility/ISearchableText",
    "offset": 204894,
    "length": 479,
    "defs": [
      "flash.accessibility:ISearchableText"
    ]
  },
  {
    "name": "flash/display/GraphicsShaderFill",
    "offset": 205373,
    "length": 648,
    "defs": [
      "flash.display:GraphicsShaderFill"
    ]
  },
  {
    "name": "flash/net/NetStream",
    "offset": 206021,
    "length": 12820,
    "defs": [
      "flash.net:NetStream"
    ]
  },
  {
    "name": "flash/printing/PrintJobOptions",
    "offset": 218841,
    "length": 520,
    "defs": [
      "flash.printing:PrintJobOptions"
    ]
  },
  {
    "name": "flash/net/FileReference",
    "offset": 219361,
    "length": 3031,
    "defs": [
      "flash.net:FileReference"
    ]
  },
  {
    "name": "flash/display/StageQuality",
    "offset": 222392,
    "length": 777,
    "defs": [
      "flash.display:StageQuality"
    ]
  },
  {
    "name": "flash/geom/Transform",
    "offset": 223169,
    "length": 1655,
    "defs": [
      "flash.geom:Transform"
    ]
  },
  {
    "name": "flash/accessibility/AccessibilityProperties",
    "offset": 224824,
    "length": 783,
    "defs": [
      "flash.accessibility:AccessibilityProperties"
    ]
  },
  {
    "name": "flash/filters/BitmapFilter",
    "offset": 225607,
    "length": 554,
    "defs": [
      "flash.filters:BitmapFilter"
    ]
  },
  {
    "name": "flash/filters/DropShadowFilter",
    "offset": 226161,
    "length": 2578,
    "defs": [
      "flash.filters:DropShadowFilter"
    ]
  },
  {
    "name": "flash/system/ApplicationInstaller",
    "offset": 228739,
    "length": 1092,
    "defs": [
      "flash.system:ApplicationInstaller"
    ]
  },
  {
    "name": "flash/display3D/Context3DVertexBufferFormat",
    "offset": 229831,
    "length": 725,
    "defs": [
      "flash.display3D:Context3DVertexBufferFormat"
    ]
  },
  {
    "name": "flash/globalization/DateTimeNameContext",
    "offset": 230556,
    "length": 561,
    "defs": [
      "flash.globalization:DateTimeNameContext"
    ]
  },
  {
    "name": "flash/display/GraphicsSolidFill",
    "offset": 231117,
    "length": 635,
    "defs": [
      "flash.display:GraphicsSolidFill"
    ]
  },
  {
    "name": "flash/display/ShaderParameterType",
    "offset": 231752,
    "length": 1144,
    "defs": [
      "flash.display:ShaderParameterType"
    ]
  },
  {
    "name": "flash/filters/GradientGlowFilter",
    "offset": 232896,
    "length": 2661,
    "defs": [
      "flash.filters:GradientGlowFilter"
    ]
  },
  {
    "name": "JSON",
    "offset": 235557,
    "length": 2655,
    "defs": [
      "JSON",
      "Walker"
    ]
  },
  {
    "name": "flash/system/SecurityDomain",
    "offset": 238212,
    "length": 813,
    "defs": [
      "flash.system:SecurityDomain"
    ]
  },
  {
    "name": "flash/net/IDynamicPropertyOutput",
    "offset": 239025,
    "length": 507,
    "defs": [
      "flash.net:IDynamicPropertyOutput"
    ]
  },
  {
    "name": "flash/net/DynamicPropertyOutput",
    "offset": 239532,
    "length": 695,
    "defs": [
      "flash.net:DynamicPropertyOutput"
    ]
  },
  {
    "name": "flash/media/SoundTransform",
    "offset": 240227,
    "length": 1599,
    "defs": [
      "flash.media:SoundTransform"
    ]
  },
  {
    "name": "flash/text/engine/FontLookup",
    "offset": 241826,
    "length": 501,
    "defs": [
      "flash.text.engine:FontLookup"
    ]
  },
  {
    "name": "flash/display/MorphShape",
    "offset": 242327,
    "length": 526,
    "defs": [
      "flash.display:MorphShape"
    ]
  },
  {
    "name": "flash/net/LocalConnection",
    "offset": 242853,
    "length": 1613,
    "defs": [
      "flash.net:LocalConnection"
    ]
  },
  {
    "name": "flash/display3D/Program3D",
    "offset": 244466,
    "length": 707,
    "defs": [
      "flash.display3D:Program3D"
    ]
  },
  {
    "name": "flash/ui/MouseCursor",
    "offset": 245173,
    "length": 596,
    "defs": [
      "flash.ui:MouseCursor"
    ]
  },
  {
    "name": "flash/events/TextEvent",
    "offset": 245769,
    "length": 1293,
    "defs": [
      "flash.events:TextEvent"
    ]
  },
  {
    "name": "flash/net/URLRequestHeader",
    "offset": 247062,
    "length": 542,
    "defs": [
      "flash.net:URLRequestHeader"
    ]
  },
  {
    "name": "flash/display/TriangleCulling",
    "offset": 247604,
    "length": 561,
    "defs": [
      "flash.display:TriangleCulling"
    ]
  },
  {
    "name": "flash/display/JPEGEncoderOptions",
    "offset": 248165,
    "length": 624,
    "defs": [
      "flash.display:JPEGEncoderOptions"
    ]
  },
  {
    "name": "flash/net/URLLoader",
    "offset": 248789,
    "length": 2592,
    "defs": [
      "flash.net:URLLoader"
    ]
  },
  {
    "name": "flash/accessibility/ISimpleTextSelection",
    "offset": 251381,
    "length": 685,
    "defs": [
      "flash.accessibility:ISimpleTextSelection"
    ]
  },
  {
    "name": "flash/display/Sprite",
    "offset": 252066,
    "length": 1976,
    "defs": [
      "flash.display:Sprite"
    ]
  },
  {
    "name": "_3fa260287b70f9c2758634de100a49d54c3f5d3f6359cd77d07fc7f4a8ccecbd_flash_display_Sprite",
    "offset": 254042,
    "length": 1433,
    "defs": [
      "_3fa260287b70f9c2758634de100a49d54c3f5d3f6359cd77d07fc7f4a8ccecbd_flash_display_Sprite"
    ]
  },
  {
    "name": "flash/utils/IDataOutput",
    "offset": 255475,
    "length": 1976,
    "defs": [
      "flash.utils:IDataOutput"
    ]
  },
  {
    "name": "flash/net/Socket",
    "offset": 257451,
    "length": 4914,
    "defs": [
      "flash.net:Socket"
    ]
  },
  {
    "name": "flash/net/SecureSocket",
    "offset": 262365,
    "length": 3247,
    "defs": [
      "flash.net:SecureSocket"
    ]
  },
  {
    "name": "flash/text/engine/TypographicCase",
    "offset": 265612,
    "length": 793,
    "defs": [
      "flash.text.engine:TypographicCase"
    ]
  },
  {
    "name": "flash/display/IGraphicsPath",
    "offset": 266405,
    "length": 289,
    "defs": [
      "flash.display:IGraphicsPath"
    ]
  },
  {
    "name": "flash/display/GraphicsTrianglePath",
    "offset": 266694,
    "length": 1240,
    "defs": [
      "flash.display:GraphicsTrianglePath"
    ]
  },
  {
    "name": "flash/display/PixelSnapping",
    "offset": 267934,
    "length": 521,
    "defs": [
      "flash.display:PixelSnapping"
    ]
  },
  {
    "name": "flash/display3D/Context3DProgramType",
    "offset": 268455,
    "length": 543,
    "defs": [
      "flash.display3D:Context3DProgramType"
    ]
  },
  {
    "name": "flash/display/Shape",
    "offset": 268998,
    "length": 590,
    "defs": [
      "flash.display:Shape"
    ]
  },
  {
    "name": "flash/media/SoundMixer",
    "offset": 269588,
    "length": 1436,
    "defs": [
      "flash.media:SoundMixer"
    ]
  },
  {
    "name": "flash/filters/ConvolutionFilter",
    "offset": 271024,
    "length": 2284,
    "defs": [
      "flash.filters:ConvolutionFilter"
    ]
  },
  {
    "name": "flash/net/NetGroupReceiveMode",
    "offset": 273308,
    "length": 523,
    "defs": [
      "flash.net:NetGroupReceiveMode"
    ]
  },
  {
    "name": "flash/events/DRMDeviceGroupEvent",
    "offset": 273831,
    "length": 1334,
    "defs": [
      "flash.events:DRMDeviceGroupEvent"
    ]
  },
  {
    "name": "flash/text/engine/TextLineCreationResult",
    "offset": 275165,
    "length": 689,
    "defs": [
      "flash.text.engine:TextLineCreationResult"
    ]
  },
  {
    "name": "flash/events/StatusEvent",
    "offset": 275854,
    "length": 1267,
    "defs": [
      "flash.events:StatusEvent"
    ]
  },
  {
    "name": "flash/display/ShaderData",
    "offset": 277121,
    "length": 672,
    "defs": [
      "flash.display:ShaderData"
    ]
  },
  {
    "name": "flash/system/WorkerState",
    "offset": 277793,
    "length": 2870,
    "defs": [
      "flash.system:WorkerState",
      "flash.system:Worker"
    ]
  },
  {
    "name": "flash/system/LoaderContext",
    "offset": 280663,
    "length": 1320,
    "defs": [
      "flash.system:LoaderContext"
    ]
  },
  {
    "name": "flash/system/JPEGLoaderContext",
    "offset": 281983,
    "length": 735,
    "defs": [
      "flash.system:JPEGLoaderContext"
    ]
  },
  {
    "name": "flash/debugger/enterDebugger",
    "offset": 282718,
    "length": 279,
    "defs": [
      "flash.debugger:enterDebugger"
    ]
  },
  {
    "name": "flash/ui/Multitouch",
    "offset": 282997,
    "length": 1121,
    "defs": [
      "flash.ui:Multitouch"
    ]
  },
  {
    "name": "Date",
    "offset": 284118,
    "length": 10379,
    "defs": [
      "Date"
    ]
  },
  {
    "name": "flash/display/SWFVersion",
    "offset": 294497,
    "length": 864,
    "defs": [
      "flash.display:SWFVersion"
    ]
  },
  {
    "name": "flash/events/ProgressEvent",
    "offset": 295361,
    "length": 1435,
    "defs": [
      "flash.events:ProgressEvent"
    ]
  },
  {
    "name": "flash/media/scanHardware",
    "offset": 296796,
    "length": 2968,
    "defs": [
      "flash.media:scanHardware",
      "flash.media:Camera"
    ]
  },
  {
    "name": "flash/text/engine/TextBaseline",
    "offset": 299764,
    "length": 832,
    "defs": [
      "flash.text.engine:TextBaseline"
    ]
  },
  {
    "name": "flash/text/AntiAliasType",
    "offset": 300596,
    "length": 474,
    "defs": [
      "flash.text:AntiAliasType"
    ]
  },
  {
    "name": "flash/net/NetGroup",
    "offset": 301070,
    "length": 5049,
    "defs": [
      "flash.net:NetGroup"
    ]
  },
  {
    "name": "flash/events/ErrorEvent",
    "offset": 306119,
    "length": 1052,
    "defs": [
      "flash.events:ErrorEvent"
    ]
  },
  {
    "name": "flash/events/IOErrorEvent",
    "offset": 307171,
    "length": 1204,
    "defs": [
      "flash.events:IOErrorEvent"
    ]
  },
  {
    "name": "flash/utils/describeType",
    "offset": 308375,
    "length": 1393,
    "defs": [
      "flash.utils:describeType",
      "flash.utils:getAliasName",
      "flash.utils:getQualifiedClassName",
      "flash.utils:getDefinitionByName",
      "flash.utils:getQualifiedSuperclassName",
      "flash.utils:getTimer",
      "flash.utils:escapeMultiByte",
      "flash.utils:unescapeMultiByte",
      "trace",
      "watson"
    ]
  },
  {
    "name": "flash/display/ColorCorrectionSupport",
    "offset": 309768,
    "length": 621,
    "defs": [
      "flash.display:ColorCorrectionSupport"
    ]
  },
  {
    "name": "flash/ui/MultitouchInputMode",
    "offset": 310389,
    "length": 573,
    "defs": [
      "flash.ui:MultitouchInputMode"
    ]
  },
  {
    "name": "flash/text/TextFormatAlign",
    "offset": 310962,
    "length": 658,
    "defs": [
      "flash.text:TextFormatAlign"
    ]
  },
  {
    "name": "flash/text/engine/Kerning",
    "offset": 311620,
    "length": 500,
    "defs": [
      "flash.text.engine:Kerning"
    ]
  },
  {
    "name": "flash/net/NetStreamAppendBytesAction",
    "offset": 312120,
    "length": 639,
    "defs": [
      "flash.net:NetStreamAppendBytesAction"
    ]
  },
  {
    "name": "flash/display/IGraphicsStroke",
    "offset": 312759,
    "length": 297,
    "defs": [
      "flash.display:IGraphicsStroke"
    ]
  },
  {
    "name": "flash/net/NetGroupSendResult",
    "offset": 313056,
    "length": 560,
    "defs": [
      "flash.net:NetGroupSendResult"
    ]
  },
  {
    "name": "flash/display/LineScaleMode",
    "offset": 313616,
    "length": 582,
    "defs": [
      "flash.display:LineScaleMode"
    ]
  },
  {
    "name": "flash/events/AsyncErrorEvent",
    "offset": 314198,
    "length": 1076,
    "defs": [
      "flash.events:AsyncErrorEvent"
    ]
  },
  {
    "name": "flash/display/StageScaleMode",
    "offset": 315274,
    "length": 595,
    "defs": [
      "flash.display:StageScaleMode"
    ]
  },
  {
    "name": "flash/ui/GameInput",
    "offset": 315869,
    "length": 835,
    "defs": [
      "flash.ui:GameInput"
    ]
  },
  {
    "name": "flash/filters/BitmapFilterQuality",
    "offset": 316704,
    "length": 535,
    "defs": [
      "flash.filters:BitmapFilterQuality"
    ]
  },
  {
    "name": "flash/profiler/profile",
    "offset": 317239,
    "length": 454,
    "defs": [
      "flash.profiler:profile",
      "flash.profiler:showRedrawRegions"
    ]
  },
  {
    "name": "flash/display/BitmapData",
    "offset": 317693,
    "length": 4790,
    "defs": [
      "flash.display:BitmapData"
    ]
  },
  {
    "name": "flash/events/ShaderEvent",
    "offset": 322483,
    "length": 1669,
    "defs": [
      "flash.events:ShaderEvent"
    ]
  },
  {
    "name": "flash/events/TimerEvent",
    "offset": 324152,
    "length": 1048,
    "defs": [
      "flash.events:TimerEvent"
    ]
  },
  {
    "name": "XML",
    "offset": 325200,
    "length": 12638,
    "defs": [
      "XML",
      "XMLList",
      "QName"
    ]
  },
  {
    "name": "flash/ui/GameInputHand",
    "offset": 337838,
    "length": 523,
    "defs": [
      "flash.ui:GameInputHand"
    ]
  },
  {
    "name": "Math",
    "offset": 338361,
    "length": 1672,
    "defs": [
      "Math"
    ]
  },
  {
    "name": "flash/events/DRMAuthenticateEvent",
    "offset": 340033,
    "length": 2108,
    "defs": [
      "flash.events:DRMAuthenticateEvent"
    ]
  },
  {
    "name": "flash/media/H264Level",
    "offset": 342141,
    "length": 1104,
    "defs": [
      "flash.media:H264Level"
    ]
  },
  {
    "name": "flash/text/FontType",
    "offset": 343245,
    "length": 504,
    "defs": [
      "flash.text:FontType"
    ]
  },
  {
    "name": "flash/display/NativeMenuItem",
    "offset": 343749,
    "length": 787,
    "defs": [
      "flash.display:NativeMenuItem"
    ]
  },
  {
    "name": "flash/net/FileFilter",
    "offset": 344536,
    "length": 937,
    "defs": [
      "flash.net:FileFilter"
    ]
  },
  {
    "name": "flash/text/Font",
    "offset": 345473,
    "length": 845,
    "defs": [
      "flash.text:Font"
    ]
  },
  {
    "name": "flash/events/SampleDataEvent",
    "offset": 346318,
    "length": 1415,
    "defs": [
      "flash.events:SampleDataEvent"
    ]
  },
  {
    "name": "flash/utils/Endian",
    "offset": 347733,
    "length": 454,
    "defs": [
      "flash.utils:Endian"
    ]
  },
  {
    "name": "flash/filters/BevelFilter",
    "offset": 348187,
    "length": 2674,
    "defs": [
      "flash.filters:BevelFilter"
    ]
  },
  {
    "name": "flash/net/SharedObject",
    "offset": 350861,
    "length": 3383,
    "defs": [
      "flash.net:SharedObject"
    ]
  },
  {
    "name": "flash/media/SoundLoaderContext",
    "offset": 354244,
    "length": 596,
    "defs": [
      "flash.media:SoundLoaderContext"
    ]
  },
  {
    "name": "flash/events/AccelerometerEvent",
    "offset": 354840,
    "length": 1946,
    "defs": [
      "flash.events:AccelerometerEvent"
    ]
  },
  {
    "name": "flash/display/ShaderParameter",
    "offset": 356786,
    "length": 845,
    "defs": [
      "flash.display:ShaderParameter"
    ]
  },
  {
    "name": "flash/ui/ContextMenuClipboardItems",
    "offset": 357631,
    "length": 1879,
    "defs": [
      "flash.ui:ContextMenuClipboardItems"
    ]
  },
  {
    "name": "flash/media/SoundCodec",
    "offset": 359510,
    "length": 563,
    "defs": [
      "flash.media:SoundCodec"
    ]
  },
  {
    "name": "flash/events/DRMCustomProperties",
    "offset": 360073,
    "length": 2540,
    "defs": [
      "flash.events:DRMCustomProperties",
      "flash.events:DRMStatusEvent"
    ]
  },
  {
    "name": "flash/automation/ActionGenerator",
    "offset": 362613,
    "length": 801,
    "defs": [
      "flash.automation:ActionGenerator"
    ]
  },
  {
    "name": "flash/text/TextFormat",
    "offset": 363414,
    "length": 3332,
    "defs": [
      "flash.text:TextFormat"
    ]
  },
  {
    "name": "flash/events/NetStatusEvent",
    "offset": 366746,
    "length": 1085,
    "defs": [
      "flash.events:NetStatusEvent"
    ]
  },
  {
    "name": "flash/display/GraphicsBitmapFill",
    "offset": 367831,
    "length": 760,
    "defs": [
      "flash.display:GraphicsBitmapFill"
    ]
  },
  {
    "name": "flash/system/DomainMemoryWithStage3D",
    "offset": 368591,
    "length": 1743,
    "defs": [
      "flash.system:DomainMemoryWithStage3D"
    ]
  },
  {
    "name": "flash/system/MessageChannelState",
    "offset": 370334,
    "length": 2210,
    "defs": [
      "flash.system:MessageChannelState",
      "flash.system:MessageChannel"
    ]
  },
  {
    "name": "RegExp",
    "offset": 372544,
    "length": 1471,
    "defs": [
      "RegExp"
    ]
  },
  {
    "name": "flash/display/LoaderInfo",
    "offset": 374015,
    "length": 3881,
    "defs": [
      "flash.display:LoaderInfo"
    ]
  },
  {
    "name": "flash/text/TextDisplayMode",
    "offset": 377896,
    "length": 518,
    "defs": [
      "flash.text:TextDisplayMode"
    ]
  },
  {
    "name": "flash/net/URLRequestMethod",
    "offset": 378414,
    "length": 624,
    "defs": [
      "flash.net:URLRequestMethod"
    ]
  },
  {
    "name": "flash/display/Shader",
    "offset": 379038,
    "length": 961,
    "defs": [
      "flash.display:Shader"
    ]
  },
  {
    "name": "flash/events/NetDataEvent",
    "offset": 379999,
    "length": 1149,
    "defs": [
      "flash.events:NetDataEvent"
    ]
  },
  {
    "name": "flash/system/ImageDecodingPolicy",
    "offset": 381148,
    "length": 539,
    "defs": [
      "flash.system:ImageDecodingPolicy"
    ]
  },
  {
    "name": "flash/display/GraphicsGradientFill",
    "offset": 381687,
    "length": 2224,
    "defs": [
      "flash.display:GraphicsGradientFill"
    ]
  },
  {
    "name": "flash/text/engine/TextLineMirrorRegion",
    "offset": 383911,
    "length": 1170,
    "defs": [
      "flash.text.engine:TextLineMirrorRegion"
    ]
  },
  {
    "name": "flash/display3D/IndexBuffer3D",
    "offset": 385081,
    "length": 921,
    "defs": [
      "flash.display3D:IndexBuffer3D"
    ]
  },
  {
    "name": "flash/events/IMEEvent",
    "offset": 386002,
    "length": 1303,
    "defs": [
      "flash.events:IMEEvent"
    ]
  },
  {
    "name": "flash/text/engine/TextLine",
    "offset": 387305,
    "length": 5029,
    "defs": [
      "flash.text.engine:TextLine"
    ]
  },
  {
    "name": "flash/display3D/VertexBuffer3D",
    "offset": 392334,
    "length": 940,
    "defs": [
      "flash.display3D:VertexBuffer3D"
    ]
  },
  {
    "name": "flash/utils/CompressionAlgorithm",
    "offset": 393274,
    "length": 5295,
    "defs": [
      "flash.utils:CompressionAlgorithm",
      "flash.utils:IDataInput2",
      "flash.utils:IDataOutput2",
      "flash.utils:ByteArray"
    ]
  },
  {
    "name": "flash/display/FrameLabel",
    "offset": 398569,
    "length": 871,
    "defs": [
      "flash.display:FrameLabel"
    ]
  },
  {
    "name": "adobe/utils/ProductManager",
    "offset": 399440,
    "length": 2071,
    "defs": [
      "adobe.utils:ProductManager"
    ]
  },
  {
    "name": "flash/events/GameInputEvent",
    "offset": 401511,
    "length": 849,
    "defs": [
      "flash.events:GameInputEvent"
    ]
  },
  {
    "name": "flash/net/ObjectEncoding",
    "offset": 402360,
    "length": 794,
    "defs": [
      "flash.net:ObjectEncoding"
    ]
  },
  {
    "name": "flash/geom/Matrix3D",
    "offset": 403154,
    "length": 3313,
    "defs": [
      "flash.geom:Matrix3D"
    ]
  },
  {
    "name": "flash/media/H264Profile",
    "offset": 406467,
    "length": 474,
    "defs": [
      "flash.media:H264Profile"
    ]
  },
  {
    "name": "flash/display/Scene",
    "offset": 406941,
    "length": 802,
    "defs": [
      "flash.display:Scene"
    ]
  },
  {
    "name": "flash/display3D/Context3DClearMask",
    "offset": 407743,
    "length": 611,
    "defs": [
      "flash.display3D:Context3DClearMask"
    ]
  },
  {
    "name": "flash/net/NetStreamMulticastInfo",
    "offset": 408354,
    "length": 5325,
    "defs": [
      "flash.net:NetStreamMulticastInfo"
    ]
  },
  {
    "name": "flash/globalization/LastOperationStatus",
    "offset": 413679,
    "length": 1671,
    "defs": [
      "flash.globalization:LastOperationStatus"
    ]
  },
  {
    "name": "flash/events/ActivityEvent",
    "offset": 415350,
    "length": 1099,
    "defs": [
      "flash.events:ActivityEvent"
    ]
  },
  {
    "name": "flash/net/NetConnection",
    "offset": 416449,
    "length": 3692,
    "defs": [
      "flash.net:NetConnection"
    ]
  },
  {
    "name": "flash/events/VideoEvent",
    "offset": 420141,
    "length": 968,
    "defs": [
      "flash.events:VideoEvent"
    ]
  },
  {
    "name": "flash/filters/BitmapFilterType",
    "offset": 421109,
    "length": 535,
    "defs": [
      "flash.filters:BitmapFilterType"
    ]
  },
  {
    "name": "flash/display/SpreadMethod",
    "offset": 421644,
    "length": 519,
    "defs": [
      "flash.display:SpreadMethod"
    ]
  },
  {
    "name": "flash/text/TextField",
    "offset": 422163,
    "length": 10471,
    "defs": [
      "flash.text:TextField"
    ]
  },
  {
    "name": "flash/events/GestureEvent",
    "offset": 432634,
    "length": 2768,
    "defs": [
      "flash.events:GestureEvent"
    ]
  },
  {
    "name": "flash/events/PressAndTapGestureEvent",
    "offset": 435402,
    "length": 2208,
    "defs": [
      "flash.events:PressAndTapGestureEvent"
    ]
  },
  {
    "name": "flash/media/SoundChannel",
    "offset": 437610,
    "length": 1031,
    "defs": [
      "flash.media:SoundChannel"
    ]
  },
  {
    "name": "flash/text/engine/EastAsianJustifier",
    "offset": 438641,
    "length": 1350,
    "defs": [
      "flash.text.engine:EastAsianJustifier"
    ]
  },
  {
    "name": "flash/accessibility/AccessibilityImplementation",
    "offset": 439991,
    "length": 2663,
    "defs": [
      "flash.accessibility:AccessibilityImplementation"
    ]
  },
  {
    "name": "flash/text/CSMSettings",
    "offset": 442654,
    "length": 648,
    "defs": [
      "flash.text:CSMSettings"
    ]
  },
  {
    "name": "flash/net/drm/DRMContentData",
    "offset": 443302,
    "length": 2300,
    "defs": [
      "flash.net.drm:DRMContentData"
    ]
  },
  {
    "name": "flash/events/StageVideoAvailabilityEvent",
    "offset": 445602,
    "length": 890,
    "defs": [
      "flash.events:StageVideoAvailabilityEvent"
    ]
  },
  {
    "name": "flash/net/NetGroupSendMode",
    "offset": 446492,
    "length": 538,
    "defs": [
      "flash.net:NetGroupSendMode"
    ]
  },
  {
    "name": "flash/text/TextRun",
    "offset": 447030,
    "length": 569,
    "defs": [
      "flash.text:TextRun"
    ]
  },
  {
    "name": "flash/net/XMLSocket",
    "offset": 447599,
    "length": 2766,
    "defs": [
      "flash.net:XMLSocket"
    ]
  },
  {
    "name": "flash/utils/Dictionary",
    "offset": 450365,
    "length": 722,
    "defs": [
      "flash.utils:Dictionary"
    ]
  },
  {
    "name": "flash/display3D/Context3DCompareMode",
    "offset": 451087,
    "length": 827,
    "defs": [
      "flash.display3D:Context3DCompareMode"
    ]
  },
  {
    "name": "flash/text/TextFieldAutoSize",
    "offset": 451914,
    "length": 578,
    "defs": [
      "flash.text:TextFieldAutoSize"
    ]
  },
  {
    "name": "flash/text/engine/GroupElement",
    "offset": 452492,
    "length": 1911,
    "defs": [
      "flash.text.engine:GroupElement"
    ]
  },
  {
    "name": "flash/automation/AutomationAction",
    "offset": 454403,
    "length": 669,
    "defs": [
      "flash.automation:AutomationAction"
    ]
  },
  {
    "name": "flash/automation/KeyboardAutomationAction",
    "offset": 455072,
    "length": 992,
    "defs": [
      "flash.automation:KeyboardAutomationAction"
    ]
  },
  {
    "name": "flash/net/NetStreamPlayOptions",
    "offset": 456064,
    "length": 891,
    "defs": [
      "flash.net:NetStreamPlayOptions"
    ]
  },
  {
    "name": "flash/text/engine/ElementFormat",
    "offset": 456955,
    "length": 4281,
    "defs": [
      "flash.text.engine:ElementFormat"
    ]
  },
  {
    "name": "flash/filters/DisplacementMapFilter",
    "offset": 461236,
    "length": 2454,
    "defs": [
      "flash.filters:DisplacementMapFilter"
    ]
  },
  {
    "name": "flash/globalization/CurrencyParseResult",
    "offset": 463690,
    "length": 936,
    "defs": [
      "flash.globalization:CurrencyParseResult"
    ]
  },
  {
    "name": "flash/display3D/Context3D",
    "offset": 464626,
    "length": 5441,
    "defs": [
      "flash.display3D:Context3D"
    ]
  },
  {
    "name": "flash/printing/PrintJob",
    "offset": 470067,
    "length": 2693,
    "defs": [
      "flash.printing:PrintJob"
    ]
  },
  {
    "name": "flash/xml/XMLNodeType",
    "offset": 472760,
    "length": 746,
    "defs": [
      "flash.xml:XMLNodeType"
    ]
  },
  {
    "name": "flash/events/TransformGestureEvent",
    "offset": 473506,
    "length": 2762,
    "defs": [
      "flash.events:TransformGestureEvent"
    ]
  },
  {
    "name": "flash/net/GroupSpecifier",
    "offset": 476268,
    "length": 9817,
    "defs": [
      "flash.net:GroupSpecifier"
    ]
  },
  {
    "name": "flash/system/SecurityPanel",
    "offset": 486085,
    "length": 760,
    "defs": [
      "flash.system:SecurityPanel"
    ]
  },
  {
    "name": "flash/globalization/Collator",
    "offset": 486845,
    "length": 2251,
    "defs": [
      "flash.globalization:Collator"
    ]
  },
  {
    "name": "flash/display/Graphics",
    "offset": 489096,
    "length": 5565,
    "defs": [
      "flash.display:Graphics"
    ]
  },
  {
    "name": "flash/ui/ContextMenuItem",
    "offset": 494661,
    "length": 1400,
    "defs": [
      "flash.ui:ContextMenuItem"
    ]
  },
  {
    "name": "flash/net/FileReferenceList",
    "offset": 496061,
    "length": 805,
    "defs": [
      "flash.net:FileReferenceList"
    ]
  },
  {
    "name": "flash/events/DataEvent",
    "offset": 496866,
    "length": 1126,
    "defs": [
      "flash.events:DataEvent"
    ]
  },
  {
    "name": "flash/ui/GameInputFinger",
    "offset": 497992,
    "length": 584,
    "defs": [
      "flash.ui:GameInputFinger"
    ]
  },
  {
    "name": "flash/geom/Utils3D",
    "offset": 498576,
    "length": 768,
    "defs": [
      "flash.geom:Utils3D"
    ]
  },
  {
    "name": "flash/text/TextColorType",
    "offset": 499344,
    "length": 476,
    "defs": [
      "flash.text:TextColorType"
    ]
  },
  {
    "name": "flash/ui/KeyLocation",
    "offset": 499820,
    "length": 574,
    "defs": [
      "flash.ui:KeyLocation"
    ]
  },
  {
    "name": "flash/display/BitmapDataChannel",
    "offset": 500394,
    "length": 566,
    "defs": [
      "flash.display:BitmapDataChannel"
    ]
  },
  {
    "name": "flash/text/StaticText",
    "offset": 500960,
    "length": 616,
    "defs": [
      "flash.text:StaticText"
    ]
  },
  {
    "name": "flash/events/FocusEvent",
    "offset": 501576,
    "length": 2097,
    "defs": [
      "flash.events:FocusEvent"
    ]
  },
  {
    "name": "flash/display/BlendMode",
    "offset": 503673,
    "length": 1090,
    "defs": [
      "flash.display:BlendMode"
    ]
  },
  {
    "name": "flash/net/SharedObjectFlushStatus",
    "offset": 504763,
    "length": 531,
    "defs": [
      "flash.net:SharedObjectFlushStatus"
    ]
  },
  {
    "name": "flash/display/GraphicsPath",
    "offset": 505294,
    "length": 2513,
    "defs": [
      "flash.display:GraphicsPath"
    ]
  },
  {
    "name": "flash/events/HTTPStatusEvent",
    "offset": 507807,
    "length": 1677,
    "defs": [
      "flash.events:HTTPStatusEvent"
    ]
  },
  {
    "name": "flash/geom/Orientation3D",
    "offset": 509484,
    "length": 560,
    "defs": [
      "flash.geom:Orientation3D"
    ]
  },
  {
    "name": "flash/text/engine/TextBlock",
    "offset": 510044,
    "length": 5617,
    "defs": [
      "flash.text.engine:TextBlock"
    ]
  },
  {
    "name": "flash/system/System",
    "offset": 515661,
    "length": 1753,
    "defs": [
      "flash.system:System"
    ]
  },
  {
    "name": "flash/filters/BlurFilter",
    "offset": 517414,
    "length": 1123,
    "defs": [
      "flash.filters:BlurFilter"
    ]
  },
  {
    "name": "flash/media/StageVideoAvailability",
    "offset": 518537,
    "length": 556,
    "defs": [
      "flash.media:StageVideoAvailability"
    ]
  },
  {
    "name": "flash/system/Capabilities",
    "offset": 519093,
    "length": 3483,
    "defs": [
      "flash.system:Capabilities"
    ]
  },
  {
    "name": "flash/system/ApplicationDomain",
    "offset": 522576,
    "length": 1494,
    "defs": [
      "flash.system:ApplicationDomain"
    ]
  },
  {
    "name": "flash/display/StageAlign",
    "offset": 524070,
    "length": 716,
    "defs": [
      "flash.display:StageAlign"
    ]
  },
  {
    "name": "flash/text/TextFieldType",
    "offset": 524786,
    "length": 470,
    "defs": [
      "flash.text:TextFieldType"
    ]
  },
  {
    "name": "flash/display/GraphicsStroke",
    "offset": 525256,
    "length": 2213,
    "defs": [
      "flash.display:GraphicsStroke"
    ]
  },
  {
    "name": "flash/utils/flash_proxy",
    "offset": 527469,
    "length": 1800,
    "defs": [
      "flash.utils:flash_proxy",
      "flash.utils:Proxy"
    ]
  },
  {
    "name": "flash/globalization/DateTimeStyle",
    "offset": 529269,
    "length": 647,
    "defs": [
      "flash.globalization:DateTimeStyle"
    ]
  },
  {
    "name": "flash/events/DRMAuthenticationErrorEvent",
    "offset": 529916,
    "length": 1895,
    "defs": [
      "flash.events:DRMAuthenticationErrorEvent"
    ]
  },
  {
    "name": "flash/net/NetGroupReplicationStrategy",
    "offset": 531811,
    "length": 591,
    "defs": [
      "flash.net:NetGroupReplicationStrategy"
    ]
  },
  {
    "name": "flash/events/NetFilterEvent",
    "offset": 532402,
    "length": 950,
    "defs": [
      "flash.events:NetFilterEvent"
    ]
  },
  {
    "name": "flash/geom/Vector3D",
    "offset": 533352,
    "length": 3920,
    "defs": [
      "flash.geom:Vector3D"
    ]
  },
  {
    "name": "flash/events/ThrottleEvent",
    "offset": 537272,
    "length": 1278,
    "defs": [
      "flash.events:ThrottleEvent"
    ]
  },
  {
    "name": "flash/globalization/LocaleID",
    "offset": 538550,
    "length": 1487,
    "defs": [
      "flash.globalization:LocaleID"
    ]
  },
  {
    "name": "flash/events/GesturePhase",
    "offset": 540037,
    "length": 570,
    "defs": [
      "flash.events:GesturePhase"
    ]
  },
  {
    "name": "flash/globalization/DateTimeNameStyle",
    "offset": 540607,
    "length": 627,
    "defs": [
      "flash.globalization:DateTimeNameStyle"
    ]
  },
  {
    "name": "flash/automation/MouseAutomationAction",
    "offset": 541234,
    "length": 1829,
    "defs": [
      "flash.automation:MouseAutomationAction"
    ]
  },
  {
    "name": "flash/ui/GameInputControlType",
    "offset": 543063,
    "length": 738,
    "defs": [
      "flash.ui:GameInputControlType"
    ]
  },
  {
    "name": "flash/display3D/Context3DTextureFormat",
    "offset": 543801,
    "length": 631,
    "defs": [
      "flash.display3D:Context3DTextureFormat"
    ]
  },
  {
    "name": "flash/ui/MouseCursorData",
    "offset": 544432,
    "length": 1004,
    "defs": [
      "flash.ui:MouseCursorData"
    ]
  },
  {
    "name": "flash/display/StageDisplayState",
    "offset": 545436,
    "length": 592,
    "defs": [
      "flash.display:StageDisplayState"
    ]
  },
  {
    "name": "flash/net/NetMonitor",
    "offset": 546028,
    "length": 655,
    "defs": [
      "flash.net:NetMonitor"
    ]
  },
  {
    "name": "flash/events/SyncEvent",
    "offset": 546683,
    "length": 1055,
    "defs": [
      "flash.events:SyncEvent"
    ]
  },
  {
    "name": "flash/globalization/NumberFormatter",
    "offset": 547738,
    "length": 3379,
    "defs": [
      "flash.globalization:NumberFormatter"
    ]
  },
  {
    "name": "flash/media/MicrophoneEnhancedOptions",
    "offset": 551117,
    "length": 2019,
    "defs": [
      "flash.media:MicrophoneEnhancedOptions"
    ]
  },
  {
    "name": "flash/xml/XMLNode",
    "offset": 553136,
    "length": 4338,
    "defs": [
      "flash.xml:XMLNode"
    ]
  },
  {
    "name": "flash/trace/Trace",
    "offset": 557474,
    "length": 1014,
    "defs": [
      "flash.trace:Trace"
    ]
  },
  {
    "name": "flash/system/IMEConversionMode",
    "offset": 558488,
    "length": 793,
    "defs": [
      "flash.system:IMEConversionMode"
    ]
  },
  {
    "name": "flash/text/TextFormatDisplay",
    "offset": 559281,
    "length": 508,
    "defs": [
      "flash.text:TextFormatDisplay"
    ]
  },
  {
    "name": "flash/events/DRMErrorEvent",
    "offset": 559789,
    "length": 2017,
    "defs": [
      "flash.events:DRMErrorEvent"
    ]
  },
  {
    "name": "flash/filters/ColorMatrixFilter",
    "offset": 561806,
    "length": 895,
    "defs": [
      "flash.filters:ColorMatrixFilter"
    ]
  },
  {
    "name": "flash/system/SystemUpdater",
    "offset": 562701,
    "length": 2410,
    "defs": [
      "flash.system:SystemUpdater",
      "flash.system:SystemUpdaterType"
    ]
  },
  {
    "name": "flash/display/ActionScriptVersion",
    "offset": 565111,
    "length": 515,
    "defs": [
      "flash.display:ActionScriptVersion"
    ]
  },
  {
    "name": "flash/media/Video",
    "offset": 565626,
    "length": 1376,
    "defs": [
      "flash.media:Video"
    ]
  },
  {
    "name": "flash/desktop/ClipboardFormats",
    "offset": 567002,
    "length": 8298,
    "defs": [
      "flash.desktop:ClipboardFormats",
      "flash.desktop:ClipboardTransferMode",
      "flash.desktop:Clipboard"
    ]
  },
  {
    "name": "flash/display/AVM1Movie",
    "offset": 575300,
    "length": 1865,
    "defs": [
      "flash.display:AVM1Movie"
    ]
  },
  {
    "name": "flash/filters/GradientBevelFilter",
    "offset": 577165,
    "length": 2694,
    "defs": [
      "flash.filters:GradientBevelFilter"
    ]
  },
  {
    "name": "flash/ui/ContextMenuBuiltInItems",
    "offset": 579859,
    "length": 2547,
    "defs": [
      "flash.ui:ContextMenuBuiltInItems"
    ]
  },
  {
    "name": "flash/text/engine/BreakOpportunity",
    "offset": 582406,
    "length": 601,
    "defs": [
      "flash.text.engine:BreakOpportunity"
    ]
  },
  {
    "name": "flash/display/PNGEncoderOptions",
    "offset": 583007,
    "length": 627,
    "defs": [
      "flash.display:PNGEncoderOptions"
    ]
  },
  {
    "name": "flash/globalization/NationalDigitsType",
    "offset": 583634,
    "length": 1896,
    "defs": [
      "flash.globalization:NationalDigitsType"
    ]
  },
  {
    "name": "flash/text/TextExtent",
    "offset": 585530,
    "length": 695,
    "defs": [
      "flash.text:TextExtent"
    ]
  },
  {
    "name": "flash/text/engine/GraphicElement",
    "offset": 586225,
    "length": 1341,
    "defs": [
      "flash.text.engine:GraphicElement"
    ]
  },
  {
    "name": "flash/system/IME",
    "offset": 587566,
    "length": 1381,
    "defs": [
      "flash.system:IME"
    ]
  },
  {
    "name": "flash/text/engine/FontMetrics",
    "offset": 588947,
    "length": 1075,
    "defs": [
      "flash.text.engine:FontMetrics"
    ]
  },
  {
    "name": "flash/security/X509Certificate",
    "offset": 590022,
    "length": 1735,
    "defs": [
      "flash.security:X509Certificate"
    ]
  },
  {
    "name": "flash/events/TouchEvent",
    "offset": 591757,
    "length": 5240,
    "defs": [
      "flash.events:TouchEvent"
    ]
  },
  {
    "name": "flash/text/engine/TextRotation",
    "offset": 596997,
    "length": 661,
    "defs": [
      "flash.text.engine:TextRotation"
    ]
  },
  {
    "name": "flash/display3D/Context3DProfile",
    "offset": 597658,
    "length": 547,
    "defs": [
      "flash.display3D:Context3DProfile"
    ]
  },
  {
    "name": "flash/text/ime/IIMEClient",
    "offset": 598205,
    "length": 1802,
    "defs": [
      "flash.text.ime:IIMEClient"
    ]
  },
  {
    "name": "flash/display3D/Context3DTriangleFace",
    "offset": 600007,
    "length": 641,
    "defs": [
      "flash.display3D:Context3DTriangleFace"
    ]
  },
  {
    "name": "flash/events/MouseEvent",
    "offset": 600648,
    "length": 4905,
    "defs": [
      "flash.events:MouseEvent"
    ]
  },
  {
    "name": "flash/xml/XMLDocument",
    "offset": 605553,
    "length": 3522,
    "defs": [
      "flash.xml:XMLDocument"
    ]
  },
  {
    "name": "flash/text/engine/RenderingMode",
    "offset": 609075,
    "length": 502,
    "defs": [
      "flash.text.engine:RenderingMode"
    ]
  },
  {
    "name": "flash/net/URLRequest",
    "offset": 609577,
    "length": 2169,
    "defs": [
      "flash.net:URLRequest"
    ]
  },
  {
    "name": "flash/automation/StageCapture",
    "offset": 611746,
    "length": 1555,
    "defs": [
      "flash.automation:StageCapture"
    ]
  },
  {
    "name": "flash/media/StageVideo",
    "offset": 613301,
    "length": 1641,
    "defs": [
      "flash.media:StageVideo"
    ]
  },
  {
    "name": "flash/events/DRMDeviceGroupErrorEvent",
    "offset": 614942,
    "length": 2201,
    "defs": [
      "flash.events:DRMDeviceGroupErrorEvent"
    ]
  },
  {
    "name": "flash/events/SoftKeyboardEvent",
    "offset": 617143,
    "length": 1653,
    "defs": [
      "flash.events:SoftKeyboardEvent"
    ]
  },
  {
    "name": "flash/errors/DRMManagerError",
    "offset": 618796,
    "length": 874,
    "defs": [
      "flash.errors:DRMManagerError"
    ]
  },
  {
    "name": "flash/text/engine/FontPosture",
    "offset": 619670,
    "length": 494,
    "defs": [
      "flash.text.engine:FontPosture"
    ]
  },
  {
    "name": "flash/display/JointStyle",
    "offset": 620164,
    "length": 502,
    "defs": [
      "flash.display:JointStyle"
    ]
  },
  {
    "name": "flash/display/ShaderPrecision",
    "offset": 620666,
    "length": 502,
    "defs": [
      "flash.display:ShaderPrecision"
    ]
  },
  {
    "name": "flash/text/engine/LineJustification",
    "offset": 621168,
    "length": 710,
    "defs": [
      "flash.text.engine:LineJustification"
    ]
  },
  {
    "name": "flash/globalization/StringTools",
    "offset": 621878,
    "length": 1250,
    "defs": [
      "flash.globalization:StringTools"
    ]
  },
  {
    "name": "flash/text/StyleSheet",
    "offset": 623128,
    "length": 3305,
    "defs": [
      "flash.text:StyleSheet"
    ]
  },
  {
    "name": "flash/display/ShaderInput",
    "offset": 626433,
    "length": 1038,
    "defs": [
      "flash.display:ShaderInput"
    ]
  },
  {
    "name": "flash/net/NetStreamPlayTransitions",
    "offset": 627471,
    "length": 848,
    "defs": [
      "flash.net:NetStreamPlayTransitions"
    ]
  },
  {
    "name": "flash/display/BitmapEncodingColorSpace",
    "offset": 628319,
    "length": 688,
    "defs": [
      "flash.display:BitmapEncodingColorSpace"
    ]
  },
  {
    "name": "flash/display/InterpolationMethod",
    "offset": 629007,
    "length": 518,
    "defs": [
      "flash.display:InterpolationMethod"
    ]
  },
  {
    "name": "flash/media/ID3Info",
    "offset": 629525,
    "length": 541,
    "defs": [
      "flash.media:ID3Info"
    ]
  },
  {
    "name": "flash/system/TouchscreenType",
    "offset": 630066,
    "length": 549,
    "defs": [
      "flash.system:TouchscreenType"
    ]
  },
  {
    "name": "flash/events/DRMAuthenticationCompleteEvent",
    "offset": 630615,
    "length": 1774,
    "defs": [
      "flash.events:DRMAuthenticationCompleteEvent"
    ]
  },
  {
    "name": "flash/events/SecurityErrorEvent",
    "offset": 632389,
    "length": 1045,
    "defs": [
      "flash.events:SecurityErrorEvent"
    ]
  },
  {
    "name": "flash/system/AuthorizedFeatures",
    "offset": 633434,
    "length": 1104,
    "defs": [
      "flash.system:AuthorizedFeatures"
    ]
  },
  {
    "name": "flash/media/Sound",
    "offset": 634538,
    "length": 2359,
    "defs": [
      "flash.media:Sound"
    ]
  },
  {
    "name": "flash/system/WorkerDomain",
    "offset": 636897,
    "length": 996,
    "defs": [
      "flash.system:WorkerDomain"
    ]
  },
  {
    "name": "flash/net/URLStream",
    "offset": 637893,
    "length": 2721,
    "defs": [
      "flash.net:URLStream"
    ]
  },
  {
    "name": "flash/events/OutputProgressEvent",
    "offset": 640614,
    "length": 1459,
    "defs": [
      "flash.events:OutputProgressEvent"
    ]
  },
  {
    "name": "flash/display/SimpleButton",
    "offset": 642073,
    "length": 2124,
    "defs": [
      "flash.display:SimpleButton"
    ]
  },
  {
    "name": "flash/display/JPEGXREncoderOptions",
    "offset": 644197,
    "length": 760,
    "defs": [
      "flash.display:JPEGXREncoderOptions"
    ]
  },
  {
    "name": "flash/display/GradientType",
    "offset": 644957,
    "length": 472,
    "defs": [
      "flash.display:GradientType"
    ]
  },
  {
    "name": "flash/net/URLVariables",
    "offset": 645429,
    "length": 1584,
    "defs": [
      "flash.net:URLVariables"
    ]
  },
  {
    "name": "flash/globalization/CurrencyFormatter",
    "offset": 647013,
    "length": 4010,
    "defs": [
      "flash.globalization:CurrencyFormatter"
    ]
  },
  {
    "name": "flash/printing/PrintJobOrientation",
    "offset": 651023,
    "length": 529,
    "defs": [
      "flash.printing:PrintJobOrientation"
    ]
  },
  {
    "name": "flash/crypto/generateRandomBytes",
    "offset": 651552,
    "length": 347,
    "defs": [
      "flash.crypto:generateRandomBytes"
    ]
  },
  {
    "name": "flash/events/NetMonitorEvent",
    "offset": 651899,
    "length": 1060,
    "defs": [
      "flash.events:NetMonitorEvent"
    ]
  },
  {
    "name": "flash/text/engine/TextLineValidity",
    "offset": 652959,
    "length": 638,
    "defs": [
      "flash.text.engine:TextLineValidity"
    ]
  },
  {
    "name": "flash/text/TextSnapshot",
    "offset": 653597,
    "length": 1344,
    "defs": [
      "flash.text:TextSnapshot"
    ]
  },
  {
    "name": "flash/display/Loader",
    "offset": 654941,
    "length": 4198,
    "defs": [
      "flash.display:Loader"
    ]
  },
  {
    "name": "flash/events/FullScreenEvent",
    "offset": 659139,
    "length": 1328,
    "defs": [
      "flash.events:FullScreenEvent"
    ]
  },
  {
    "name": "flash/utils/ObjectOutput",
    "offset": 660467,
    "length": 1784,
    "defs": [
      "flash.utils:ObjectOutput"
    ]
  },
  {
    "name": "flash/utils/IExternalizable",
    "offset": 662251,
    "length": 577,
    "defs": [
      "flash.utils:IExternalizable"
    ]
  },
  {
    "name": "flash/text/engine/FontDescription",
    "offset": 662828,
    "length": 2196,
    "defs": [
      "flash.text.engine:FontDescription"
    ]
  },
  {
    "name": "flash/globalization/NumberParseResult",
    "offset": 665024,
    "length": 1000,
    "defs": [
      "flash.globalization:NumberParseResult"
    ]
  },
  {
    "name": "flash/automation/StageCaptureEvent",
    "offset": 666024,
    "length": 1310,
    "defs": [
      "flash.automation:StageCaptureEvent"
    ]
  },
  {
    "name": "flash/security/X500DistinguishedName",
    "offset": 667334,
    "length": 1215,
    "defs": [
      "flash.security:X500DistinguishedName"
    ]
  },
  {
    "name": "adobe/utils/XMLUI",
    "offset": 668549,
    "length": 662,
    "defs": [
      "adobe.utils:XMLUI"
    ]
  },
  {
    "name": "flash/display/ColorCorrection",
    "offset": 669211,
    "length": 542,
    "defs": [
      "flash.display:ColorCorrection"
    ]
  },
  {
    "name": "flash/text/engine/LigatureLevel",
    "offset": 669753,
    "length": 652,
    "defs": [
      "flash.text.engine:LigatureLevel"
    ]
  },
  {
    "name": "flash/media/VideoStreamSettings",
    "offset": 670405,
    "length": 2164,
    "defs": [
      "flash.media:VideoStreamSettings"
    ]
  },
  {
    "name": "flash/media/H264VideoStreamSettings",
    "offset": 672569,
    "length": 1813,
    "defs": [
      "flash.media:H264VideoStreamSettings"
    ]
  },
  {
    "name": "flash/automation/Configuration",
    "offset": 674382,
    "length": 786,
    "defs": [
      "flash.automation:Configuration"
    ]
  },
  {
    "name": "flash/text/engine/JustificationStyle",
    "offset": 675168,
    "length": 652,
    "defs": [
      "flash.text.engine:JustificationStyle"
    ]
  },
  {
    "name": "flash/ui/KeyboardType",
    "offset": 675820,
    "length": 532,
    "defs": [
      "flash.ui:KeyboardType"
    ]
  },
  {
    "name": "flash/display/CapsStyle",
    "offset": 676352,
    "length": 497,
    "defs": [
      "flash.display:CapsStyle"
    ]
  },
  {
    "name": "flash/text/ime/CompositionAttributeRange",
    "offset": 676849,
    "length": 753,
    "defs": [
      "flash.text.ime:CompositionAttributeRange"
    ]
  },
  {
    "name": "flash/text/engine/TabStop",
    "offset": 677602,
    "length": 1048,
    "defs": [
      "flash.text.engine:TabStop"
    ]
  },
  {
    "name": "flash/text/engine/FontWeight",
    "offset": 678650,
    "length": 485,
    "defs": [
      "flash.text.engine:FontWeight"
    ]
  },
  {
    "name": "flash/ui/GameInputDevice",
    "offset": 679135,
    "length": 1552,
    "defs": [
      "flash.ui:GameInputDevice"
    ]
  },
  {
    "name": "flash/media/AudioDecoder",
    "offset": 680687,
    "length": 768,
    "defs": [
      "flash.media:AudioDecoder"
    ]
  },
  {
    "name": "flash/text/TextRenderer",
    "offset": 681455,
    "length": 1074,
    "defs": [
      "flash.text:TextRenderer"
    ]
  },
  {
    "name": "flash/events/StageVideoEvent",
    "offset": 682529,
    "length": 1341,
    "defs": [
      "flash.events:StageVideoEvent"
    ]
  },
  {
    "name": "flash/text/engine/DigitWidth",
    "offset": 683870,
    "length": 553,
    "defs": [
      "flash.text.engine:DigitWidth"
    ]
  },
  {
    "name": "flash/geom/ColorTransform",
    "offset": 684423,
    "length": 1790,
    "defs": [
      "flash.geom:ColorTransform"
    ]
  },
  {
    "name": "flash/system/AuthorizedFeaturesLoader",
    "offset": 686213,
    "length": 969,
    "defs": [
      "flash.system:AuthorizedFeaturesLoader"
    ]
  },
  {
    "name": "flash/display/GraphicsPathWinding",
    "offset": 687182,
    "length": 539,
    "defs": [
      "flash.display:GraphicsPathWinding"
    ]
  },
  {
    "name": "flash/display/GraphicsPathCommand",
    "offset": 687721,
    "length": 744,
    "defs": [
      "flash.display:GraphicsPathCommand"
    ]
  },
  {
    "name": "flash/text/engine/TabAlignment",
    "offset": 688465,
    "length": 588,
    "defs": [
      "flash.text.engine:TabAlignment"
    ]
  },
  {
    "name": "flash/profiler/Telemetry",
    "offset": 689053,
    "length": 1062,
    "defs": [
      "flash.profiler:Telemetry"
    ]
  },
  {
    "name": "flash/events/UncaughtErrorEvent",
    "offset": 690115,
    "length": 1159,
    "defs": [
      "flash.events:UncaughtErrorEvent"
    ]
  },
  {
    "name": "flash/text/engine/DigitCase",
    "offset": 691274,
    "length": 538,
    "defs": [
      "flash.text.engine:DigitCase"
    ]
  },
  {
    "name": "flash/filters/ShaderFilter",
    "offset": 691812,
    "length": 1919,
    "defs": [
      "flash.filters:ShaderFilter"
    ]
  },
  {
    "name": "flash/events/GeolocationEvent",
    "offset": 693731,
    "length": 2920,
    "defs": [
      "flash.events:GeolocationEvent"
    ]
  },
  {
    "name": "flash/ui/Keyboard",
    "offset": 696651,
    "length": 17797,
    "defs": [
      "flash.ui:Keyboard"
    ]
  },
  {
    "name": "flash/media/MicrophoneEnhancedMode",
    "offset": 714448,
    "length": 708,
    "defs": [
      "flash.media:MicrophoneEnhancedMode"
    ]
  },
  {
    "name": "flash/filters/GlowFilter",
    "offset": 715156,
    "length": 1920,
    "defs": [
      "flash.filters:GlowFilter"
    ]
  },
  {
    "name": "flash/display/MovieClip",
    "offset": 717076,
    "length": 2591,
    "defs": [
      "flash.display:MovieClip"
    ]
  },
  {
    "name": "flash/text/engine/SpaceJustifier",
    "offset": 719667,
    "length": 1661,
    "defs": [
      "flash.text.engine:SpaceJustifier"
    ]
  },
  {
    "name": "flash/net/drm/VoucherAccessInfo",
    "offset": 721328,
    "length": 1113,
    "defs": [
      "flash.net.drm:VoucherAccessInfo"
    ]
  },
  {
    "name": "flash/events/ContextMenuEvent",
    "offset": 722441,
    "length": 1822,
    "defs": [
      "flash.events:ContextMenuEvent"
    ]
  },
  {
    "name": "flash/display3D/textures/CubeTexture",
    "offset": 724263,
    "length": 1114,
    "defs": [
      "flash.display3D.textures:CubeTexture"
    ]
  },
  {
    "name": "flash/text/TextLineMetrics",
    "offset": 725377,
    "length": 732,
    "defs": [
      "flash.text:TextLineMetrics"
    ]
  }
];
  for (var i = 0; i < index.length; i++) {
    var abc = index[i];
    playerGlobalScripts[abc.name] = abc;
    if (typeof abc.defs === 'string') {
      playerGlobalNames[abc.defs] = abc.name;
    } else {
      for (var j = 0; j < abc.defs.length; j++) {
        var def = abc.defs[j];
        playerGlobalNames[def] = abc.name;
      }
    }
  }
})();
