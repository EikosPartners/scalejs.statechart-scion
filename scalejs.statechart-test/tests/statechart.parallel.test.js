/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.statechart;

    describe('satechart parallel', function () {
        it('0', function () {
            var sc = statechart({
                states: [{
                    initial: true,
                    transitions: [{
                        target: 'p'
                    }]
                }, {
                    id: 'p',
                    parallel: true,
                    states: [{
                        id: 'a'
                    }, {
                        id: 'b'
                    }]
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a', 'b']);
        });

        it('1', function () {
            var sc = statechart({
                initial: 'p',
                states: [{
                    id: 'p',
                    parallel: true,
                    states: [{
                        id: 'a',
                        states: [{
                            initial: true,
                            transitions: [{
                                target: 'a1'
                            }]
                        }, {
                            id: 'a1',
                            transitions: [{
                                event: 't',
                                target: 'a2'
                            }]
                        }, {
                            id: 'a2'
                        }]
                    }, {
                        id: 'b',
                        states: [{
                            initial: true,
                            transitions: [{
                                target: 'b1'
                            }]
                        }, {
                            id: 'b1',
                            transitions: [{
                                event: 't',
                                target: 'b2'
                            }]
                        }, {
                            id: 'b2'
                        }]
                    }]
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['a1', 'b1']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['a2', 'b2']);
        });

        it('2', function () {
            var sc = statechart({
                initial: 'p1',
                states: [{
                    id: 'p1',
                    parallel: true,
                    states: [{
                        id: 's1',
                        initial: 'p2',
                        states: [{
                            id: 'p2',
                            parallel: true,
                            states: [{
                                id: 's3'
                            }, {
                                id: 's4'
                            }],
                            transitions: [{
                                event: 't',
                                target: 'p3'
                            }]
                        }, {
                            id: 'p3',
                            parallel: true,
                            states: [{
                                id: 's5'
                            }, {
                                id: 's6'
                            }]
                        }]
                    }, {
                        id: 's2',
                        initial: 'p4',
                        states: [{
                            id: 'p4',
                            parallel: true,
                            states: [{
                                id: 's7'
                            }, {
                                id: 's8'
                            }],
                            transitions: [{
                                target: 'p5',
                                event: 't'
                            }]
                        }, {
                            id: 'p5',
                            parallel: true,
                            states: [{
                                id: 's9'
                            }, {
                                id: 's10'
                            }]
                        }]
                    }]
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s3', 's4', 's7', 's8']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['s5', 's6', 's9', 's10']);
        });

        it('3', function () {
            var sc = statechart({
                initial: 'p1',
                states: [{
                    id: 'p1',
                    parallel: true,
                    states: [{
                        id: 's1',
                        initial: 'p2',
                        states: [{
                            id: 'p2',
                            parallel: true,
                            states: [{
                                id: 's3',
                                initial: 's3.1',
                                states: [{
                                    id: 's3.1',
                                    transitions: [{
                                        target: 's3.2',
                                        event: 't'
                                    }]
                                }, {
                                    id: 's3.2'
                                }]
                            }, {
                                id: 's4'
                            }]
                        }, {
                            id: 'p3',
                            parallel: true,
                            states: [{
                                id: 's5'
                            }, {
                                id: 's6'
                            }]
                        }]
                    }, {
                        id: 's2',
                        initial: 'p4',
                        states: [{
                            id: 'p4',
                            parallel: true,
                            states: [{
                                id: 's7'
                            }, {
                                id: 's8'
                            }],
                            transitions: [{
                                target: 'p5',
                                event: 't'
                            }]
                        }, {
                            id: 'p5',
                            parallel: true,
                            states: [{
                                id: 's9'
                            }, {
                                id: 's10'
                            }]
                        }]
                    }]
                }]
            });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s3.1', 's4', 's7', 's8']);

            sc.raise('t');

            expect(sc.getConfiguration()).toEqual(['s3.2', 's4', 's9', 's10']);
        });
    });
});