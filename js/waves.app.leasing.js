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

    angular.module('app.leasing', ['app.shared']);
})();

(function () {
    'use strict';

    var DEFAULT_CURRENCY = Currency.WAVES;

    function WavesLeasingService (apiService) {
        function parseBalance(response) {
            return Money.fromCoins(response.balance, DEFAULT_CURRENCY);
        }

        this.loadBalanceDetails = function (address) {
            var details = {};
            return apiService.address.balance(address)
                .then(function (response) {
                    details.regular = parseBalance(response);

                    return apiService.address.effectiveBalance(address);
                })
                .then(function (response) {
                    details.effective = parseBalance(response);

                    return apiService.address.generatingBalance(address);
                })
                .then(function (response) {
                    details.generating = parseBalance(response);

                    return details;
                });
        };
    }

    WavesLeasingService.$inject = ['apiService'];

    angular
        .module('app.leasing')
        .service('leasingService', WavesLeasingService);
})();

(function () {
    'use strict';

    var POLLING_DELAY = 5000,
        DEFAULT_ERROR_MESSAGE = 'Failed to load balance details';

    function LeasingController($interval, constants, applicationContext,
                               leasingService, transactionLoadingService, notificationService) {
        var ctrl = this,
            intervalPromise;

        ctrl.transactions = [];
        ctrl.limitTo = 1000;
        ctrl.balanceDetails = null;

        refreshAll();
        intervalPromise = $interval(refreshAll, POLLING_DELAY);
        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        function refreshAll() {
            refreshBalanceDetails();
            refreshLeasingTransactions();
        }

        function refreshBalanceDetails() {
            leasingService
                .loadBalanceDetails(applicationContext.account.address)
                .then(function (balanceDetails) {
                    ctrl.balanceDetails = balanceDetails;
                }).catch(function (e) {
                    if (e) {
                        if (e.data) {
                            notificationService.error(e.data.message);
                        } else if (e.message) {
                            notificationService.error(e.message);
                        } else if (e.statusText) {
                            notificationService.error(e.statusText);
                        } else {
                            notificationService.error(DEFAULT_ERROR_MESSAGE);
                        }
                    } else {
                        notificationService.error(DEFAULT_ERROR_MESSAGE);
                    }
                });
        }

        function refreshLeasingTransactions() {
            transactionLoadingService
                .loadTransactions(applicationContext.account, ctrl.limitTo)
                .then(function (transactions) {
                    ctrl.transactions = transactions.filter(function (tx) {
                        var startLeasing = constants.START_LEASING_TRANSACTION_TYPE,
                            cancelLeasing = constants.CANCEL_LEASING_TRANSACTION_TYPE;
                        return tx.type === startLeasing || tx.type === cancelLeasing;
                    });
                });
        }
    }

    LeasingController.$inject = ['$interval', 'constants.transactions', 'applicationContext',
                                 'leasingService', 'transactionLoadingService', 'notificationService'];

    angular
        .module('app.leasing')
        .component('wavesLeasing', {
            controller: LeasingController,
            templateUrl: 'leasing/component'
        });
})();

