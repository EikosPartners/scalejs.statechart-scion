/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart;

    describe('`statechart`', function () {
        it('transits to default single state', function () {
            var sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1'
                    }]
                });
            sc.start();

            expect(sc.getFullConfiguration()).toEqual(['s1', 'root']);
        });

        it('executes onEntry', function () {
            var inS1 = false,
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        onEntry: function () {
                            inS1 = true;
                        }
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            expect(sc.getFullConfiguration()).toEqual(['s1', 'root']);
            expect(inS1).toBeTruthy();
        });

        it('executes onExit', function () {
            var outS1 = false,
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        onExit: function () {
                            outS1 = true;
                        },
                        transitions: [{
                            target: 's2'
                        }]
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getFullConfiguration()).toEqual(['s2', 'root']);
            expect(outS1).toBeTruthy();
        });

        it('transits to next state by eventless transition', function () {
            var sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        transitions: [{
                            target: 's2'
                        }]
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s2']);
            expect(sc.getFullConfiguration()).toEqual(['s2', 'root']);
        });

        it('transits to next state if condition evaluates to true', function () {
            var sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        transitions: [{
                            target: 's2',
                            condition: function () {
                                return true;
                            }
                        }]
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s2']);
            expect(sc.getFullConfiguration()).toEqual(['s2', 'root']);
        });

        it('doesn\'t transit to next state if condition evaluates to false', function () {
            var sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        transitions: [{
                            target: 's2',
                            condition: function () {
                                return false;
                            }
                        }]
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            expect(sc.getFullConfiguration()).toEqual(['s1', 'root']);
        });

        it('executes transition action', function () {
            var byTransition = false,
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        transitions: [{
                            target: 's2',
                            action: function () {
                                byTransition = true;
                            }
                        }]
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s2']);
            expect(sc.getFullConfiguration()).toEqual(['s2', 'root']);
            expect(byTransition).toBeTruthy();
        });

    });
});