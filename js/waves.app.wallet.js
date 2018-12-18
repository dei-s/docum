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

    angular.module('app.wallet', ['app.shared'])
        .constant('wallet.events', {
            WALLET_SEND: 'wallet-send',
            WALLET_WITHDRAW: 'wallet-withdraw',
            WALLET_DEPOSIT: 'wallet-deposit',
            WALLET_CARD_DEPOSIT: 'wallet-card-deposit'
        });
})();

(function () {
    'use strict';

    function WalletBoxController() {
        var ctrl = this;

        var mapping = {};
        mapping[Currency.WAVES.displayName] = {
            image: 'wB-bg-WAV.svg',
            displayName: Currency.WAVES.displayName
        };
        mapping[Currency.BTC.displayName] = {
            image: 'wB-bg-BTC.svg',
            displayName: Currency.BTC.displayName
        };
        mapping[Currency.USD.displayName] = {
            image: 'wB-bg-USD.svg',
            displayName: Currency.USD.displayName
        };
        mapping[Currency.EUR.displayName] = {
            image: 'wB-bg-EUR.svg',
            displayName: Currency.EUR.displayName
        };
		mapping[Currency.DEIP.displayName] = {
			image: 'wB-bg-DEIP.svg',
			displayName: Currency.DEIP.displayName
		};
		mapping[Currency.LIBRE.displayName] = {
			image: 'wB-bg-LIBRE.svg',
			displayName: Currency.LIBRE.displayName
		};
		mapping[Currency.MIR.displayName] = {
            image: 'wB-bg-MIR.svg',
            displayName: Currency.MIR.displayName
        };

        ctrl.$onChanges = function (changesObject) {
            if (changesObject.balance) {
                var balance = changesObject.balance.currentValue;
                ctrl.integerBalance = balance.formatIntegerPart();
                ctrl.fractionBalance = balance.formatFractionPart();
            }
        };
        ctrl.$onInit = function () {
            ctrl.image = mapping[ctrl.balance.currency.displayName].image;
            ctrl.displayName = mapping[ctrl.balance.currency.displayName].displayName;
        };
    }

    WalletBoxController.$inject = [];

    angular
        .module('app.wallet')
        .component('walletBox', {
            controller: WalletBoxController,
            bindings: {
                balance: '<',
                onSend: '&',
                onWithdraw: '&',
                onDeposit: '&',
                detailsAvailable: '<?'
            },
            templateUrl: 'wallet/box.component'
        });
})();

