/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        goto = core.state.builder.goto,
        gotoInternally = core.state.builder.gotoInternally,
        on = core.state.builder.on,
        onEntry = core.state.builder.onEntry,
        onExit = core.state.builder.onExit,
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('statechart `set` current small step', function () {
        it('0', function () {
            var sc = statechart(
                state('a',
                    onEntry(function () {
                        this.a = -1;
                        this.a = 99;
                    }),
                    on('t', function () { return this.a === 99; }, goto('b', function () { this.a += 1; }))),
                state('b',
                    onEntry(function () { this.a = this.a * 2; }),
                    on(function () { return this.a === 200; }, goto('c')),
                    goto('f')),
                state('c'),
                state('f')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('1', function () {
            var sc = statechart(
                state('a', on('t', goto('b', function () { this.i = 0; }))),
                state('b',
                    on(function () { return this.i < 100; }, goto('b', function () { this.i += 1; })),
                    on(function () { return this.i === 100; }, goto('c'))),
                state('c')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('2', function () {
            var sc = statechart(
                state('a', on('t', goto('b', function () { this.i = 0; }))),
                state('A',
                    on(function () { return this.i === 100; }, goto('d', function () { this.i *= 2; })),
                    state('b', on(function () { return this.i < 100; }, goto('c', function () { this.i += 1; }))),
                    state('c', on(function () { return this.i < 100; }, goto('b', function () { this.i += 1; })))),
                state('d'
                    on(function () { return this.i === 200; }, goto('e')),
                    goto('f')),
                state('e'),
                state('f')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['e']);
        });

        it('3', function () {
            var sc = statechart(
                state('a', on('t1', goto('p', function () { this.i = 0; }))),
                parallel('p',
                    state('b',
                        state('b1', on('t2', goto('b2', function () { this.i += 1; }))),
                        state('b2')),
                    state('c',
                        on('t3', function () { return this.i === 0; }, goto('d')),
                        on('t3', goto('f')),
                        state('c1', on('t2', goto('c2', function () { this.i -= 1; }))),
                        state('c2'))),
                state('d'),
                state('f')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t1');
            expect(sc.getConfiguration()).toEqual(['c1', 'b1']);

            sc.send('t2');
            expect(sc.getConfiguration()).toEqual(['c2', 'b2']);

            sc.send('t3');
            expect(sc.getConfiguration()).toEqual(['d']);
        });

        it('4', function () {
            var sc = statechart(
                state('a', 
                    onEntry(function () { this.x = 2; }),
                    on('t', goto('b1'))),
                state('b',
                    onEntry(function () { this.x *= 3; }),
                    on(function () { return this.x === 30; }, goto('c')),
                    goto('f'),
                    state('b1', onEntry(function () { this.x *= 5; })),
                    state('b2', onEntry(function () { this.x *= 7; }))),
                state('c'),
                state('f')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('when data is changed then the condition condition still gets triggered', function () {
            var sc = statechart(
                parallel('p',
                    state('a', onEntry(function () { this.x = 'foo'; })),
                    state('b', on(function () { return this.x === 'foo' && this.y === 'bar'; }, goto('d'))),
                    state('c', onEntry(function () { this.y = 'bar'; }))),
                state('d')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['d']);
        });
    });
});