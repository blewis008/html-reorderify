'use strict';

var html_reorderify = require('../tasks/html_reorderify.js');

function getExpectedAttributes(names, values, orders) {
  var attributes = [],
      i;
  for (i = 0; i < names.length; i++) {
    var obj = {
                name: names[i],
                value: values[i],
                order: orders[i]
              };
    attributes.push(obj);
  }
  return attributes;
}

exports.html_reorderify = {
  setUp: function(done) {
    done();
  },
  test_fileExists_exists: function(test) {
    test.expect(1);

    var shouldExist = true;
    html_reorderify.grunt = {
      file: {
        exists: function() { return shouldExist; },
      },
      log: {
        warn: function () { },
      },
    };
    var file = { src: ['filepath'] };
    var fileExists = html_reorderify.fileExists(file);

    test.equal(fileExists, shouldExist, 'Should find file given the file exists');
    test.done();
  },
  test_fileExists_does_not_exist: function(test) {
    test.expect(1);

    var shouldExist = false;
    html_reorderify.grunt = {
      file: {
        exists: function() { return shouldExist; },
      },
      log: {
        warn: function () { },
      },
    };
    var file = { src: ['filepath'] };
    var fileExists = html_reorderify.fileExists(file);

    test.equal(fileExists, shouldExist, 'Should not find file given the file does not exist');
    test.done();
  },
  test_getEachAttribute_single: function(test) {
    test.expect(1);

    var options = {first: ['id']};
    var attributes = ['id="testId"'];
    var actual = html_reorderify.getEachAttribute(attributes, options);
    var expected = [{name: 'id', value: '"testId"', order: 0}];

    test.deepEqual(actual, expected, 'Should do something fill this in later');
    test.done();
  },
  test_getEachAttribute_double: function(test) {
    test.expect(1);

    var options = {first: ['id', 'class']};
    var attributes = ['id="testId"', 'class="testClass"'];
    var actual = html_reorderify.getEachAttribute(attributes, options);
    var expected = getExpectedAttributes(['id', 'class'], ['"testId"', '"testClass"'], [0, 1]);

    test.deepEqual(actual, expected, 'Should do something fill this in later');
    test.done();
  },
  test_getEachAttribute_triple: function(test) {
    test.expect(1);

    var options = {first: ['id', 'class', 'style']};
    var attributes = ['id="testId"', 'class="testClass"', 'style="display: none;"'];
    var actual = html_reorderify.getEachAttribute(attributes, options);
    var expected = getExpectedAttributes(['id', 'class', 'style'], ['"testId"', '"testClass"', '"display: none;"'], [0, 1, 2]);

    test.deepEqual(actual, expected, 'Should do something fill this in later');
    test.done();
  },
  test_getEachAttribute_missing_from_options: function(test) {
    test.expect(2);

    var options = {first: ['id']};
    var attributes = ['id="testId"', 'class="testClass"', 'style="display: none;"'];
    var actual = html_reorderify.getEachAttribute(attributes, options);
    
    var idAttribute = actual.filter(function(attribute) { return attribute.name === 'id'; })[0];
    var classAttribute = actual.filter(function(attribute) { return attribute.name === 'class'; })[0];
    var styleAttribute = actual.filter(function(attribute) { return attribute.name === 'style'; })[0];
    
    var errorMessage = 'Attributes specified in options should have strictly lower order than non-specified attributes';
    test.ok(idAttribute.order < classAttribute.order, errorMessage);
    test.ok(idAttribute.order < styleAttribute.order, errorMessage);
    test.done();
  },
  test_getEachAttribute_preserve_number_of_attributes: function(test) {
    test.expect(1);

    var options = {first: ['id']};
    var attributes = ['id="testId"', 'class="testClass"', 'style="display: none;"', 'data-bind="visible: isVisible"'];
    var actual = html_reorderify.getEachAttribute(attributes, options);

    test.equal(attributes.length, actual.length, 'Should output the same number of attributes as passed in');
    test.done();
  },
  test_rebuildElement: function(test) {
    test.expect(1);

    var attributes = getExpectedAttributes(['id'], ['"testId"'], [0]);
    var actual = html_reorderify.rebuildElement('div', attributes);
    var expected = 'div id="testId"';

    test.equal(actual, expected, 'Should be able to rebuild html element given name and only one attribute');
    test.done();
  },
  test_rebuildElement2: function(test) {
    test.expect(1);

    var attributes = getExpectedAttributes(['id', 'class'], ['"testId"', '"testClass"'], [0, 1]);
    var actual = html_reorderify.rebuildElement('div', attributes);
    var expected = 'div id="testId" class="testClass"';

    test.equal(actual, expected, 'Should be able rebuild html element given name and two simple individual parts');
    test.done();
  },
  test_rebuildElement3: function(test) {
    test.expect(1);

    var attributes = getExpectedAttributes(['id', 'class', 'style'], ['"testId"', '"testClass1 testClass2"', '"font-size: 1.25em;"'], [0, 1, 2]);
    var actual = html_reorderify.rebuildElement('span', attributes);
    var expected = 'span id="testId" class="testClass1 testClass2" style="font-size: 1.25em;"';

    test.equal(actual, expected, 'Should be able to rebuild html element given multiple complex individual parts');
    test.done();
  },
  test_sortAttributes: function(test) {
    test.expect(1);

    var actual = html_reorderify.sortAttributes([{order: 3}, {order: 2}, {order: 0}, {order: 1}]);
    var expected = [{order: 0}, {order: 1}, {order: 2}, {order: 3}];

    test.deepEqual(actual, expected, 'Should sort correctly by ascending order given an unordered array');
    test.done();
  },
  test_buildSortableAttribute: function(test) {
    test.expect(1);

    var options = {first: 'id'};
    var maxOrder = 3;
    var actual = html_reorderify.buildSortableAttribute(['class', '"testClass"'], options, maxOrder);
    var expected = {name: 'class', value: '"testClass"', order: maxOrder};

    test.deepEqual(actual, expected, 'Should build a sortable attribute given a simple attribute key value pair');
    test.done();
  },
  test_getAttributesFromElement_single: function(test) {
    test.expect(1);

    var element = 'class="testClass"';
    var actual = html_reorderify.getAttributesFromElement(element);
    var expected = ['class="testClass"'];

    test.deepEqual(actual, expected, 'Should be able to split attributes given only one attribute');
    test.done();
  },
  test_getAttributesFromElement_simple: function(test) {
    test.expect(1);

    var element = 'id="testId" class="testClass"';
    var actual = html_reorderify.getAttributesFromElement(element);
    var expected = ['id="testId"', 'class="testClass"'];

    test.deepEqual(actual, expected, 'Should be able to split into individual parts given two simple attributes');
    test.done();
  },
  test_getAttributesFromElement_with_spaces: function(test) {
    test.expect(1);

    var element = 'id="testId" class="testClass1 testClass2"';
    var actual = html_reorderify.getAttributesFromElement(element);
    var expected = ['id="testId"', 'class="testClass1 testClass2"'];

    test.deepEqual(actual, expected, 'Should be able to split attributes given attributes with spaces in the value part');
    test.done();
  },
  test_getAttributesFromElement_complex: function(test) {
    test.expect(1);

    var element = 'id="testId" class="testClass1 testClass2 testClass3" style="margin-left: 0; margin-right: 0;"';
    var actual = html_reorderify.getAttributesFromElement(element);
    var expected = ['id="testId"', 'class="testClass1 testClass2 testClass3"', 'style="margin-left: 0; margin-right: 0;"'];

    test.deepEqual(actual, expected, 'Should be able to split into individual elements given multiple complex attributes');
    test.done();
  },
  test_getAttributesFromElement_trailingSpace: function(test) {
    test.expect(1);

    var element = 'id="testId" class="testClass1 testClass2" style="margin-left: 0;"  ';
    var actual = html_reorderify.getAttributesFromElement(element);
    var expected = ['id="testId"', 'class="testClass1 testClass2"', 'style="margin-left: 0;"'];

    test.deepEqual(actual, expected, 'Should be able to get attributes given an element with trailing spaces');
    test.done();
  },
  test_getAttributesFromElement_equalsInMiddle: function(test) {
    test.expect(1);

    var element = 'http-equiv="X-UA-Compatible" content="IE=edge"';
    var actual = html_reorderify.getAttributesFromElement(element);
    var expected = ['http-equiv="X-UA-Compatible"', 'content="IE=edge"'];

    test.deepEqual(actual, expected, 'Should work with equals sign in an attribute value');
    test.done();
  },
  test_getAttributeIndex_simple: function(test) {
    test.expect(1);

    var attributeName = 'id';
    var options = {first: ['id']};
    var maxOrder = 1;
    var actual = html_reorderify.getAttributeIndex(attributeName, maxOrder, options);
    var expected = 0;

    test.equal(actual, expected, 'Should return the expected index of 0 given matching first attribute');
    test.done();
  },
  test_getAttributeIndex_last_only: function(test) {
    test.expect(1);

    var attributeName = 'runat';
    var options = {last: ['runat']};
    var maxOrder = 3;
    var actual = html_reorderify.getAttributeIndex(attributeName, maxOrder, options);
    var expected = 3;

    test.equal(actual, expected, 'Should return last index given a matching last attribute');
    test.done();
  },
  test_reorderAttributes: function(test) {
    test.expect(1);

    var options = {first: ['id'], last: ['runat']};
    var element = '<uc:UserControl runat="server" id="uc1"/>';
    var actual = html_reorderify.reorderAttributes(element, options);
    var expected = '<uc:UserControl id="uc1" runat="server"/>';

    test.equal(actual, expected, 'Should handle poorly formed self-closing tags');
    test.done();
  }
};

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/