/*global define,jasmine*/
define([
    'jasmine-html',
    './scalejs.state.test',
    './builder.test',
    './basic.test',
    './raise-inner.test',
    './raise-outer.test',
    './order.test',
    './hierarchy.test',
    './hierarchy-order.test',
    './parallel.test',
    './more-parallel.test',
    //'./assign-current-small-step.test',
    './onEntry.test',
    './misc.test'
], function () {
    'use strict';

    var jasmineEnv = jasmine.getEnv(),
        htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.updateInterval = 1000;
    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    jasmineEnv.execute();
});