(function () {
    'use strict';

    var TRANSACTIONS_TO_LOAD = 100;

    function WavesWalletListController($scope, $interval, events, applicationContext,
                                       apiService, transactionLoadingService, dialogService) {
        var ctrl = this;
        var refreshPromise;
        var refreshDelay = 10 * 1000;

        function sendCommandEvent(event, currency) {
            var assetWallet = findWalletByCurrency(currency);
            var wavesWallet = findWalletByCurrency(Currency.WAVES);

            $scope.$broadcast(event, {
                assetBalance: assetWallet.balance,
                wavesBalance: wavesWallet.balance
            });
        }

        function findWalletByCurrency(currency) {
            return _.find(ctrl.wallets, function (w) {
                return w.balance.currency === currency;
            });
        }

        ctrl.wallets = [
            {
                balance: new Money(0, Currency.WAVES),
                depositWith: Currency.BTC
            },
						{
                balance: new Money(0, Currency.MIR),
                depositWith: Currency.BTC
            },
						{
                balance: new Money(0, Currency.BTC),
                depositWith: Currency.BTC
            }
        ];

        ctrl.transactions = [];
        ctrl.send = send;
        ctrl.withdraw = withdraw;
        ctrl.deposit = deposit;
        ctrl.depositFromCard = depositFromCard;

        loadDataFromBackend();
        patchCurrencyIdsForTestnet();

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        function send (wallet) {
            sendCommandEvent(events.WALLET_SEND, wallet.balance.currency);
        }

        function withdraw (wallet) {
            var id = wallet.balance.currency.id,
                type;

			if (id === Currency.BTC.id || id === Currency.WAVES.id) {
                type = 'crypto';
            } else if (id === Currency.EUR.id || id === Currency.USD.id) {
                type = 'fiat';
			} else if (id === Currency.DEIP.id || id === Currency.LIBRE.id || id === Currency.MIR.id) {
				dialogService.open('#feat-not-active');
            } else {
                throw new Error('Add an option here!');
            }

            sendCommandEvent(events.WALLET_WITHDRAW + type, wallet.balance.currency);
        }

        function deposit (wallet) {
            if (wallet.balance.currency === Currency.WAVES) {
                depositFromCard(wallet.balance.currency);
			} else if (wallet.balance.currency === Currency.DEIP || wallet.balance.currency === Currency.LIBRE || wallet.balance.currency === Currency.MIR) {
				dialogService.open('#feat-not-active');
            } else {
                $scope.$broadcast(events.WALLET_DEPOSIT + wallet.balance.currency.id, {
                    assetBalance: wallet.balance,
                    depositWith: wallet.depositWith
                });
            }
        }

        function depositFromCard (currency) {
            dialogService.close();

            $scope.$broadcast(events.WALLET_CARD_DEPOSIT, {
                currency: currency
            });
        }

        function loadDataFromBackend() {
            refreshWallets();
            refreshTransactions();

            refreshPromise = $interval(function() {
                refreshWallets();
                refreshTransactions();
            }, refreshDelay);
        }

        function refreshWallets() {
            apiService.address.balance(applicationContext.account.address)
                .then(function (response) {
                    var wavesWallet = findWalletByCurrency(Currency.WAVES);
                    wavesWallet.balance = Money.fromCoins(response.balance, Currency.WAVES);
                });

            apiService.assets.balance(applicationContext.account.address).then(function (response) {
                _.forEach(response.balances, function (assetBalance) {
                    var id = assetBalance.assetId;

                    // adding asset details to cache
                    applicationContext.cache.putAsset(assetBalance.issueTransaction);
                    applicationContext.cache.updateAsset(id, assetBalance.balance,
                        assetBalance.reissuable, assetBalance.quantity);
                });

                _.forEach(ctrl.wallets, function (wallet) {
                    var asset = applicationContext.cache.assets[wallet.balance.currency.id];
                    if (asset) {
                        wallet.balance = asset.balance;
                    }
                });
            });
        }

        function refreshTransactions() {
            var txArray;
            transactionLoadingService.loadTransactions(applicationContext.account, TRANSACTIONS_TO_LOAD)
                .then(function (transactions) {
                    txArray = transactions;

                    return transactionLoadingService.refreshAssetCache(applicationContext.cache, transactions);
                })
                .then(function () {
                    ctrl.transactions = txArray;
                });
        }

        // Assets ID substitution for testnet
        function patchCurrencyIdsForTestnet() {
            if ($scope.isTestnet()) {
                Currency.EUR.id = '2xnE3EdpqXtFgCP156qt1AbyjpqdZ5jGjWo3CwTawcux';
                Currency.USD.id = 'HyFJ3rrq5m7FxdkWtQXkZrDat1F7LjVVGfpSkUuEXQHj';
                Currency.BTC.id = 'Fmg13HEHJHuZYbtJq8Da8wifJENq8uBxDuWoP9pVe2Qe';
                Currency.invalidateCache();
            }
        }
    }

    WavesWalletListController.$inject = ['$scope', '$interval', 'wallet.events', 'applicationContext',
                                         'apiService', 'transactionLoadingService', 'dialogService'];

    angular
        .module('app.wallet')
        .controller('walletListController', WavesWalletListController);
})();

