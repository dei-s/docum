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

    angular.module('app.login', ['waves.core.services', 'app.ui', 'app.shared']);
})();

(function () {
    'use strict';

    angular
        .module('app.login')
        .constant('ui.login.modes', {
            REGISTER: 'register',
            CREATE_SEED: 'create-seed',
            LIST: 'list',
            LOGIN: 'login'
        });

    angular
        .module('app.login')
        .constant('ui.login.events', {
            CHANGE_MODE: 'change-mode',
            GENERATE_SEED: 'generate-seed',  // parameter - seed
            LOGIN: 'login'                   // parameter - account object
        });
})();

(function () {
    'use strict';

    function LoginContextFactory(moduleEvents, applicationEvents, modes) {
        return {
            showAccountsListScreen: function($scope) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.LIST);
            },

            showInputSeedScreen: function ($scope) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.CREATE_SEED);
            },

            showLoginScreen: function ($scope, account) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.LOGIN, account);
            },

            showRegisterScreen: function ($scope, seed) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.REGISTER, seed);
            },

            notifyGenerateSeed: function ($scope) {
                $scope.$emit(moduleEvents.GENERATE_SEED);
            },

            notifySignedIn: function ($scope, rawAddress, seed, keys) {
                var applicationState = {
                    address: rawAddress,
                    seed: seed,
                    keyPair: keys
                };

                $scope.$emit(applicationEvents.LOGIN_SUCCESSFUL, applicationState);
            }
        };
    }

    LoginContextFactory.$inject = ['ui.login.events', 'ui.events', 'ui.login.modes'];

    angular
        .module('app.login')
        .factory('loginContext', LoginContextFactory);
})();

(function () {
    'use strict';

    function AccountsController($scope, modes, events, passPhraseService, dialogService, cryptoService, loginContext) {
        var accounts = this;

        // by default start in list mode
        switchToMode(modes.LIST);

        $scope.$on(events.CHANGE_MODE, function (event, mode, param) {
            switchToMode(mode, param);
        });

        $scope.$on(events.GENERATE_SEED, function () {
            var seed = passPhraseService.generate();
            switchToMode(modes.REGISTER, seed);
            dialogService.openNonCloseable('#login-wPop-new');
        });

        function switchToMode(mode, param) {
            switch (mode) {
                case modes.REGISTER:
                    switchToRegisterMode(param);
                    break;

                case modes.CREATE_SEED:
                    switchToCreateSeedMode();
                    break;

                case modes.LIST:
                    switchToListMode();
                    break;

                case modes.LOGIN:
                    switchToLoginMode(param);
                    break;

                default:
                    throw new Error('Unsupported account operation: ' + mode);
            }

            accounts.mode = mode;
        }

        function switchToListMode() {
            accounts.caption = 'ACCOUNTS';
        }

        function switchToCreateSeedMode() {
            accounts.caption = 'SET UP YOUR SEED';
        }

        function switchToRegisterMode(seed) {
            accounts.caption = 'REGISTER ACCOUNT';
            accounts.displayAddress = cryptoService.buildRawAddressFromSeed(seed);
            // setting a seed to register a new account
            loginContext.seed = seed;
        }

        function switchToLoginMode(account) {
            accounts.caption = 'SIGN IN';
            accounts.displayAddress = account.address;
            // setting an account which we would like to sign in
            loginContext.currentAccount = account;
        }
    }

    AccountsController.$inject = [
        '$scope',
        'ui.login.modes',
        'ui.login.events',
        'passPhraseService',
        'dialogService',
        'cryptoService',
        'loginContext'
    ];

    angular
        .module('app.login')
        .controller('accountsController', AccountsController);
})();

(function () {
    'use strict';

    function AccountListController($scope, accountService, dialogService, loginContext) {
        var list = this;
        list.accounts = [];
        list.removeCandidate = {};

        list.removeAccount = removeAccount;
        list.createAccount = createAccount;
        list.importAccount = importAccount;
        list.signIn = signIn;
        list.showRemoveWarning = showRemoveWarning;

        accountService.getAccounts().then(function (accounts) {
            list.accounts = accounts;
        });

        function showRemoveWarning(index) {
            list.removeIndex = index;
            list.removeCandidate = list.accounts[index];
            dialogService.open('#account-remove-popup');
        }

        function removeAccount() {
            if (list.removeCandidate) {
                accountService.removeAccountByIndex(list.removeIndex).then(function () {
                    list.removeCandidate = undefined;
                    list.removeIndex = undefined;
                });
            }
        }

        function createAccount() {
            loginContext.notifyGenerateSeed($scope);
        }

        function importAccount() {
            loginContext.showInputSeedScreen($scope);
        }

        function signIn(account) {
            loginContext.showLoginScreen($scope, account);
        }
    }

    AccountListController.$inject = ['$scope', 'accountService', 'dialogService', 'loginContext'];

    angular
        .module('app.login')
        .controller('accountListController', AccountListController);
})();