(function () {
    'use strict';

    var FEE_CURRENCY = Currency.WAVES;

    function LeasingFormController($timeout, constants, applicationContext,
                                   apiService, dialogService, notificationService, transactionBroadcast,
                                   formattingService, addressService, leasingService, leasingRequestService) {
        var ctrl = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);

        ctrl.fee = minimumFee;
        ctrl.availableBalance = Money.fromCoins(0, Currency.WAVES);

        ctrl.broadcast = new transactionBroadcast.instance(apiService.leasing.lease,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, Currency.WAVES);
                var address = transaction.recipient;
                var displayMessage = 'Leased ' + amount.formatAmount(true) + ' of ' +
                    amount.currency.displayName +
                    '<br/>Recipient ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            }
        );

        ctrl.validationOptions = {
            rules: {
                leasingRecipient: {
                    required: true
                },
                leasingAmount: {
                    required: true,
                    decimal: 8, // stub value updated on validation
                    min: 0, // stub value updated on validation
                    max: constants.JAVA_MAX_LONG // stub value updated on validation
                }
            },
            messages: {
                leasingRecipient: {
                    required: 'Recipient account number is required'
                },
                leasingAmount: {
                    required: 'Amount to lease is required'
                }
            }
        };

        ctrl.confirm = {
            recipient: ''
        };

        ctrl.confirmLease = confirmLease;
        ctrl.broadcastTransaction = broadcastTransaction;

        reset();

        leasingService
            .loadBalanceDetails(applicationContext.account.address)
            .then(function (balanceDetails) {
                //FIXME: add here a correct value available to lease
                ctrl.availableBalance = balanceDetails.effective;

                reset();

                // Update validation options and check how they affect form validation
                ctrl.validationOptions.rules.leasingAmount.decimal = ctrl.availableBalance.currency.precision;
                var minimumPayment = Money.fromCoins(1, ctrl.availableBalance.currency);
                ctrl.validationOptions.rules.leasingAmount.min = minimumPayment.toTokens();
                ctrl.validationOptions.rules.leasingAmount.max = ctrl.availableBalance.toTokens();
                ctrl.validationOptions.messages.leasingAmount.decimal = 'The amount to leasing must be a number ' +
                    'with no more than ' + minimumPayment.currency.precision +
                    ' digits after the decimal point (.)';
                ctrl.validationOptions.messages.leasingAmount.min = 'Leasing amount is too small. ' +
                    'It should be greater or equal to ' + minimumPayment.formatAmount(false);
                ctrl.validationOptions.messages.leasingAmount.max = 'Leasing amount is too big. ' +
                    'It should be less or equal to ' + ctrl.availableBalance.formatAmount(false);
            });

        function confirmLease(form) {
            if (!form.validate(ctrl.validationOptions)) {
                return false;
            }

            var amount = Money.fromTokens(ctrl.amount, ctrl.availableBalance.currency);
            var transferFee = ctrl.fee;

            // We assume here that amount and fee are in Waves, however it's not hardcoded
            var leasingCost = amount.plus(transferFee);
            if (leasingCost.greaterThan(ctrl.availableBalance)) {
                notificationService.error('Not enough ' + FEE_CURRENCY.displayName + ' for the leasing transaction');
                return false;
            }

            var startLeasing = {
                recipient: addressService.cleanupOptionalPrefix(ctrl.recipient),
                amount: amount,
                fee: transferFee
            };

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            // Create a transaction and wait for confirmation
            ctrl.broadcast.setTransaction(leasingRequestService.buildStartLeasingRequest(startLeasing, sender));

            // Set data to the confirmation dialog
            ctrl.confirm.amount = startLeasing.amount;
            ctrl.confirm.fee = startLeasing.fee;
            ctrl.confirm.recipient = startLeasing.recipient;

            // Open confirmation dialog (async because this method is called while another dialog is open)
            $timeout(function () {
                dialogService.open('#start-leasing-confirmation');
            }, 1);

            // Close payment dialog
            return true;
        }

        function broadcastTransaction() {
            ctrl.broadcast.broadcast();
        }

        function reset() {
            ctrl.amount = '0';
            ctrl.recipient = '';
            ctrl.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            ctrl.confirm.fee = minimumFee;
        }
    }

    LeasingFormController.$inject = ['$timeout', 'constants.ui', 'applicationContext',
                                     'apiService', 'dialogService', 'notificationService', 'transactionBroadcast',
                                     'formattingService', 'addressService', 'leasingService', 'leasingRequestService'];

    angular
        .module('app.leasing')
        .component('wavesLeasingLeaseForm', {
            controller: LeasingFormController,
            templateUrl: 'leasing/lease.form.component'
        });
})();

(function () {
    'use strict';

    function WavesBalanceDetailsController () {
        var ctrl = this;

        ctrl.formattedBalance = {};

        ctrl.$onChanges = function () {
            if (ctrl.balanceDetails) {
                ctrl.formattedBalance = {
                    regular: formatMoney(ctrl.balanceDetails.regular),
                    effective: formatMoney(ctrl.balanceDetails.effective),
                    generating: formatMoney(ctrl.balanceDetails.generating)
                };
            }
        };

        function formatMoney(amount) {
            return amount.formatAmount(true) + ' ' + amount.currency.shortName;
        }
    }

    angular
        .module('app.leasing')
        .component('wavesLeasingBalanceDetails', {
            controller: WavesBalanceDetailsController,
            bindings: {
                balanceDetails: '<'
            },
            templateUrl: 'leasing/balance.details.component'
        });
})();