(function () {
    'use strict';

    var DEFAULT_FEE_AMOUNT = '0.001';
    var FEE_CURRENCY = Currency.WAVES;

    function WalletSendController($scope, $timeout, constants, events, autocomplete,
                                  applicationContext, apiService, dialogService,
                                  transactionBroadcast, assetService, notificationService,
                                  formattingService, addressService) {
        var ctrl = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);

        ctrl.autocomplete = autocomplete;

        ctrl.confirm = {
            recipient: ''
        };

        ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.transfer,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, ctrl.assetBalance.currency);
                var address = transaction.recipient;
                var displayMessage = 'Sent ' + amount.formatAmount(true) + ' of ' +
                    ctrl.assetBalance.currency.displayName +
                    '<br/>Recipient ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            }
        );

        ctrl.validationOptions = {
            rules: {
                sendRecipient: {
                    required: true
                },
                sendAmount: {
                    required: true,
                    decimal: 8, // stub value updated on validation
                    min: 0,     // stub value updated on validation
                    max: constants.JAVA_MAX_LONG // stub value updated on validation
                },
                sendFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                },
                sendAttachment: {
                    maxbytelength: constants.MAXIMUM_ATTACHMENT_BYTE_SIZE
                }
            },
            messages: {
                sendRecipient: {
                    required: 'Recipient account number is required'
                },
                sendAmount: {
                    required: 'Amount to send is required'
                },
                sendFee: {
                    required: 'Transaction fee is required',
                    decimal: 'Transaction fee must be a number with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Transaction fee is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                },
                sendAttachment: {
                    maxbytelength: 'Attachment is too long'
                }
            }
        };

        ctrl.submitTransfer = submitTransfer;
        ctrl.broadcastTransaction = broadcastTransaction;

        resetForm();

        $scope.$on(events.WALLET_SEND, function (event, eventData) {

            resetForm();

            ctrl.feeAssetBalance = eventData.wavesBalance;
            ctrl.assetBalance = eventData.assetBalance;
            ctrl.feeAndTransferAssetsAreTheSame = eventData.assetBalance.currency === FEE_CURRENCY;
            ctrl.currency = eventData.assetBalance.currency.displayName;

            // Update validation options and check how they affect form validation
            ctrl.validationOptions.rules.sendAmount.decimal = ctrl.assetBalance.currency.precision;
            var minimumPayment = Money.fromCoins(1, ctrl.assetBalance.currency);
            ctrl.validationOptions.rules.sendAmount.min = minimumPayment.toTokens();
            ctrl.validationOptions.rules.sendAmount.max = ctrl.assetBalance.toTokens();
            ctrl.validationOptions.messages.sendAmount.decimal = 'The amount to send must be a number ' +
                'with no more than ' + minimumPayment.currency.precision +
                ' digits after the decimal point (.)';
            ctrl.validationOptions.messages.sendAmount.min = 'Payment amount is too small. ' +
                'It should be greater or equal to ' + minimumPayment.formatAmount(false);
            ctrl.validationOptions.messages.sendAmount.max = 'Payment amount is too big. ' +
                'It should be less or equal to ' + ctrl.assetBalance.formatAmount(false);

            dialogService.open('#wB-butSend-WAV');
        });

        function submitTransfer(transferForm) {
            if (!transferForm.validate(ctrl.validationOptions)) {
                // Prevent dialog from closing
                return false;
            }

            var amount = Money.fromTokens(ctrl.amount, ctrl.assetBalance.currency);
            var transferFee = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), FEE_CURRENCY);
            var paymentCost = transferFee;

            if (ctrl.feeAndTransferAssetsAreTheSame) {
                paymentCost = paymentCost.plus(amount);
            }

            if (paymentCost.greaterThan(ctrl.feeAssetBalance)) {
                notificationService.error('Not enough ' + FEE_CURRENCY.displayName + ' for the transfer');
                return false;
            }

            var assetTransfer = {
                recipient: addressService.cleanupOptionalPrefix(ctrl.recipient),
                amount: amount,
                fee: transferFee
            };

            if (ctrl.attachment) {
                assetTransfer.attachment = converters.stringToByteArray(ctrl.attachment);
            }

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            // Create a transaction and wait for confirmation
            ctrl.broadcast.setTransaction(assetService.createAssetTransferTransaction(assetTransfer, sender));

            // Set data to the confirmation dialog
            ctrl.confirm.amount = assetTransfer.amount;
            ctrl.confirm.fee = assetTransfer.fee;
            ctrl.confirm.recipient = assetTransfer.recipient;

            // Open confirmation dialog (async because this method is called while another dialog is open)
            $timeout(function () {
                dialogService.open('#send-payment-confirmation');
            }, 1);

            // Close payment dialog
            return true;
        }

        function broadcastTransaction() {
            ctrl.broadcast.broadcast();
        }

        function resetForm() {
            ctrl.recipient = '';
            ctrl.amount = '0';
            ctrl.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            ctrl.confirm.fee = Money.fromTokens(DEFAULT_FEE_AMOUNT, FEE_CURRENCY);
            ctrl.autocomplete.defaultFee(Number(DEFAULT_FEE_AMOUNT));
        }
    }

    WalletSendController.$inject = ['$scope', '$timeout', 'constants.ui', 'wallet.events', 'autocomplete.fees',
        'applicationContext', 'apiService', 'dialogService', 'transactionBroadcast', 'assetService',
        'notificationService', 'formattingService', 'addressService'];

    angular
        .module('app.wallet')
        .controller('walletSendController', WalletSendController);
})();

