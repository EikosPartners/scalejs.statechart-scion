/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart;

    describe('`statechart`', function () {
        it('core extension is defined', function () {
            expect(statechart).toBeDefined();
        });
        /*
        it('basic', function () {
            var sc = statechart({
                id: 'a'
            });
            sc.start();

            expect(initialConfiguration).toBe(['a']);
            expect(events).toBe([]);
        }*/
    });
});