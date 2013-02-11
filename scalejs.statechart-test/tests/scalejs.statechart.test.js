/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart.statechart;

    describe('statechart extension', function () {
        it('is defined', function () {
            expect(statechart).toBeDefined();
        });
    });
});