(function () {
    'use strict';

    var DEFAULT_FEE_AMOUNT = '0.001',
        DEFAULT_ERROR_MESSAGE = 'Connection is lost';

    function WavesWalletWithdrawController ($scope, constants, events, autocomplete, dialogService, $element,
                                            coinomatService, transactionBroadcast, notificationService,
                                            apiService, formattingService, assetService, applicationContext) {

        var ctrl = this;
        var type = $element.data('type');

        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, Currency.WAVES);
        var notPermittedBitcoinAddresses = {};

        ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.transfer,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, ctrl.assetBalance.currency);
                var address = transaction.recipient;
                var displayMessage = 'Sent ' + amount.formatAmount(true) + ' of ' +
                    ctrl.assetBalance.currency.displayName +
                    '<br/>Gateway ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            });

        ctrl.autocomplete = autocomplete;

        ctrl.validationOptions = {
            onfocusout: function (element) {
                return !(element.name in ['withdrawFee']); // FIXME
            },
            rules: {
                withdrawAddress: {
                    required: true
                },
                withdrawAmount: {
                    required: true,
                    decimal: 8,
                    min: 0,
                    max: constants.JAVA_MAX_LONG
                },
                withdrawFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                },
                withdrawTotal: {
                    required: true,
                    decimal: 8,
                    min: 0,
                    max: constants.JAVA_MAX_LONG
                }
            },
            messages: {
                withdrawAddress: {
                    required: 'Bitcoin address is required'
                },
                withdrawAmount: {
                    required: 'Amount to withdraw is required'
                },
                withdrawFee: {
                    required: 'Gateway transaction fee is required',
                    decimal: 'Transaction fee must be with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Transaction fee is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                },
                withdrawTotal: {
                    required: 'Total amount is required'
                }
            }
        };

        ctrl.confirm = {
            amount: {},
            fee: {},
            gatewayAddress: '',
            address: ''
        };

        ctrl.confirmWithdraw = confirmWithdraw;
        ctrl.refreshAmount = refreshAmount;
        ctrl.refreshTotal = refreshTotal;
        ctrl.broadcastTransaction = broadcastTransaction;
        ctrl.gatewayEmail = 'support@coinomat.com';

        resetForm();

        $scope.$on(events.WALLET_WITHDRAW + type, function (event, eventData) {
            ctrl.assetBalance = eventData.assetBalance;
            ctrl.wavesBalance = eventData.wavesBalance;

			if (ctrl.assetBalance.currency === Currency.BTC) {
                withdrawCrypto();
            } else if (ctrl.assetBalance.currency === Currency.EUR) {
                withdrawEUR();
            } else if (ctrl.assetBalance.currency === Currency.USD) {
                withdrawUSD();
            } else {
                $scope.home.featureUnderDevelopment();
            }
        });

        function withdrawCrypto() {
            coinomatService.getWithdrawRate(ctrl.assetBalance.currency)
                .then(function (response) {
                    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
                    var minimumPayment = Money.fromCoins(1, ctrl.assetBalance.currency);
                    minimumPayment = Money.fromTokens(Math.max(minimumPayment.toTokens(), response.in_min),
                        ctrl.assetBalance.currency);
                    var maximumPayment = Money.fromTokens(Math.min(ctrl.assetBalance.toTokens(),
                        response.in_max), ctrl.assetBalance.currency);
                    ctrl.sourceCurrency = ctrl.assetBalance.currency.displayName;
                    ctrl.exchangeRate = response.xrate;
                    ctrl.feeIn = response.fee_in;
                    ctrl.feeOut = response.fee_out;
                    ctrl.targetCurrency = response.to_txt;
                    ctrl.total = response.in_def;
                    ctrl.minimumPayment = minimumPayment;
                    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
                    ctrl.validationOptions.rules.withdrawAmount.decimal = ctrl.assetBalance.currency.precision;
                    ctrl.validationOptions.rules.withdrawAmount.max = maximumPayment.toTokens();
                    ctrl.validationOptions.rules.withdrawAmount.min = minimumPayment.toTokens();
                    ctrl.validationOptions.messages.withdrawAddress.required = minimumPayment.currency.displayName +
                        ' address is required';
                    ctrl.validationOptions.messages.withdrawAmount.decimal = 'The amount to withdraw must be ' +
                        'a number with no more than ' + minimumPayment.currency.precision +
                        ' digits after the decimal point (.)';
                    ctrl.validationOptions.messages.withdrawAmount.min = 'Withdraw amount is too small. ' +
                        'It should be greater or equal to ' + minimumPayment.formatAmount();
                    ctrl.validationOptions.messages.withdrawAmount.max = 'Withdraw amount is too big. ' +
                        'It should be less or equal to ' + maximumPayment.formatAmount();

                    refreshAmount();

                    dialogService.open('#withdraw-crypto-dialog');
                }).catch(function (exception) {
                if (exception && exception.data && exception.data.error) {
                    notificationService.error(exception.error);
                } else {
                    notificationService.error(DEFAULT_ERROR_MESSAGE);
                }
            }).then(function () {
                return coinomatService.getDepositDetails(Currency.BTC, Currency.BTC,
                    applicationContext.account.address);
            }).then(function (depositDetails) {
                notPermittedBitcoinAddresses[depositDetails.address] = 1;

                return coinomatService.getDepositDetails(Currency.BTC, Currency.WAVES,
                    applicationContext.account.address);
            }).then(function (depositDetails) {
                notPermittedBitcoinAddresses[depositDetails.address] = 1;
            });
        }

        function withdrawEUR() {
            ctrl.sourceCurrency = Currency.EUR.displayName;
            dialogService.open('#withdraw-fiat-dialog');
        }

        function withdrawUSD() {
            ctrl.sourceCurrency = Currency.USD.displayName;
            dialogService.open('#withdraw-fiat-dialog');
        }

        function validateRecipientBTCAddress(recipient) {
            if (!recipient.match(/^[0-9a-z]{27,34}$/i)) {
                throw new Error('Bitcoin address is invalid. Expected address length is from 27 to 34 symbols');
            }

            if (notPermittedBitcoinAddresses[recipient]) {
                throw new Error('Withdraw on deposit bitcoin accounts is not permitted');
            }
        }

        function validateWithdrawCost(withdrawCost, availableFunds) {
            if (withdrawCost.greaterThan(availableFunds)) {
                throw new Error('Not enough Waves for the withdraw transfer');
            }
        }

        function confirmWithdraw (amountForm) {
            if (!amountForm.validate(ctrl.validationOptions)) {
                return false;
            }

            try {
                var withdrawCost = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), Currency.WAVES);
                validateWithdrawCost(withdrawCost, ctrl.wavesBalance);
                if (ctrl.assetBalance.currency === Currency.BTC) {
                    validateRecipientBTCAddress(ctrl.recipient);
                }
            } catch (e) {
                notificationService.error(e.message);
                return false;
            }

            var total = Money.fromTokens(ctrl.total, ctrl.assetBalance.currency);
            var fee = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), Currency.WAVES);
            ctrl.confirm.amount = total;
            ctrl.confirm.fee = fee;
            ctrl.confirm.recipient = ctrl.recipient;

            coinomatService.getWithdrawDetails(ctrl.assetBalance.currency, ctrl.recipient)
                .then(function (withdrawDetails) {
                    ctrl.confirm.gatewayAddress = withdrawDetails.address;

                    var assetTransfer = {
                        recipient: withdrawDetails.address,
                        amount: total,
                        fee: fee,
                        attachment: converters.stringToByteArray(withdrawDetails.attachment)
                    };
                    var sender = {
                        publicKey: applicationContext.account.keyPair.public,
                        privateKey: applicationContext.account.keyPair.private
                    };
                    // creating the transaction and waiting for confirmation
                    ctrl.broadcast.setTransaction(assetService.createAssetTransferTransaction(assetTransfer, sender));

                    resetForm();

                    dialogService.open('#withdraw-confirmation');
                })
                .catch(function (exception) {
                    notificationService.error(exception.message);
                });

            return true;
        }

        function broadcastTransaction () {
            ctrl.broadcast.broadcast();
        }

        function refreshTotal () {
            var amount = ctrl.exchangeRate * ctrl.amount;
            var total = Money.fromTokens(amount + ctrl.feeIn + ctrl.feeOut, ctrl.assetBalance.currency);
            ctrl.total = total.formatAmount(true, false);
        }

        function refreshAmount () {
            var total = Math.max(0, ctrl.exchangeRate * (ctrl.total - ctrl.feeIn) - ctrl.feeOut);
            var amount = Money.fromTokens(total, ctrl.assetBalance.currency);
            ctrl.amount = amount.formatAmount(true, false);
        }

        function resetForm () {
            ctrl.recipient = '';
            ctrl.address = '';
            ctrl.autocomplete.defaultFee(Number(DEFAULT_FEE_AMOUNT));
        }
    }

    WavesWalletWithdrawController.$inject = [
        '$scope', 'constants.ui', 'wallet.events', 'autocomplete.fees', 'dialogService', '$element',
        'coinomatService', 'transactionBroadcast', 'notificationService',
        'apiService', 'formattingService', 'assetService', 'applicationContext'
    ];

    angular
        .module('app.wallet')
        .controller('walletWithdrawController', WavesWalletWithdrawController);
})();

