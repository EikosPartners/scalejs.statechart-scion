/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart;

    describe('statechart action raise', function () {
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
                        event: 't',
                        action: function () {
                            this.raise('s');
                        }
                    }]
                }, {
                    id: 'b',
                    transitions: [{
                        target: 'c',
                        event: 's'
                    }]
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('1', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    onExit: function () {
                        this.raise('s');
                    },
                    transitions: [{
                        target: 'b',
                        event: 't'
                    }]
                }, {
                    id: 'b',
                    transitions: [{
                        target: 'c',
                        event: 's'
                    }]
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('2', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    onExit: function () {
                        this.raise('s');
                    },
                    transitions: [{
                        target: 'b',
                        event: 't'
                    }]
                }, {
                    id: 'b',
                    transitions: [{
                        target: 'c',
                        event: 's'
                    }]
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('3', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    transitions: [{target: 'b', event: 't'}]
                }, {
                    id: 'b',
                    onEntry: function () {
                        this.raise('s');
                    },
                    transitions: [{target: 'c', event: 's'}]
                }, {
                    id: 'c'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('4', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    transitions: [{target: 'b', event: 't'}]
                }, {
                    id: 'b',
                    onEntry: function () {
                        this.raise('s');
                    },
                    transitions: [
                        {target: 'c', event: 's'},
                        {target: 'f1'}
                    ]
                }, {
                    id: 'c',
                    transitions: [
                        {target: 'f2', event: 's'},
                        {target: 'd'}
                    ]
                }, {
                    id: 'f1'
                }, {
                    id: 'd'
                }, {
                    id: 'f2'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['d']);
        });

        it('5', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    transitions: [{target: 'b', event: 't'}]
                }, {
                    id: 'b',
                    onEntry: function () {
                        this.raise('s');
                        this.raise('r');
                    },
                    transitions: [
                        {target: 'c', event: 's'},
                        {target: 'f1'}
                    ]
                }, {
                    id: 'c',
                    transitions: [
                        {target: 'f2', event: 'r'},
                        {target: 'd'}
                    ]
                }, {
                    id: 'f1'
                }, {
                    id: 'd'
                }, {
                    id: 'f2'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['d']);
        });

        it('6', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    transitions: [{target: 'b', event: 't'}]
                }, {
                    id: 'b',
                    onEntry: function () {
                        this.raise('s');
                        this.raise('r');
                    },
                    transitions: [
                        {target: 'c', event: 'r'},
                        {target: 'f1'}
                    ]
                }, {
                    id: 'c',
                    transitions: [
                        {target: 'f2', event: 's'},
                        {target: 'd'}
                    ]
                }, {
                    id: 'f1'
                }, {
                    id: 'd'
                }, {
                    id: 'f2'
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['d']);
        });

        it('7', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    transitions: [{target: 'b', event: 't', action: function () { this.raise('s'); }}]
                }, {
                    id: 'b',
                    initial: 'b1',
                    states: [{
                        id: 'b1',
                        transitions: [
                            {target: 'b2', event: 's'},
                            {target: 'b3'}
                        ]
                    }, {
                        id: 'b2'
                    }, {
                        id: 'b3'
                    }]
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['b3']);
        });

        it('8', function () {
            var sc = statechart({
                initial: 'a',
                states: [{
                    id: 'a',
                    transitions: [{target: 'b1', event: 't', action: function () { this.raise('s'); }}]
                }, {
                    id: 'b',
                    initial: 'b1',
                    states: [{
                        id: 'b1',
                        transitions: [
                            {target: 'b2', event: 's'},
                            {target: 'b3'}
                        ]
                    }, {
                        id: 'b2'
                    }, {
                        id: 'b3'
                    }]
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['b2']);
        });
    });
});