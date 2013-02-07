/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core, model) {
    var statechart = core.statechart;

    describe('`statechart`', function () {
        it('core extension is defined', function () {
            expect(statechart).toBeDefined();
        });

        it('gets created from spec', function () {
            var sc = statechart({
                    id: 's1',
                    states: [{
                        id: 's2',
                        initial: 's4',
                        states: [{
                            id: 's3'
                        }, {
                            id: 's4'
                        }]
                    }]
                }),
                configuration = sc.getConfiguration();
            //console.log(JSON.stringify(configuration));
        });
    });
});