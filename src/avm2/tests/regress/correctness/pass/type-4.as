package {
  trace("--- Test 1 ---");
  var values = [1, -1, "1", "-1", true, false, NaN, Infinity, +Infinity, null, undefined, {}];
  values.forEach(function (x) {
    trace(int(x));
    trace(uint(x));
    trace(String(x));
    trace(Number(x));
    trace(Boolean(x));
    trace(Object(x));
  });

  trace("--- Test Parameter int ---");
  values.forEach(function (x: int, ...args) { trace(x) });
  trace("--- Test Parameter uint ---");
  values.forEach(function (x: uint, ...args) { trace(x) });
  trace("--- Test Parameter String ---");
  values.forEach(function (x: String, ...args) { trace(x) });
  trace("--- Test Parameter Number ---");
  values.forEach(function (x: Number, ...args) { trace(x) });
  trace("--- Test Parameter Boolean ---");
  values.forEach(function (x: Boolean, ...args) { trace(x) });
  trace("--- Test Parameter Object ---");
  values.forEach(function (x: Object, ...args) { trace(x) });

  trace("--- Test as int ---");
  values.forEach(function (x, ...args) { trace(x as int) });
  trace("--- Test as uint ---");
  values.forEach(function (x, ...args) { trace(x as uint) });
  trace("--- Test as String ---");
  values.forEach(function (x, ...args) { trace(x as String) });
  trace("--- Test as Number ---");
  values.forEach(function (x, ...args) { trace(x as Number) });
  trace("--- Test as Boolean ---");
  values.forEach(function (x, ...args) { trace(x as Boolean) });
  trace("--- Test as Object ---");
  values.forEach(function (x, ...args) { trace(x as Object) });

  trace("--- Test coerce int ---");
  values.forEach(function (x, ...args) { var t : int = x; trace(t); });
  trace("--- Test coerce uint ---");
  values.forEach(function (x, ...args) { var t : uint = x; trace(t); });
  trace("--- Test coerce String ---");
  values.forEach(function (x, ...args) { var t : String = x; trace(t); });
  trace("--- Test coerce Number ---");
  values.forEach(function (x, ...args) { var t : Number = x; trace(t); });
  trace("--- Test coerce Boolean ---");
  values.forEach(function (x, ...args) { var t : Boolean = x; trace(t); });
  trace("--- Test coerce Object ---");
  values.forEach(function (x, ...args) { var t : Object = x; trace(t); });
  trace("--- DONE ---");
}