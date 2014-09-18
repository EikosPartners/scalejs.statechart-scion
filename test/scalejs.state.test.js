/*global define,describe,expect,it,jasmine,afterEach*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core, application) {
    var sandbox = core.buildSandbox('scalejs.test'),
        registerStates = sandbox.state.registerStates,
        unregisterStates = sandbox.state.unregisterStates,
        state = sandbox.state.builder.state,
        onEntry = sandbox.state.builder.onEntry;
        //raise = sandbox.state.raise;

    describe('`state` extension', function () {
        it('is defined', function () {
            expect(core.state).toBeDefined();
            expect(sandbox.state).toBeDefined();
        });

        it('when a new app state is registered in `root` it gets entered', function () {
            var f = jasmine.createSpy('onEntry');
            registerStates('root',
                state('app',
                    state('module', onEntry(f))));

            application.run();

            expect(f).toHaveBeenCalled();

            application.exit();

            unregisterStates('app');
        });

        it('when two new app states are registered in `root` they both get entered', function () {
            var onEntry1 = jasmine.createSpy('onEntry 1'),
                onEntry2 = jasmine.createSpy('onEntry 2');

            registerStates('root',
                state('app', 
                    onEntry(onEntry1), 
                    state('module')),
                state('data',
                    onEntry(onEntry2)));

            application.run();

            expect(onEntry1).toHaveBeenCalled();
            expect(onEntry2).toHaveBeenCalled();

            application.exit();

            unregisterStates('app', 'data');
        });
    });
});