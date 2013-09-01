(function($, window, undefined) {

  var ImposeFormat = window.ImposeFormat = function(el, options) {
    this.el = el;
    this.$el = $(el);
    this.settings = $.extend({}, ImposeFormat.defaults, options);

    switch(this.$el.prop('tagName')) {
      case 'FORM':
        this.$inputs = this.discoverInputs();
        break;
      case 'INPUT':
      case 'TEXTAREA':
        this.$inputs = this.$el;
        break;
      default: break;
    }

    if (!this.$inputs.length) return;
    this.defineHandler();
    this.bindInputEvents();

    if (this.settings.triggerImmediately) {
      this.$inputs.trigger('change.imposeFormat');
    }
  };

  ImposeFormat.defaults = {
    patterns: {
      time: {
        search: /^(0\d|1[0-2]|\d):?([0-5]\d)[ ]*(AM?|PM?)$/i,
        replacement: '[0$1]{-2}:[0$2]{-2} [$3M]{2U}'
      },
      date: {
        search: /^(\d|0\d|1[012])[\-\/](\d|0\d|[12]\d|3[01])[\-\/]((19|20)?\d{2})$/,
        replacement: '[0$1]{-2}/[0$2]{-2}/[20$3]{-4}'
      },
      creditcard: {
        search: /^(\d{4})[\- ]?(\d{4})[\- ]?(\d{4})[\- ]?(\d{4})$/,
        replacement: '[$1][$2][$3][$4]'
      },
      phone: {
        search: /^\(?(\d{3})[\) \-\.]*(\d{3})[ \-\.]*(\d{4})$/,
        replacement: '[$1]-[$2]-[$3]'
      }
    },
    regex: {
      replacementPieces: /\[([^\]]*)\$(\d+)([^\]]*)\](\{(\-?\d+)?([A-Za-z]*)\})?/gi
    },
    flags: {
      U: String.prototype.toUpperCase,
      L: String.prototype.toLowerCase
    },
    type: undefined,
    pattern: undefined,
    triggerImmediately: true,
    callback: $.noop
  };

  ImposeFormat.prototype.discoverInputs = function() {
    return this.$el.find(':input');
  };

  ImposeFormat.prototype.defineHandler = function() {
    var _this = this;

    this.$inputs.each(function() {
      var $inp = $(this),
        pattern = _this.settings.pattern || _this.getHandlerPattern($inp);

      if (pattern) {
        $inp
          .data('imposeSearch', pattern.search)
          .data('imposeReplace', pattern.replacement);

        return true;
      }

      return false;
    });
  };

  ImposeFormat.prototype.getHandlerPattern = function($inp) {
    var patternSettings = this.settings.patterns;

    // Defined through custom search/replace
    if ($inp.is('[data-impose-search][data-impose-replace]')) {
      return {
        search: UTIL.stringToRegExp($inp.data('imposeSearch')),
        replacement: $inp.data('imposeReplace')
      };
    }

    // Defined through name
    var impose;
    if ((impose = $inp.data('impose')) && impose in patternSettings) {
      return patternSettings[impose];
    }

    // Defined through type setting
    var inputType = this.settings.type;
    if (inputType && inputType in patternSettings) {
      return patternSettings[inputType];
    }
  };

  ImposeFormat.prototype.bindInputEvents = function() {
    var _this = this;
    this.$inputs.filter(function() {
      var $this = $(this);
      return $this.data('imposeSearch') && $this.data('imposeReplace');
    }).on('change.imposeFormat', function() {
      var args = [ this ].concat(Array.prototype.slice.apply(arguments));
      _this.handleChange.apply(_this, args);
    });
  };

  ImposeFormat.prototype.handleChange = function(el) {
    var $inp = $(el),
      text = $inp.val(),
      search = $inp.data('imposeSearch'),
      replacement = $inp.data('imposeReplace'),
      _this = this;

    // Ignore if empty
    if (!text.replace(/\s/g,"").length) return;

    // Ignore if not matching
    var textMatches = text.match(search);
    if (!textMatches) return;

    replacement = replacement.replace(
      this.settings.regex.replacementPieces,
      function(match, preText, index, postText, options, slice, flags) {
        var newText = preText + textMatches[index] + postText;
        if (slice) {
          slice = +slice;
          newText = String.prototype.slice.apply(newText, slice >= 0 ? [ 0, slice ] : [ slice ]);
        }
        if (flags) return _this.augmentText(newText, flags);
        return newText;
      });

    $inp.val(replacement);
    this.settings.callback.call(el);
  };

  ImposeFormat.prototype.augmentText = function(text, flags) {
    var flagsArray = flags.split('');

    for (var f = 0, fl = flagsArray.length; f < fl; f++) {
      var flag = flagsArray[f],
        flagAugment = this.settings.flags[flag];

      if (flagAugment === undefined) continue;

      text = flagAugment.call(text, text);
    }

    return text;
  };

  var UTIL = {
    stringToRegExp: function(str) {
      var regExpMatch = str.match(/^\/(.+)\/([gimy]*)$/);
      if (regExpMatch) {
        return new RegExp(regExpMatch[1], regExpMatch[2]);
      }

      return new RegExp(str);
    }
  };

  var plugin = 'imposeFormat';
  $.fn[plugin] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + plugin)) {
        $.data(this, 'plugin_' + plugin, new ImposeFormat(this, options));
      }
    });
  };

})(this.jQuery || this.Zepto, this);
