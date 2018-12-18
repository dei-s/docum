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

(function() {
    'use strict';

    angular
        .module('app.ui', [])
        .constant('ui.events', {
            SPLASH_COMPLETED: 'splash-completed',
            LOGIN_SUCCESSFUL: 'login-successful',
            LEASING_CANCEL: 'leasing-cancel'
        });

    angular
        .module('app.ui')
        // actual values are set in the application config phase
        .constant('constants.application', {
            CLIENT_VERSION: '',
            NODE_ADDRESS: '',
            COINOMAT_ADDRESS: ''
        });
})();

(function () {
    'use strict';

    angular
        .module('app.ui')
        .service('utilsService', ['constants.network', function (networkConstants) {
            this.isTestnet = function () {
                return networkConstants.NETWORK_NAME === 'devel' || networkConstants.NETWORK_NAME === 'testnet';
            };

            this.testnetSubstitutePair = function (pair) {
                var realIds = {};
                realIds[Currency.BTC.id] = '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS';
                realIds[Currency.USD.id] = 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck';
                realIds[Currency.EUR.id] = 'Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU';

                return {
                    amountAsset: {id: realIds[pair.amountAsset.id] || ''},
                    priceAsset: {id: realIds[pair.priceAsset.id] || realIds[Currency.BTC.id]}
                };
            };
        }]);
})();

(function () {
    'use strict';

    function ApplicationContextFactory(constants) {

        var assets = {};

        return {
            account: {},
            cache: {
                assets: assets,
                updateAsset: function (assetId, balance, reissuable, totalTokens) {
                    var asset = assets[assetId];
                    if (asset) {
                        asset.balance = Money.fromCoins(balance, asset.currency);
                        asset.totalTokens = Money.fromCoins(totalTokens, asset.currency);
                        asset.reissuable = reissuable;
                    }
                },
                putAsset: function (issueTransaction) {
                    var currency = Currency.create({
                        id: issueTransaction.assetId,
                        displayName: issueTransaction.name,
                        precision: issueTransaction.decimals
                    });
                    var asset = {
                        currency: currency,
                        description: issueTransaction.description,
                        timestamp: issueTransaction.timestamp,
                        sender: issueTransaction.sender,
                        totalTokens: Money.fromCoins(issueTransaction.quantity, currency)
                    };
                    var balance;

                    if (angular.isDefined(assets[currency.id])) {
                        balance = assets[currency.id].balance;
                    } else {
                        balance = new Money(0, currency);
                    }

                    asset.balance = balance;

                    assets[currency.id] = asset;
                },
                getAssetsList: function () {
                    return Object.keys(assets).map(function (key) {
                        return assets[key];
                    });
                }
            }
        };
    }

    ApplicationContextFactory.$inject = ['constants.transactions'];

    angular
        .module('app.ui')
        .factory('applicationContext', ApplicationContextFactory);
})();

(function () {
    'use strict';

    function CoinomatRestangularFactory(constants, rest) {
        return rest.withConfig(function(configurer) {
            configurer.setBaseUrl(constants.COINOMAT_ADDRESS);
        });
    }

    function DatafeedRestangularFactory(constants, rest) {
        return rest.withConfig(function(configurer) {
            configurer.setBaseUrl(constants.DATAFEED_ADDRESS);
        });
    }

    function MatcherRestangularFactory(constants, rest) {
        return rest.withConfig(function(configurer) {
            configurer.setBaseUrl(constants.MATCHER_ADDRESS);
        });
    }

    CoinomatRestangularFactory.$inject = ['constants.application', 'Restangular'];
    DatafeedRestangularFactory.$inject = ['constants.application', 'Restangular'];
    MatcherRestangularFactory.$inject = ['constants.application', 'Restangular'];

    angular
        .module('app.ui')
        .factory('CoinomatRestangular', CoinomatRestangularFactory)
        .factory('DatafeedRestangular', DatafeedRestangularFactory)
        .factory('MatcherRestangular', MatcherRestangularFactory);
})();

(function () {
    'use strict';

    var SCREENS = {
        splash: 'splash-screen',
        accounts: 'accounts-screen',
        main: 'main-screen'
    };

    function HomeController($scope, $window, events, applicationConstants, utilsService,
                            dialogService, applicationContext, notificationService, apiService) {

        $scope.isTestnet = utilsService.isTestnet;

        var home = this;
        home.screen = SCREENS.splash;
        home.featureUnderDevelopment = featureUnderDevelopment;
        home.logout = logout;

        var titlePrefix = utilsService.isTestnet() ? 'TESTNET ' : '';
        home.title = titlePrefix + 'Waves Blockchain';
        home.version = applicationConstants.CLIENT_VERSION;

        $scope.$on(events.SPLASH_COMPLETED, function () {
            home.screen = SCREENS.accounts;
        });

        $scope.clipboardOk = function (message) {
            message = message || 'Address copied successfully';
            notificationService.notice(message);
        };

        $scope.$on(events.LOGIN_SUCCESSFUL, function (event, account) {
            // putting the current account to the app context
            applicationContext.account = account;

            NProgress.start();
            apiService.assets.balance(applicationContext.account.address)
                .then(function (response) {
                    _.forEach(response.balances, function (balanceItem) {
                        applicationContext.cache.putAsset(balanceItem.issueTransaction);
                    });
                })
                .finally(function () {
                    home.screen = SCREENS.main;
                    NProgress.done();
                });
        });

        function featureUnderDevelopment() {
            dialogService.open('#feat-not-active');
        }

        function logout() {
            if ($window.chrome && $window.chrome.runtime && typeof $window.chrome.runtime.reload === 'function') {
                $window.chrome.runtime.reload();
            } else {
                $window.location.reload();
            }
        }
    }

    HomeController.$inject = ['$scope', '$window', 'ui.events', 'constants.application', 'utilsService',
        'dialogService', 'applicationContext', 'notificationService', 'apiService'];

    angular
        .module('app.ui')
        .controller('homeController', HomeController);
})();

(function () {
    'use strict';

    angular
        .module('app.ui')
        .controller('splashController', ['$scope', '$timeout', 'ui.events', function ($scope, $timeout, events) {
            NProgress.start();

            $timeout(function () {
                NProgress.done();
                $scope.$emit(events.SPLASH_COMPLETED);
            }, 1);
        }]);
})();
