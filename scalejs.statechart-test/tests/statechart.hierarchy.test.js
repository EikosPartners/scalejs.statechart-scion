/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart.statechart;

    describe('statechart hierarchy', function () {
        it('0', function () {
            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'a1'
                    }]
                }, {
                    id: 'a',
                    states: [{
                        id: 'a1',
                        transitions: [{
                            target: 'a2',
                            event: 't'
                        }]
                    }, {
                        id: 'a2'
                    }]
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['a2']);
        });

        it('1', function () {
            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'a1'
                    }]
                }, {
                    id: 'a',
                    states: [{
                        id: 'a1',
                        transitions: [{
                            target: 'a2',
                            event: 't'
                        }]
                    }, {
                        id: 'a2'
                    }],
                    transitions: [{
                        target: 'b',
                        event: 't'
                    }]
                }, {
                    id: 'b'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['a2']);
        });

        it('2', function () {
            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'a1'
                    }]
                }, {
                    id: 'a',
                    states: [{
                        id: 'a1',
                        transitions: [{
                            target: 'b',
                            event: 't'
                        }]
                    }, {
                        id: 'a2'
                    }],
                    transitions: [{
                        target: 'a2',
                        event: 't'
                    }]
                }, {
                    id: 'b'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['b']);
        });
    });
});