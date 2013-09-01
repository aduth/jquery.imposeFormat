var expect = chai.expect;

describe('form usage', function() {
  beforeEach(function() {
    this.$fixture = $(
      '<form> \
      <input type="text" data-impose="date"> \
      <input type="text" data-impose="time"> \
      <input type="text" data-impose-search="" data-impose-replace=""> \
      </form>'
    );
  });

  describe('#discoverInputs()', function() {
    it('should identify all inputs within a form', function() {
      var pluginData = this.$fixture.imposeFormat().data('plugin_imposeFormat'),
        inputCount = this.$fixture.find(':input').length;

      expect(pluginData.$inputs.length).to.equal(inputCount);
    });
  });
});

describe('input usage', function() {
  beforeEach(function() {
    this.$fixture = $('<input type="text" data-impose="date">');
  });

  it('should respect triggerImmediately setting', function() {
    this.$fixture
      .val('12-31-1969')
      .imposeFormat({ triggerImmediately: false });

    expect(this.$fixture.val()).to.equal('12-31-1969');
  });

  describe('#bindInputEvents()', function() {
    it('should bind namespaced change event', function() {
      var pluginData = this.$fixture.imposeFormat().data('plugin_imposeFormat'),
        events = $._data(this.$fixture[0], 'events'),
        bound = false;

      expect(events).to.exist;
      expect(events.change).to.exist;

      events = events.change;

      for (var i = 0, el = events.length; i < el; i++) {
        if (events[i].namespace === 'imposeFormat') {
          bound = true;
        }
      }

      expect(bound).to.be.ok;
    });
  });

  describe('#defineHandler()', function() {
    var expectDateDefault = function($fixture) {
      var handlerSearch = $fixture.data('imposeSearch'),
        handlerReplace = $fixture.data('imposeReplace');

      expect(handlerSearch).to.be.a('regexp');
      expect(handlerSearch.source).to.equal(ImposeFormat.defaults.patterns.date.search.source);
      expect(handlerReplace).to.equal(ImposeFormat.defaults.patterns.date.replacement);
    };

    it('should define handler using search and replace settings', function() {
      var pattern = { search: 'mySearch', replacement: 'myReplacement' };
      this.$fixture.imposeFormat({
        pattern: pattern
      });

      expect(this.$fixture.data('imposeSearch')).to.equal(pattern.search);
      expect(this.$fixture.data('imposeReplace')).to.equal(pattern.replacement);
    });

    it('should define handler using type setting', function() {
      this.$fixture.imposeFormat({ type: 'date' });
      expectDateDefault(this.$fixture);
    });

    it('should define handler using data-impose attribute name', function() {
      this.$fixture = $('<input type="text" data-impose="date">');
      this.$fixture.imposeFormat();
      expectDateDefault(this.$fixture);
    });

    it('should define handler using data-impose-search and data-impose-replace attributes', function() {
      var defaultDateSearch = ImposeFormat.defaults.patterns.date.search,
        defaultDateReplace = ImposeFormat.defaults.patterns.date.replacement;

      this.$fixture = $('<input type="text" data-impose-search="' + defaultDateSearch + '" data-impose-replace="' + defaultDateReplace + '">');
      this.$fixture.imposeFormat();
      expectDateDefault(this.$fixture);
    });

    it('should not define handler if neither applicable type nor data- attributes are set', function() {
      this.$fixture = $('<input type="text">');
      this.$fixture.imposeFormat();

      var handlerSearch = this.$fixture.data('imposeSearch'),
        handlerReplace = this.$fixture.data('imposeReplace');

      expect(handlerSearch).to.not.exist;
      expect(handlerReplace).to.not.exist;
    });
  });

  describe('#handleChange()', function() {
    it('should apply consistent format using defaults', function() {
      this.$fixture
        .imposeFormat()
        .val('12-31-1969')
        .trigger('change');

      expect(this.$fixture.val()).to.equal('12/31/1969');
    });

    it('should apply consistent format using custom replacement', function() {
      var pattern = {
        search: /^(\d|0\d|1[012])[\-\/](\d|0\d|[12]\d|3[01])[\-\/]((19|20)?\d{2})$/,
        replacement: 'myReplacement'
      };

      this.$fixture
        .imposeFormat({
          pattern: pattern
        })
        .val('12-31-1969')
        .trigger('change');

      expect(this.$fixture.val()).to.equal(pattern.replacement);
    });

    it('should apply custom flags', function() {
      this.$fixture
        .val('12-31-1969')
        .imposeFormat({
          pattern: {
            search: /^(\d|0\d|1[012])[\-\/](\d|0\d|[12]\d|3[01])[\-\/]((19|20)?\d{2})$/,
            replacement: '[0$1]{-2X}/[0$2]{-2X}/[20$3]{-4X}'
          },
          flags: {
            X: function() {
              return 'X';
            }
          }
        });

      expect(this.$fixture.val()).to.equal('X/X/X');
    });
  });
});

describe('default formats', function() {
  it('should apply consistent format for dates', function() {
    var $fixture = $('<input type="text" data-impose="date">');
    $fixture
      .val('12-31-1969')
      .imposeFormat();

    expect($fixture.val()).to.equal('12/31/1969');
  });

  it('should apply consistent format for times', function() {
    var $fixture = $('<input type="text" data-impose="time">');
    $fixture
      .val('4:34a')
      .imposeFormat();

    expect($fixture.val()).to.equal('04:34 AM');
  });

  it('should apply consistent format for credit cards', function() {
    var $fixture = $('<input type="text" data-impose="creditcard">');
    $fixture
      .val('1234-5678-9012-3456')
      .imposeFormat();

    expect($fixture.val()).to.equal('1234567890123456');
  });

  it('should apply consistent format for phone numbers', function() {
    var $fixture = $('<input type="text" data-impose="phone">');
    $fixture
      .val('(513) 555.1234')
      .imposeFormat();

    expect($fixture.val()).to.equal('513-555-1234');
  });
});
