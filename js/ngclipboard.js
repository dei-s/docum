/*! ngclipboard - v1.1.3 - 2016-12-26
* https://github.com/beregovoy68/ngclipboard
* Copyright (c) 2016 Sachin; Licensed MIT */
(function() {
    'use strict';
    var MODULE_NAME = 'ngclipboard';
    var angular, Clipboard;

    // Check for CommonJS support
    if (typeof module === 'object' && module.exports) {
      angular = require('angular');
      Clipboard = require('clipboard');
      module.exports = MODULE_NAME;
    } else {
      angular = window.angular;
      Clipboard = window.Clipboard;
    }

    angular.module(MODULE_NAME, []).directive('ngclipboard', function() {
        return {
            restrict: 'A',
            scope: {
                ngclipboardSuccess: '&',
                ngclipboardError: '&',
                ngclipboardTextProvider: '&'
            },
            link: function(scope, element, attributes) {
                var options = {};
                if (attributes.ngclipboardTextProvider) {
                    options.text = function () {
                        return scope.ngclipboardTextProvider();
                    };
                }

                var clipboard = new Clipboard(element[0], options);

                clipboard.on('success', function(e) {
                  scope.$apply(function () {
                    scope.ngclipboardSuccess({
                      e: e
                    });
                  });
                });

                clipboard.on('error', function(e) {
                  scope.$apply(function () {
                    scope.ngclipboardError({
                      e: e
                    });
                  });
                });
            }
        };
    });
})();
