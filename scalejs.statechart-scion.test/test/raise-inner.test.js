/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.builder({
            logStatesEnteredAndExited: true
        }),
        goto = core.state.builder.goto,
        on = core.state.builder.on,
        onEntry = core.state.builder.onEntry,
        onExit = core.state.builder.onExit,
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('`raise`', function () {
        it('wnen called with event name proper event is constructed', function () {
            var sc = statechart(
                    state(goto('a')),
                    state('a', on('t', goto('b', function () { this.raise('s'); }))),
                    state('b', on('s', goto('c'))),
                    state('c')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('0', function () {
            var sc = statechart(
                    state(goto('a')),
                    state('a', on('t', goto('b', function () { this.raise({name: 's'}); }))),
                    state('b', on('s', goto('c'))),
                    state('c')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('1', function () {
            var sc = statechart(
                    state('a', 
                        onExit(function () { this.raise({name: 's'}); }),
                        on('t', goto('b'))),
                    state('b', on('s', goto('c'))),
                    state('c')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('2', function () {
            var sc = statechart(
                    state('a', 
                        onExit(function () { this.raise({name: 's'}); }),
                        on('t', goto('b'))),
                    state('b', on('s', goto('c'))),
                    state('c')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('3', function () {
            var sc = statechart(
                    state('a', on('t', goto('b'))),
                    state('b', 
                        onEntry(function () { this.raise({name: 's'}); }),
                        on('s', goto('c'))),
                    state('c')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('4', function () {
            var sc = statechart(
                    state('a', on('t', goto('b'))),
                    state('b',
                        onEntry(function () { this.raise({name: 's'}); }),
                        on('s', goto('c')),
                        goto('f1')),
                    state('c',
                        on('s', goto('f2')),
                        goto('d')),
                    state('f1'),
                    state('f2'),
                    state('d')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['d']);
        });

/*
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

            sc.send('t');

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

            sc.send('t');

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

            sc.send('t');

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

            sc.send('t');

            expect(sc.getConfiguration()).toEqual(['b2']);
        });
        */
    });
});