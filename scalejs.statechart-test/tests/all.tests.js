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

    require(['./statechart.test'], function () {
        jasmineEnv.execute();
    });
});
