/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart.statechart;

    describe('statechart', function () {
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
            var action = jasmine.createSpy(),
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        transitions: [{
                            target: 's2',
                            action: action
                        }]
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s2']);
            expect(sc.getFullConfiguration()).toEqual(['s2', 'root']);
            expect(action).toHaveBeenCalledWith([]);
        });

        it('transits to proper state when an event is fired', function () {
            var sc = statechart({
                states: [{
                    id: 's1',
                    transitions: [{
                        event: 'test.transit',
                        target: 's2'
                    }]
                }, {
                    id: 's2'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            sc.raise('test.transit');
            expect(sc.getConfiguration()).toEqual(['s2']);
        });

        it('transits to proper state when an event is fired that matches a `test.*` pattern', function () {
            var sc = statechart({
                states: [{
                    id: 's1',
                    transitions: [{
                        event: 'test.*',
                        target: 's2'
                    }]
                }, {
                    id: 's2'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            sc.raise('test.transit');
            expect(sc.getConfiguration()).toEqual(['s2']);
        });

        it('transits to proper state when an event is fired and transition event is `*`', function () {
            var sc = statechart({
                states: [{
                    id: 's1',
                    transitions: [{
                        event: '*',
                        target: 's2'
                    }]
                }, {
                    id: 's2'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            sc.raise('test.transit');
            expect(sc.getConfiguration()).toEqual(['s2']);
        });

        it('doesn\'t transit when an event is fired but condition is false', function () {
            var sc = statechart({
                states: [{
                    id: 's1',
                    transitions: [{
                        event: 'test.transit',
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
            sc.raise('test.transit');
            expect(sc.getConfiguration()).toEqual(['s1']);
        });

        it('doesn\'t transit when an event is fired that doesn\'t match transition event', function () {
            var sc = statechart({
                states: [{
                    id: 's1',
                    transitions: [{
                        event: 'test.transit',
                        target: 's2'
                    }]
                }, {
                    id: 's2'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            sc.raise('test.not.transit');
            expect(sc.getConfiguration()).toEqual(['s1']);
        });

        it('transition condition function isn\'t called when event doesn\'t match', function () {
            var condition = jasmine.createSpy(),
                sc = statechart({
                    states: [{
                        id: 's1',
                        transitions: [{
                            event: 'test.transit',
                            target: 's2',
                            condition: condition
                        }]
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            sc.raise('test.not.transit');
            expect(sc.getConfiguration()).toEqual(['s1']);
            expect(condition).not.toHaveBeenCalled();
        });
    });
});