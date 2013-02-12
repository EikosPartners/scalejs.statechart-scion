/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart.builder.statechart,
        state = core.statechart.builder.state,
        parallel = core.statechart.builder.parallel;

    describe('satechart more parallel', function () {
        it('0', function () {
            var sc = statechart(
                parallel('p',
                    state('a').on('t').goto('a'),
                    state('b'))
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a', 'b']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a', 'b']);
        });

        it('1', function () {
            var sc = statechart(
                parallel('p',
                    state('a',
                        state('a1'),
                        state('a2'))
                        .on('t').goto('a'),
                    state('b',
                        state('b1'),
                        state('b2')))
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);
        });

        it('2', function () {
            var sc = statechart(
                parallel('p',
                    state('a',
                        state('a1'),
                        state('a2')
                        ).on('t').goto('a'),
                    state('b',
                        state('b1').on('t').goto('b2'),
                        state('b2')))
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a1', 'b2']);
        });

        it('3', function () {
            var sc = statechart(
                parallel('p',
                    state('a',
                        state('a1').on('t').goto('a2'),
                        state('a2')
                        ),
                    state('b',
                        state('b1').on('t').goto('b2'),
                        state('b2')))
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a2', 'b2']);
        });

        it('4', function () {
            var sc = statechart(
                parallel('p',
                    state('a',
                        state('a1'),
                        state('a2')
                        ).on('t').goto('a'),
                    state('b',
                        state('b1'),
                        state('b2')
                        ).on('t').goto('b'))
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);
        });

        it('5', function () {
            var sc = statechart(
                parallel('p',
                    state('a',
                        state('a1'),
                        state('a2')
                        ).on('t').goto('a2'),
                    state('b',
                        state('b1'),
                        state('b2')
                        ).on('t').goto('b2'))
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a2', 'b2']);
        });

        it('6', function () {
            var sc = statechart(
                parallel('p',
                    state('a',
                        state('a1',
                            state('a11'),
                            state('a12')),
                        state('a2',
                            state('a21'),
                            state('a22'))
                        ).on('t').goto('a22'),
                    state('b',
                        state('b1',
                            state('b11').on('t').goto('b12'),
                            state('b12')),
                        state('b2',
                            state('b21'),
                            state('b22')))
                    )
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a11', 'b11']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a22', 'b12']);
        });

        it('7', function () {
            var sc = statechart(
                parallel('p',
                    state('a',
                        state('a1',
                            state('a11'),
                            state('a12')),
                        state('a2',
                            state('a21'),
                            state('a22'))
                        ).on('t').goto('a22'),
                    state('b',
                        state('b1',
                            state('b11'),
                            state('b12')),
                        state('b2',
                            state('b21'),
                            state('b22'))
                        ).on('t').goto('b22')
                    )
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a11', 'b11']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a22', 'b22']);
        });

        it('8', function () {
            var sc = statechart(
                state('x').on('t').goto('a22'),
                parallel('p',
                    state('a',
                        state('a1',
                            state('a11'),
                            state('a12')),
                        state('a2',
                            state('a21'),
                            state('a22'))
                        ),
                    state('b',
                        state('b1',
                            state('b11'),
                            state('b12')),
                        state('b2',
                            state('b21'),
                            state('b22'))
                        )
                    )
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['x']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a22', 'b11']);
        });

        it('9', function () {
            var sc = statechart(
                state('x').on('t').goto('a22 b22'),
                parallel('p',
                    state('a',
                        state('a1',
                            state('a11'),
                            state('a12')),
                        state('a2',
                            state('a21'),
                            state('a22'))
                        ),
                    state('b',
                        state('b1',
                            state('b11'),
                            state('b12')),
                        state('b2',
                            state('b21'),
                            state('b22'))
                        )
                    )
            );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['x']);

            sc.raise('t');
            expect(sc.getConfiguration()).toEqual(['a22', 'b22']);
        });
    });
});