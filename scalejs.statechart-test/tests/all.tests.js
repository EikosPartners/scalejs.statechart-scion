/*global define*/
define([
    'require',
    'jasmine-html'
    //'./statechart.test'
], function (require, jasmine) {
    'use strict';

    var jasmineEnv = jasmine.getEnv(),
        htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.updateInterval = 1000;
    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    require([
        './scalejs.statechart.test',
        './builder.test',
        './statechart.test',
        './statechart.basic.test',
        './statechart.order.test',
        './statechart.hierarchy.test',
        './statechart.hierarchy.and.order.test',
        './statechart.parallel.test',
        './statechart.action.raise.test'
    ], function () {
        jasmineEnv.execute();
    });
});
