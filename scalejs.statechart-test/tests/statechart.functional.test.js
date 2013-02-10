/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart;

    describe('`statechart mechanics`', function () {
        describe('basic', function () {
            it('0', function () {
                var sc = statechart({
                    initial: 'a',
                    states: [{
                        id: 'a'
                    }]
                });
                sc.start();

                expect(sc.getConfiguration()).toEqual(['a']);
            });

            it('1', function () {
                var sc = statechart({
                    states: [{
                        id: 'initial1',
                        initial: true,
                        transitions: [{
                            target: 'a'
                        }]
                    }, {
                        id: 'a',
                        transitions: [{
                            target: 'b',
                            event: 't'
                        }]
                    }, {
                        id: 'b'
                    }]
                });
                sc.start();

                expect(sc.getConfiguration()).toEqual(['a']);

                sc.raise('t');
                expect(sc.getConfiguration()).toEqual(['b']);
            });

            it('2', function () {
                var sc = statechart({
                    states: [{
                        id: 'initial1',
                        initial: true,
                        transitions: [{
                            target: 'a'
                        }]
                    }, {
                        id: 'a',
                        transitions: [{
                            target: 'b',
                            event: 't'
                        }]
                    }, {
                        id: 'b',
                        transitions: [{
                            target: 'c',
                            event: 't2'
                        }]
                    }, {
                        id: 'c'
                    }]
                });
                sc.start();

                expect(sc.getConfiguration()).toEqual(['a']);

                sc.raise('t');
                expect(sc.getConfiguration()).toEqual(['b']);

                sc.raise('t2');
                expect(sc.getConfiguration()).toEqual(['c']);
            });
        });

        describe('document order', function () {
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

        describe('hierarchy', function () {
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

        describe('hierarchy and document order', function () {
            it('0', function () {
                var sc = statechart({
                    states: [{
                        initial: true,
                        transitions: [{
                            target: 'a1'
                        }]
                    }, {
                        states: [{
                            id: 'a1',
                            transitions: [{
                                target: 'a2',
                                event: 't'
                            }, {
                                target: 'c',
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
                    }, {
                        id: 'c'
                    }]
                });
                sc.start();

                expect(sc.getConfiguration()).toEqual(['a1']);

                sc.raise('t');
                expect(sc.getConfiguration()).toEqual(['a2']);
            });
        });
    });
});