/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart;

    describe('statechart document order', function () {
        it('0', function () {
            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'a'
                    }]
                }, {
                    id: 'a',
                    transitions: [{
                        target: 'b',
                        event: 't'
                    }, {
                        target: 'c',
                        event: 't'
                    }]
                }, {
                    id: 'b'
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['b']);
        });
    });
});