(function () {
    'use strict';

    var DEFAULT_ERROR_MESSAGE = 'Connection is lost';

    function WavesWalletDepositController($scope, events, coinomatService, dialogService, notificationService,
                                          applicationContext, bitcoinUriService, utilsService, $element) {

        var ctrl = this;
        var currencyId = Currency[$element.data('currency')].id;

        ctrl.btc = {
            bitcoinAddress: '',
            bitcoinAmount: '',
            bitcoinUri: '',
            minimumAmount: 0.001
        };

        ctrl.fiat = {
            verificationLink: 'https://go.idnow.de/coinomat/userdata/' + applicationContext.account.address,
            email: 'support@coinomat.com'
        };

        ctrl.refreshBTCUri = function () {
            var params = null;
            if (ctrl.btc.bitcoinAmount >= ctrl.btc.minimumAmount) {
                params = {
                    amount: ctrl.btc.bitcoinAmount
                };
            }
            ctrl.btc.bitcoinUri = bitcoinUriService.generate(ctrl.btc.bitcoinAddress, params);
        };

        $scope.$on(events.WALLET_DEPOSIT + currencyId, function (event, eventData) {
            ctrl.depositWith = eventData.depositWith;
            ctrl.assetBalance = eventData.assetBalance;
            ctrl.currency = ctrl.assetBalance.currency.displayName;

            // Show deposit popups only on mainnet
            if (ctrl.assetBalance.currency === Currency.BTC && !utilsService.isTestnet()) {
                depositBTC();
            } else if (ctrl.assetBalance.currency === Currency.EUR) {
                depositEUR();
            } else if (ctrl.assetBalance.currency === Currency.USD) {
                depositUSD();
            } else {
                $scope.home.featureUnderDevelopment();
            }
        });

        function catchErrorMessage(e) {
            if (e && e.message) {
                notificationService.error(e.message);
            } else {
                notificationService.error(DEFAULT_ERROR_MESSAGE);
            }
        }

        function depositBTC() {
            coinomatService.getDepositDetails(ctrl.depositWith, ctrl.assetBalance.currency,
                applicationContext.account.address)
                .then(function (depositDetails) {
                    dialogService.open('#deposit-btc-dialog');
                    ctrl.btc.bitcoinAddress = depositDetails.address;
                    ctrl.btc.bitcoinUri = bitcoinUriService.generate(ctrl.btc.bitcoinAddress);
                })
                .catch(catchErrorMessage);
        }

        function depositEUR() {
            dialogService.open('#deposit-eur-dialog');
        }

        function depositUSD() {
            dialogService.open('#deposit-usd-dialog');
        }
    }

    WavesWalletDepositController.$inject = [
        '$scope', 'wallet.events', 'coinomatService', 'dialogService', 'notificationService',
        'applicationContext', 'bitcoinUriService', 'utilsService', '$element'
    ];

    angular
        .module('app.wallet')
        .controller('walletDepositController', WavesWalletDepositController);
})();