(function () {
    'use strict';

    var WALLET_NAME_MAXLENGTH = 16;

    function AccountRegisterController($scope, accountService, cryptoService, loginContext) {
        var ctrl = this;

        ctrl.validationOptions = {
            onfocusout: false,
            rules: {
                walletName: {
                    maxlength: WALLET_NAME_MAXLENGTH
                },
                walletPassword: {
                    required: true,
                    minlength: 8,
                    password: true
                },
                walletPasswordConfirm: {
                    equalTo: '#walletPassword'
                }
            },
            messages: {
                walletName: {
                    maxlength: 'A wallet name is too long. Maximum name length is ' +
                        WALLET_NAME_MAXLENGTH + ' characters'
                },
                walletPassword: {
                    required: 'A password is required to store your seed safely',
                    minlength: 'Password must be 8 characters or longer'
                },
                walletPasswordConfirm: {
                    equalTo: 'Passwords do not match'
                }
            }
        };
        ctrl.saveAccountAndSignIn = saveAccountAndSignIn;
        ctrl.cancel = cancel;
        ctrl.seed = function (seed) {
            return arguments.length ? (loginContext.seed = seed) : loginContext.seed;
        };

        function cleanup() {
            ctrl.name = '';
            ctrl.password = '';
            ctrl.confirmPassword = '';
        }

        function saveAccountAndSignIn(form) {
            if (!form.validate()) {
                return false;
            }

            var seed = loginContext.seed;
            var cipher = cryptoService.encryptWalletSeed(seed, ctrl.password).toString();
            var keys = cryptoService.getKeyPair(seed);
            var checksum = cryptoService.seedChecksum(seed);
            var address = cryptoService.buildRawAddress(keys.public);

            var account = {
                name: ctrl.name,
                cipher: cipher,
                checksum: checksum,
                publicKey: keys.public,
                address: address
            };

            accountService.addAccount(account);

            loginContext.notifySignedIn($scope, address, seed, keys);

            cleanup();

            return true;
        }

        function cancel() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountRegisterController.$inject = ['$scope', 'accountService', 'cryptoService', 'loginContext'];

    angular
        .module('app.login')
        .controller('accountRegisterController', AccountRegisterController);
})();

(function () {
    'use strict';

    var SEED_MINIMUM_LENGTH = 25;

    function AccountSeedController($scope, loginContext, utilityService,
                                   cryptoService, dialogService, passPhraseService) {
        var vm = this;

        vm.validationOptions = {
            onfocusout: false,
            rules: {
                walletSeed: {
                    required: true,
                    minlength: SEED_MINIMUM_LENGTH
                }
            },
            messages: {
                walletSeed: {
                    required: 'Wallet seed is required',
                    minlength: 'Wallet seed is too short. A secure wallet seed should contain more than ' +
                       SEED_MINIMUM_LENGTH + ' characters'
                }
            }
        };
        vm.registerAccount = registerAccount;
        vm.back = goBack;
        vm.refreshAddress = refreshAddress;
        vm.checkSeedAndRegister = checkSeedAndRegister;
        vm.generateSeed = generateSeed;

        function cleanup() {
            //it seems we won't need this code if we switch to recreation of controllers on each event
            vm.seed = '';
            vm.displayAddress = '';
        }

        function refreshAddress() {
            vm.displayAddress = cryptoService.buildRawAddressFromSeed(vm.seed);
        }

        function checkSeedAndRegister(form) {
            if (!form.validate()) {
                return false;
            }

            if (utilityService.endsWithWhitespace(vm.seed)) {
                dialogService.openNonCloseable('#seed-whitespace-popup');
            } else {
                registerAccount();
            }

            return true;
        }

        function generateSeed() {
            vm.seed = passPhraseService.generate();
            refreshAddress();
        }

        function registerAccount() {
            loginContext.showRegisterScreen($scope, vm.seed);
            cleanup();
        }

        function goBack() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountSeedController.$inject = ['$scope',
        'loginContext',
        'utilityService',
        'cryptoService',
        'dialogService',
        'passPhraseService'];

    angular
        .module('app.login')
        .controller('accountSeedController', AccountSeedController);
})();

(function () {
    'use strict';

    function AccountLoginController ($scope, cryptoService, loginContext, notificationService) {
        var vm = this;

        vm.signIn = signIn;
        vm.cancel = cancel;

        function cleanup() {
            vm.password = '';
        }

        function performSignIn() {
            var account = loginContext.currentAccount;
            if (angular.isUndefined(account)) {
                throw new Error('Account to log in hasn\'t been selected');
            }

            var decryptedSeed = cryptoService.decryptWalletSeed(account.cipher, vm.password, account.checksum);
            if (!decryptedSeed) {
                notificationService.error('Wrong password! Please try again.');
            }
            else {
                var keys = cryptoService.getKeyPair(decryptedSeed);
                loginContext.notifySignedIn($scope, account.address, decryptedSeed, keys);
            }
        }

        function signIn() {
            performSignIn();
            cleanup();
        }

        function cancel() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountLoginController.$inject = ['$scope', 'cryptoService', 'loginContext', 'notificationService'];

    angular
        .module('app.login')
        .controller('accountLoginController', AccountLoginController);
})();

(function() {
    'use strict';

    angular.module('app.navigation', ['waves.core.services', 'app.ui', 'app.shared'])
        .constant('navigation.events', {
            NAVIGATION_CREATE_ALIAS: 'navigation-create-alias'
        });
})();
