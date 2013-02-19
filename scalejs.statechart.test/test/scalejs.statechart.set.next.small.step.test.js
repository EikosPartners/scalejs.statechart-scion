/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.statechart,
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('statechart `set` next small step', function () {
        it('0', function () {
            var sc = statechart(
                state('x', {initial: true}).goto('a', function () { this.a = 100; }),
                state('a').on('t', function () { return this.a === 100; }).goto('b'),
                state('b'),
                state('f')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });

        it('1', function () {
            var sc = statechart(
                state('a').on('t').goto('b', function () { this.i = 0; }),
                state('b')
                    .on(function () { return this.i < 100; }).goto('b', function () { this.i += 1; })
                    .on(function () { return this.i === 100; }).goto('c'),
                state('c')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['c']);
        });

        it('2', function () {
            var sc = statechart(
                state('a').on('t').goto('b', function () { this.i = 0; }),
                state('A',
                    state('b').on(function () { return this.i < 100; }).goto('c', function () { this.i += 1; }),
                    state('c').on(function () { return this.i < 100; }).goto('b', function () { this.i += 1; })
                    ).on(function () { return this.i === 100; }).goto('d', function () { this.i *= 2; }),
                state('d')
                    .on(function () { return this.i === 200; }).goto('e')
                    .goto('f'),
                state('e'),
                state('f')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['e']);
        });

        it('3', function () {
            // this demonstrates the difference between commited and not-commited data (see 'current.step')
            // all data changes during the small test are not commited right away but only after 'small step'
            // is complete. Therefore conditions on commited data should trigger only when a proper event is raised
            // (e.g. statechart would transition to 'd' only when 't3' fired and not right away when i == -1)
            var sc = statechart(
                state('a').on('t1').goto('p', function () { this.i = 0; }),
                parallel('p',
                    state('b',
                        state('b1').on('t2').goto('b2', function () { this.i = this.bigstep.i + 1; }),
                        state('b2')),
                    state('c',
                        state('c1').on('t2').goto('c2', function () { this.i = this.bigstep.i - 1; }),
                        state('c2')))
                    .on('t3', function () { return this.bigstep.i === -1; }).goto('d')
                    .on(function () { return this.i === 1; }).goto('f'),
                state('d'),
                state('f')
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.raise('t1');
            expect(sc.getConfiguration()).toEqual(['b1', 'c1']);

            sc.raise('t2');
            expect(sc.getConfiguration()).toEqual(['b2', 'c2']);

            sc.raise('t3');
            expect(sc.getConfiguration()).toEqual(['d']);
        });
    });
});