# jQuery.imposeFormat

ImposeFormat is a jQuery plugin which unobtrusively imposes a consistent format on form inputs. Specifically, it can rewrite user inputs for dates, times, phone numbers, or credit card numbers to a consistent format.

[Refer to the test fixtures for simple use cases demonstrating plugin behavior](https://github.com/aduth/jquery.imposeFormat/blob/master/test/spec/test.imposeFormat.js#L156-L193)

## Usage

Include jQuery and jquery.imposeFormat using script tags. Then, when the page is loaded, call imposeFormat on either individual inputs or an entire form.

### With individual inputs

Add `data-impose` attribute to each input field or specify a type when calling imposeFormat. Current default formats are **date**, **time**, **phone**, and **creditcard**. Optionally, when calling imposeFormat, you can include your own search and replace values.

```html
<input id="myTime" type="text" data-impose="time">
<script>
$(document).ready(function() {
  $('#myTime').imposeFormat();
  // OR: $('#myTime').imposeFormat({ type: 'time' });
  // OR: $('#myTime').imposeFormat({
  //       pattern: {
  //         search: /^(0\d|1[0-2]|\d):?([0-5]\d)[ ]*(AM?|PM?)$/i,
  //         replacement: '[0$1]{-2}:[0$2]{-2} [$3M]{2U}'
  //       }
  //     });
});
</script>
```

In this case, whenever the value of the text field is changed, the date will be rewritten to be delimited with slashes by default (e.g. "12-31-1969" to "12/31/1969"). This accomodates a user entering the date with whichever delimiters they're most comfortable with.

jQuery.imposeFormat is *not* a validation plugin. If the user leaves the field blank or enters a value which does not match the search, imposeFormat *will do nothing*. You should always perform additional server-side validation.

### With entire form

```html
<form id="myForm">
  <input type="text" data-impose="time">
  <input type="text" data-impose="date">
</form>
<script>
$(document).ready(function() {
  $('#myForm').imposeFormat();
});
</script>
```

## Options

Note that, by default, date and time replacements use North American date standards.

You can create your own search and replace strings either when calling imposeFormat on an individual element (see *Usage* section), or by overriding the default patterns object[[1]](https://github.com/aduth/jquery.imposeFormat/blob/master/src/jquery.imposeFormat.js#L29-L46).

The search value is a simple regular expression object. The replacement string is a non-standard custom syntax with the following definition:

* Each replacement group is denoted by an opening and closing square bracket i.e. [ ]
* The replacement value is denoted by a dollar sign followed by the replacement index i.e. $3 (standard RegExp)
* Special options (optional) are denoted by an opening and closing curly bracket following the replacement group i.e { }
 * Slice from beginning with a positive number, or from end using a negative number i.e. {-2}
 * Change case using U (upper) or L (flags) i.e. {U}

_Example: Time_

```javascript
time: {
  search: /^(0\d|1[0-2]|\d):?([0-5]\d)[ ]*(AM?|PM?)$/i,
  replacement: '[0$1]{-2}:[0$2]{-2} [$3M]{2U}'
}
```

## License

Copyright (c) 2013 Andrew Duthie

Released under the MIT License (see LICENSE.txt)
