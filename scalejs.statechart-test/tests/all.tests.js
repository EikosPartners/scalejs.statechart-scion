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
        './statechart.factory.test',
        './statechart.builder.test',
        './statechart.spotchecks.test',
        './statechart.initial.test',
        './statechart.basic.test',
        './statechart.order.test',
        './statechart.hierarchy.test',
        './statechart.hierarchy.and.order.test',
        './statechart.parallel.test',
        './statechart.action.raise.test',
        './scalejs.statechart.set.current.small.step.test',
        './scalejs.statechart.set.next.small.step.test'
    ], function () {
        jasmineEnv.execute();
    });
});