(function () {
    'use strict';

    var DEFAULT_AMOUNT_TO_PAY = 50;

    function FiatCurrency (code, displayName) {
        this.code = code;
        if (displayName) {
            this.displayName = displayName;
        } else {
            this.displayName = code;
        }
    }

    function WavesCardDepositController ($scope, $window, $q, events, dialogService,
                                         fiatService, applicationContext, notificationService) {
        var deferred;
        var ctrl = this;
        ctrl.currencies = [new FiatCurrency('EURO', 'Euro'), new FiatCurrency('USD')];
        ctrl.limits = {};
        ctrl.updateReceiveAmount = updateReceiveAmount;
        ctrl.updateLimitsAndReceiveAmount = updateLimitsAndReceiveAmount;
        ctrl.redirectToMerchant = redirectToMerchant;

        reset();

        $scope.$on(events.WALLET_CARD_DEPOSIT, function (event, eventData) {
            dialogService.open('#card-deposit-dialog');

            reset();
            ctrl.crypto = eventData.currency;

            updateLimitsAndReceiveAmount();
        });

        function reset() {
            ctrl.payAmount = DEFAULT_AMOUNT_TO_PAY;
            ctrl.payCurrency = ctrl.currencies[0];
            ctrl.crypto = {};
            ctrl.getAmount = '';
        }

        function updateLimitsAndReceiveAmount() {
            fiatService.getLimits(applicationContext.account.address, ctrl.payCurrency.code, ctrl.crypto)
                .then(function (response) {
                    ctrl.limits = {
                        min: Number(response.min),
                        max: Number(response.max)
                    };

                    if (ctrl.payAmount < ctrl.limits.min) {
                        ctrl.payAmount = ctrl.limits.min;
                    } else if (ctrl.payAmount > ctrl.limits.max) {
                        ctrl.payAmount = ctrl.limits.max;
                    }
                }).catch(function (response) {
                    remotePartyErrorHandler('get limits', response);
                });

            updateReceiveAmount();
        }

        function remotePartyErrorHandler(operationName, response) {
            if (response) {
                if (response.data) {
                    notificationService.error(response.data.message);
                } else if (response.statusText) {
                    notificationService.error('Failed to ' + operationName + '. Error code: ' + response.status +
                        '<br/>Message: ' + response.statusText);
                }
            } else {
                notificationService.error('Operation failed: ' + operationName);
            }
        }

        function updateReceiveAmount() {
            if (deferred) {
                deferred.reject();
                deferred = undefined;
            }

            var amount = Number(ctrl.payAmount);
            if (isNaN(amount) || ctrl.payAmount <= 0) {
                ctrl.getAmount = '';
                return;
            }

            deferred = $q.defer();
            deferred.promise.then(function (response) {
                if (response) {
                    ctrl.getAmount = response + ' ' + ctrl.crypto.shortName;
                } else {
                    ctrl.getAmount = '';
                }
            }).catch(function (value) {
                if (value) {
                    remotePartyErrorHandler('get rates', value);
                }
            });

            fiatService.getRate(applicationContext.account.address, ctrl.payAmount, ctrl.payCurrency.code, ctrl.crypto)
                .then(deferred.resolve).catch(deferred.reject);
        }

        function redirectToMerchant() {
            try {
                validateAmountToPay();

                var url = fiatService.getMerchantUrl(applicationContext.account.address,
                    ctrl.payAmount, ctrl.payCurrency.code, ctrl.crypto);
                $window.open(url, '_blank');

                return true;
            } catch (e) {
                notificationService.error(e.message);
                return false;
            }
        }

        function validateAmountToPay() {
            if (Number(ctrl.payAmount) < ctrl.limits.min) {
                throw new Error('Minimum amount to pay is ' + ctrl.limits.min + ' ' + ctrl.payCurrency.displayName);
            }
            if (Number(ctrl.payAmount) > ctrl.limits.max) {
                throw new Error('Maximum amount to pay is ' + ctrl.limits.max + ' ' + ctrl.payCurrency.displayName);
            }
        }
    }

    WavesCardDepositController.$inject = ['$scope', '$window', '$q', 'wallet.events', 'dialogService',
                                          'coinomatFiatService', 'applicationContext', 'notificationService'];

    angular
        .module('app.wallet')
        .controller('cardDepositController', WavesCardDepositController);
})();
