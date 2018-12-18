/******************************************************************************
 * Copyright © 2016 The Waves Developers.                                     *
 *                                                                            *
 * See the LICENSE files at                                                   *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Waves software, including this file, may be copied, modified, propagated,  *
 * or distributed except according to the terms contained in the LICENSE      *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

(function () {
    'use strict';

    angular
        .module('app.navigation')
        .controller('navigationController', ['$scope', function ($scope) {
            var nav = this;

            nav.currentTab = 'wallet';
            nav.changeTab = changeTab;

            function changeTab (pageId) {
                nav.currentTab = pageId;
            }
        }]);
})();

(function () {
    'use strict';

    function MainMenuController($scope, $interval, events, applicationContext,
                                cryptoService, dialogService, notificationService, apiService) {
        var ctrl = this,
            refreshPromise,
            delayRefresh = 10 * 1000;

        ctrl.blockHeight = 0;
        ctrl.address = applicationContext.account.address;
        ctrl.addressQr = 'waves://' + ctrl.address;

        function initializeBackupFields() {
            ctrl.seed = applicationContext.account.seed;
            ctrl.encodedSeed = cryptoService.base58.encode(converters.stringToByteArray(ctrl.seed));
            ctrl.publicKey = applicationContext.account.keyPair.public;
            ctrl.privateKey = applicationContext.account.keyPair.private;
        }

        function buildBackupClipboardText() {
            var text = 'Seed: ' + ctrl.seed + '\n';
            text += 'Encoded seed: ' + ctrl.encodedSeed + '\n';
            text += 'Private key: ' + ctrl.privateKey + '\n';
            text += 'Public key: ' + ctrl.publicKey + '\n';
            text += 'Address: ' + ctrl.address;
            return text;
        }

        refreshBlockHeight();
        refreshPromise = $interval(refreshBlockHeight, delayRefresh);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        ctrl.showAddressQr = showAddressQr;
        ctrl.showBackupDialog = showBackupDialog;
        ctrl.showProfileDialog = showProfileDialog;
        ctrl.backup = backup;

        function showAddressQr() {
            dialogService.open('#address-qr-modal');
        }

        function showProfileDialog() {
            $scope.$broadcast(events.NAVIGATION_CREATE_ALIAS, {});
        }

        function showBackupDialog() {
            initializeBackupFields();
            dialogService.open('#header-wPop-backup');
        }

        function backup() {
            var clipboard = new Clipboard('#backupForm', {
                text: function () {
                    return buildBackupClipboardText();
                }
            });

            clipboard.on('success', function(e) {
                notificationService.notice('Account backup has been copied to clipboard');
                e.clearSelection();
            });

            angular.element('#backupForm').click();
            clipboard.destroy();
        }

        function refreshBlockHeight() {
            apiService.blocks.height().then(function (response) {
                ctrl.blockHeight = response.height;
                applicationContext.blockHeight = response.height;
            });
        }
    }

    MainMenuController.$inject = ['$scope', '$interval', 'navigation.events', 'applicationContext',
                                  'cryptoService', 'dialogService', 'notificationService', 'apiService'];

    angular
        .module('app.navigation')
        .controller('mainMenuController', MainMenuController);
})();

(function () {
    'use strict';

    var DEFAULT_FEE = Money.fromTokens(0.001, Currency.WAVES);
    var ALIAS_MINIMUM_LENGTH = 4;
    var ALIAS_MAXIMUM_LENGTH = 30;

    function WavesCreateAliasController($scope, $timeout, events, applicationContext,
                                        dialogService, notificationService, transactionBroadcast,
                                        formattingService, aliasRequestService, apiService) {
        var ctrl = this;

        ctrl.fee = DEFAULT_FEE;
        ctrl.aliasList = null;

        ctrl.validationOptions = {
            onfocusout: false,
            rules: {
                aliasName: {
                    required: true,
                    minlength: ALIAS_MINIMUM_LENGTH,
                    maxlength: ALIAS_MAXIMUM_LENGTH
                }
            },
            messages: {
                aliasName: {
                    required: 'Symbolic name is required',
                    minlength: 'Alias name is too short. Please enter at least ' + ALIAS_MINIMUM_LENGTH + ' symbols',
                    maxlength: 'Alias name is too long. Please use no more than ' + ALIAS_MAXIMUM_LENGTH + ' symbols'
                }
            }
        };

        ctrl.broadcast = new transactionBroadcast.instance(apiService.alias.create, function (tx) {
            var formattedTime = formattingService.formatTimestamp(tx.timestamp),
                displayMessage = 'Created alias \'' + tx.alias + '\'<br/>Date: ' + formattedTime;
            notificationService.notice(displayMessage);
        });

        ctrl.confirmCreateAlias = confirmCreateAlias;
        ctrl.broadcastTransaction = broadcastTransaction;

        $scope.$on(events.NAVIGATION_CREATE_ALIAS, function () {
            reset();
            getExistingAliases();
            dialogService.open('#create-alias-dialog');
        });

        function getExistingAliases() {
            apiService.alias
                .getByAddress(applicationContext.account.address)
                .then(function (aliasList) {
                    ctrl.aliasList = aliasList;
                });
        }

        function broadcastTransaction () {
            ctrl.broadcast.broadcast();
        }

        function confirmCreateAlias (form) {
            if (!form.validate(ctrl.validationOptions)) {
                return false;
            }

            var createAlias = {
                alias: ctrl.alias,
                fee: ctrl.fee
            };

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            // Create the transaction and waiting for confirmation
            ctrl.broadcast.setTransaction(aliasRequestService.buildCreateAliasRequest(createAlias, sender));

            // Open confirmation dialog (async because this method is called while another dialog is open)
            $timeout(function () {
                dialogService.open('#create-alias-confirmation');
            }, 1);

            return true;
        }

        function reset () {
            ctrl.alias = '';
        }
    }

    WavesCreateAliasController.$inject = ['$scope', '$timeout', 'navigation.events', 'applicationContext',
                                          'dialogService', 'notificationService', 'transactionBroadcast',
                                          'formattingService', 'aliasRequestService', 'apiService'];

    angular
        .module('app.navigation')
        .controller('createAliasController', WavesCreateAliasController);
})();

(function () {
    'use strict';

    function WavesTabController($scope, dialogService) {
        $scope.isSelected = function () {
            return $scope.pageId === $scope.currentPageId;
        };

        $scope.onClick = function () {
            $scope.onSelect({pageId: $scope.pageId});

            // cleaning unused modal dialog divs, created by previous tab
            dialogService.cleanup();
        };
    }

    function WavesTabLink(scope, element) {
        element.addClass('tabs-radio');
    }

    angular
        .module('app.navigation')
        .directive('wavesTab', function WavesTabDirective() {
            return {
                restrict: 'A',
                controller: ['$scope', 'dialogService', WavesTabController],
                scope: {
                    pageId: '@',
                    caption: '<',
                    onSelect: '&',
                    currentPageId: '<'
                },
                link: WavesTabLink,
                templateUrl: 'navigation/tab.directive'
            };
        });
})();
