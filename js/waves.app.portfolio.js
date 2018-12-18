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

    angular.module('app.portfolio', ['app.shared'])
        .constant('portfolio.events', {
            ASSET_TRANSFER: 'asset-transfer',
            ASSET_REISSUE: 'asset-reissue',
            ASSET_DETAILS: 'asset-details',
            ASSET_MASSPAY: 'asset-masspay'
        });
})();

(function () {
    'use strict';

    function WavesAssetListController($scope, $timeout, $interval, events,
                                      applicationContext, apiService, formattingService) {
        var ctrl = this;
        var refreshPromise;
        var refreshDelay = 10 * 1000;

        ctrl.wavesBalance = new Money(0, Currency.WAVES);
        ctrl.assets = [];
        ctrl.noData = true;
        ctrl.assetTransfer = assetTransfer;
        ctrl.assetDetails = assetDetails;
        ctrl.assetReissue = assetReissue;
        ctrl.assetMassPay = assetMassPay;
        loadDataFromBackend();

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        function loadDataFromBackend() {
            refreshAssets();
            refreshBalance();

            refreshPromise = $interval(function() {
                refreshAssets();
                refreshBalance();
            }, refreshDelay);
        }

        function assetTransfer(assetId) {
            $scope.$broadcast(events.ASSET_TRANSFER, {
                assetId: assetId,
                wavesBalance: ctrl.wavesBalance
            });
        }

        function assetDetails(assetId) {
            $scope.$broadcast(events.ASSET_DETAILS, assetId);
        }

        function assetReissue(assetId) {
            $scope.$broadcast(events.ASSET_REISSUE, {
                assetId: assetId,
                wavesBalance: ctrl.wavesBalance
            });
        }

        function assetMassPay(assetId) {
            $scope.$broadcast(events.ASSET_MASSPAY, {
                assetId: assetId,
                wavesBalance: ctrl.wavesBalance
            });
        }

        function loadAssetDataFromCache(asset) {
            var cached = applicationContext.cache.assets[asset.id];
            asset.balance = cached.balance;
            asset.name = cached.currency.displayName;
            asset.total = cached.totalTokens.formatAmount();
            asset.timestamp = formattingService.formatTimestamp(cached.timestamp);
            asset.reissuable = cached.reissuable;
            asset.sender = cached.sender;
        }

        function refreshBalance() {
            apiService.address.balance(applicationContext.account.address)
                .then(function (response) {
                    ctrl.wavesBalance = Money.fromCoins(response.balance, Currency.WAVES);
                });
        }

        function refreshAssets() {
            var assets = [];
            apiService.assets.balance(applicationContext.account.address).then(function (response) {
                _.forEach(response.balances, function (assetBalance) {
                    var id = assetBalance.assetId;
                    var asset = {
                        id: id,
                        name: ''
                    };

                    // adding asset details to cache
                    applicationContext.cache.putAsset(assetBalance.issueTransaction);
                    applicationContext.cache.updateAsset(id, assetBalance.balance,
                        assetBalance.reissuable, assetBalance.quantity);

                    // adding an asset with positive balance only or your reissuable assets
                    var yourReissuableAsset = assetBalance.reissuable &&
                        assetBalance.issueTransaction.sender === applicationContext.account.address;
                    if (assetBalance.balance !== 0 || yourReissuableAsset) {
                        loadAssetDataFromCache(asset);
                        assets.push(asset);
                    }
                });

                var delay = 1;
                // handling the situation when some assets appeared on the account
                if (ctrl.assets.length === 0 && assets.length > 0) {
                    ctrl.noData = false;
                    delay = 500; // waiting for 0.5 sec on first data loading attempt
                }

                // handling the situation when all assets were transferred from the account
                if (ctrl.assets.length > 0 && assets.length === 0) {
                    ctrl.noData = true;
                    delay = 500;
                }

                // to prevent no data message and asset list from displaying simultaneously
                // we need to update
                $timeout(function() {
                    ctrl.assets = assets.sort(function (a, b) {
                        var aVerified = (a.balance.currency.verified === true) ? '1:' : '0:',
                            bVerified = (b.balance.currency.verified === true) ? '1:' : '0:';

                        // The verified assets go first, then we sort them by timestamp
                        aVerified += new Date(a.timestamp).getTime();
                        bVerified += new Date(b.timestamp).getTime();

                        return (bVerified > aVerified) ? 1 : -1;
                    });
                }, delay);
            });
        }
    }

    WavesAssetListController.$inject = ['$scope', '$timeout', '$interval', 'portfolio.events',
        'applicationContext', 'apiService', 'formattingService'];

    angular
        .module('app.portfolio')
        .controller('assetListController', WavesAssetListController);
})();

(function () {
    'use strict';

    var FEE_CURRENCY = Currency.WAVES;

    function AssetTransferController($scope, $timeout, constants, events, autocomplete, applicationContext,
                                     assetService, apiService, dialogService, formattingService,
                                     notificationService, transactionBroadcast, addressService) {
        var ctrl = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);

        ctrl.availableBalance = 0;
        ctrl.feeAssetBalance = 0;

        ctrl.confirm = {
            recipient: ''
        };

        ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.transfer,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, ctrl.asset.currency);
                var address = transaction.recipient;
                var displayMessage = 'Sent ' + amount.formatAmount(true) + ' of ' +
                    ctrl.asset.currency.displayName +
                    '<br/>Recipient ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            }
        );

        ctrl.autocomplete = autocomplete;

        ctrl.validationOptions = {
            rules: {
                assetRecipient: {
                    required: true
                },
                assetAmount: {
                    required: true,
                    decimal: 8, // stub value updated on validation
                    min: 0,     // stub value updated on validation
                    max: constants.JAVA_MAX_LONG // stub value updated on validation
                },
                assetFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                },
                assetAttachment: {
                    maxbytelength: constants.MAXIMUM_ATTACHMENT_BYTE_SIZE
                }
            },
            messages: {
                assetRecipient: {
                    required: 'Recipient account number is required'
                },
                assetAmount: {
                    required: 'Amount to send is required'
                },
                assetFee: {
                    required: 'Transaction fee is required',
                    decimal: 'Transaction fee must be with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Transaction fee is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                },
                maxbytelength: {
                    maxbytelength: 'Attachment is too long'
                }
            }
        };

        ctrl.submitTransfer = submitTransfer;
        ctrl.broadcastTransaction = broadcastTransaction;

        resetPaymentForm();

        $scope.$on(events.ASSET_TRANSFER, function (event, eventData) {
            var asset = applicationContext.cache.assets[eventData.assetId];
            ctrl.availableBalance = asset.balance;
            ctrl.feeAssetBalance = eventData.wavesBalance;
            ctrl.asset = asset;

            resetPaymentForm();

            // Update validation options and check how they affect form validation
            ctrl.validationOptions.rules.assetAmount.decimal = asset.currency.precision;
            var minimumPayment = Money.fromCoins(1, asset.currency);
            ctrl.validationOptions.rules.assetAmount.min = minimumPayment.toTokens();
            ctrl.validationOptions.rules.assetAmount.max = ctrl.availableBalance.toTokens();
            ctrl.validationOptions.messages.assetAmount.decimal = 'The amount to send must be a number ' +
                'with no more than ' + minimumPayment.currency.precision +
                ' digits after the decimal point (.)';
            ctrl.validationOptions.messages.assetAmount.min = 'Payment amount is too small. ' +
                'It should be greater or equal to ' + minimumPayment.formatAmount(false);
            ctrl.validationOptions.messages.assetAmount.max = 'Payment amount is too big. ' +
                'It should be less or equal to ' + ctrl.availableBalance.formatAmount(false);

            dialogService.open('#asset-transfer-dialog');
        });

        function submitTransfer(transferForm) {
            if (!transferForm.validate(ctrl.validationOptions)) {
                // Prevent dialog from closing
                return false;
            }

            var transferFee = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), FEE_CURRENCY);
            if (transferFee.greaterThan(ctrl.feeAssetBalance)) {
                notificationService.error('Not enough funds for the transfer transaction fee');
                return false;
            }

            var transferAmount = Money.fromTokens(ctrl.amount, ctrl.asset.currency);
            if (transferAmount.greaterThan(ctrl.availableBalance)) {
                notificationService.error('Transfer amount exceeds available asset balance');
                return false;
            }

            var assetTransfer = {
                recipient: addressService.cleanupOptionalPrefix(ctrl.recipient),
                amount: transferAmount,
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
                dialogService.open('#transfer-asset-confirmation');
            }, 1);

            // Close payment dialog
            return true;
        }

        function broadcastTransaction() {
            ctrl.broadcast.broadcast();
        }

        function resetPaymentForm() {
            ctrl.recipient = '';
            ctrl.amount = '0';
            ctrl.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            ctrl.confirm.fee = Money.fromTokens(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);
            ctrl.autocomplete.defaultFee(constants.MINIMUM_TRANSACTION_FEE);
        }
    }

    AssetTransferController.$inject = ['$scope', '$timeout', 'constants.ui', 'portfolio.events',
        'autocomplete.fees', 'applicationContext', 'assetService', 'apiService', 'dialogService',
        'formattingService', 'notificationService', 'transactionBroadcast', 'addressService'];

    angular
        .module('app.portfolio')
        .controller('assetTransferController', AssetTransferController);
})();

(function () {
    'use strict';

    function WavesAssetDetailsController($scope, $timeout, events, applicationContext, dialogService) {
        var details = this;

        function transformAddress(address) {
            return isMyAddress(address) ? 'You' : address;
        }

        function isMyAddress(address) {
            return address === applicationContext.account.address;
        }

        $scope.$on(events.ASSET_DETAILS, function (event, assetId) {
            var asset = applicationContext.cache.assets[assetId];
            if (angular.isUndefined(asset)) {
                throw new Error('Failed to find asset details by id ' + assetId);
            }

            details.assetId = assetId;
            details.name = asset.currency.displayName;
            details.description = asset.description;
            details.sender = transformAddress(asset.sender);
            details.isSenderCopiable = !isMyAddress(asset.sender);
            details.timestamp = asset.timestamp;
            details.totalTokens = asset.totalTokens.formatAmount();
            details.reissuable = asset.reissuable ? 'Yes' : 'No';

            $timeout(function () {
                dialogService.open('#asset-details-dialog');
            }, 1);
        });
    }

    WavesAssetDetailsController.$inject = ['$scope', '$timeout', 'portfolio.events', 'applicationContext',
        'dialogService'];

    angular
        .module('app.portfolio')
        .controller('assetDetailsController', WavesAssetDetailsController);
})();

(function () {
    'use strict';

    var FIXED_REISSUE_FEE = new Money(1, Currency.WAVES);

    function WavesAssetReissueController($scope, $timeout, constants, events, applicationContext, assetService,
                                         dialogService, notificationService, formattingService, apiService,
                                         transactionBroadcast) {
        var reissue = this;
        reissue.confirm = {};
        reissue.broadcast = new transactionBroadcast.instance(apiService.assets.reissue,
            function (transaction, response) {
                var amount = Money.fromCoins(transaction.quantity, reissue.asset.currency);
                var displayMessage = 'Reissued ' + amount.formatAmount(true) + ' tokens of asset ' +
                    reissue.asset.currency.displayName + '<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            });
        reissue.fee = FIXED_REISSUE_FEE;
        reissue.validationOptions = {
            rules: {
                assetAmount: {
                    required: true,
                    decimal: 0,
                    min: 0
                }
            },
            messages: {
                assetAmount: {
                    required: 'Amount to reissue is required'
                }
            }
        };
        reissue.submitReissue = submitReissue;
        reissue.broadcastTransaction = broadcastTransaction;

        resetReissueForm();

        $scope.$on(events.ASSET_REISSUE, function (event, eventData) {
            var asset = applicationContext.cache.assets[eventData.assetId];
            if (!asset)
                throw new Error('Failed to find asset data by id ' + eventData.assetId);

            resetReissueForm();

            reissue.assetId = eventData.assetId;
            reissue.assetName = asset.currency.displayName;
            reissue.totalTokens = asset.totalTokens;
            reissue.asset = asset;
            reissue.wavesBalance = eventData.wavesBalance;

            // update validation options and check how it affects form validation
            reissue.validationOptions.rules.assetAmount.decimal = asset.currency.precision;
            var minimumPayment = Money.fromCoins(1, asset.currency);
            var maximumPayment = Money.fromCoins(constants.JAVA_MAX_LONG, asset.currency);
            reissue.validationOptions.rules.assetAmount.min = minimumPayment.toTokens();
            reissue.validationOptions.rules.assetAmount.max = maximumPayment.toTokens();
            reissue.validationOptions.messages.assetAmount.decimal = 'The amount to reissue must be a number ' +
                'with no more than ' + minimumPayment.currency.precision +
                ' digits after the decimal point (.)';
            reissue.validationOptions.messages.assetAmount.min = 'Amount to reissue is too small. ' +
                'It should be greater or equal to ' + minimumPayment.formatAmount(false);
            reissue.validationOptions.messages.assetAmount.max = 'Amount to reissue is too big. ' +
                'It should be less or equal to ' + maximumPayment.formatAmount(false);

            dialogService.open('#asset-reissue-dialog');
        });

        function submitReissue (form) {
            if (!form.validate(reissue.validationOptions))
                // prevent dialog from closing
                return false;

            if (reissue.fee.greaterThan(reissue.wavesBalance)) {
                notificationService.error('Not enough funds for the reissue transaction fee');

                return false;
            }

            var assetReissue = {
                totalTokens: Money.fromTokens(reissue.amount, reissue.asset.currency),
                reissuable: reissue.reissuable,
                fee: reissue.fee
            };

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };
            // creating the transaction and waiting for confirmation
            reissue.broadcast.setTransaction(assetService.createAssetReissueTransaction(assetReissue, sender));

            // setting data for the confirmation dialog
            reissue.confirm.amount = assetReissue.totalTokens;
            reissue.confirm.fee = assetReissue.fee;

            // open confirmation dialog
            // doing it async because this method is called while another dialog is open
            $timeout(function () {
                dialogService.open('#asset-reissue-confirm-dialog');
            }, 1);

            // it's ok to close reissue dialog
            return true;
        }

        function broadcastTransaction () {
            reissue.broadcast.broadcast();
        }

        function resetReissueForm() {
            reissue.amount = '0';
            reissue.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            reissue.confirm.fee = reissue.fee;
        }
    }

    WavesAssetReissueController.$inject = ['$scope', '$timeout', 'constants.ui', 'portfolio.events',
        'applicationContext', 'assetService', 'dialogService', 'notificationService',
        'formattingService', 'apiService', 'transactionBroadcast'];

    angular
        .module('app.portfolio')
        .controller('assetReissueController', WavesAssetReissueController);
})();

(function () {
    'use strict';

    function AssetFilter(applicationContext, addressService) {
        function transformAddress (rawAddress) {
            var result = angular.isDefined(rawAddress) ? rawAddress : 'n/a';

            if (isMyAddress(result))
                result = 'You';

            return result;
        }

        function isMyAddress(address) {
            return address === applicationContext.account.address;
        }

        function formatAsset (transaction) {
            transaction.formatted = {
                sender: transformAddress(transaction.sender),
                canReissue: transaction.reissuable && isMyAddress(transaction.sender)
            };

            return transaction;
        }

        return function filterInput (input) {
            return _.map(input, formatAsset);
        };
    }

    AssetFilter.$inject = ['applicationContext', 'addressService'];

    angular
        .module('app.portfolio')
        .filter('asset', AssetFilter);
})();

(function () {
    'use strict';

    var MAXIMUM_FILE_SIZE_BYTES = 256 * 1024;
    var MAXIMUM_TRANSACTIONS_PER_FILE = 500;
    var FIRST_TRANSACTIONS_COUNT = 10;
    var LOADING_STAGE = 'loading';
    var PROCESSING_STAGE = 'processing';
    var ZERO_MONEY = Money.fromTokens(0, Currency.WAVES);

    function ValidationError(message) {
        this.message = message;
    }

    function WavesMassPaymentController ($scope, $window, $timeout, constants, events, applicationContext, autocomplete,
                                         notificationService, assetService, dialogService,
                                         transactionBroadcast, apiService) {
        var mass = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, Currency.WAVES);
        var transactions;

        mass.summary = {
            totalAmount: ZERO_MONEY,
            totalFee: ZERO_MONEY
        };
        mass.confirm = {
            recipients: 0
        };
        mass.filename = '';
        mass.transfers = [];
        mass.inputPayments = [];
        mass.autocomplete = autocomplete;
        mass.stage = LOADING_STAGE;
        mass.loadingInProgress = false;
        mass.broadcast = new transactionBroadcast.instance(apiService.assets.massPay,
            function (transaction, response) {
                var displayMessage = 'Sent ' + mass.summary.totalAmount.formatAmount(true) + ' of ' +
                        mass.summary.totalAmount.currency.displayName + ' to ' + mass.summary.totalTransactions +
                        ' recipients';
                notificationService.notice(displayMessage);
            });
        mass.validationOptions = {
            rules: {
                massPayFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                }
            },
            messages: {
                massPayFee: {
                    required: 'Fee per transaction is required',
                    decimal: 'Fee must be with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Fee per transaction is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                }
            }
        };
        mass.handleFile = handleFile;
        mass.loadInputFile = loadInputFile;
        mass.processInputFile = processInputFile;
        mass.submitPayment = submitPayment;
        mass.broadcastTransaction = broadcastTransaction;
        mass.transactionsToClipboard = transactionsToClipboard;
        mass.dataCopied = dataCopied;
        mass.cancel = cancel;

        cleanup();

        $scope.$on(events.ASSET_MASSPAY, function (event, eventData) {
            mass.wavesBalance = eventData.wavesBalance;
            mass.assetBalance = eventData.wavesBalance;
            if (eventData.assetId) {
                mass.assetBalance = applicationContext.cache.assets[eventData.assetId].balance;
            }

            mass.sendingWaves = mass.assetBalance.currency === Currency.WAVES;

            cleanup();

            dialogService.open('#asset-mass-pay-dialog');
        });

        function fileErrorHandler(evt) {
            cleanup();

            switch (evt.target.error.code) {
                case evt.target.error.NOT_FOUND_ERR:
                    notificationService.error('File Not Found!');
                    break;
                case evt.target.error.NOT_READABLE_ERR:
                    notificationService.error('File is not readable');
                    break;
                case evt.target.error.ABORT_ERR:
                    break; // noop
                default:
                    notificationService.error('An error occurred reading this file.');
            }
        }

        function loadInputFile (fileName, content) {
            try {
                mass.inputPayments = [];
                if (fileName.endsWith('.json')) {
                    mass.inputPayments = parseJsonFile(content);
                }
                else if (fileName.endsWith('.csv')) {
                    mass.inputPayments = parseCsvFile(content);
                }
                else {
                    throw new Error('Unsupported file type: ' + fileName);
                }
            }
            catch (ex) {
                notificationService.error('Failed to parse file: ' + ex);
            }
        }

        function parseCsvFile (content) {
            var lines = content.split('\n');
            var result = [];
            _.forEach(lines, function (line) {
                line = line.trim();
                if (line.length < 1)
                    return;

                var parts = line.split(';');
                if (parts.length < 2) {
                    throw new Error('CSV file contains ' + parts.length + ' columns. Expected 2 or 3 columns');
                }
                var address = parts[0];
                var amount = parseFloat(parts[1]);
                var id;
                if (parts.length > 2) {
                    id = parts[2];
                }

                result.push({
                    recipient: address,
                    amount: amount,
                    id: id
                });
            });

            return result;
        }

        function parseJsonFile (content) {
            return $window.JSON.parse(content);
        }

        function loadTransactionsFromFile() {
            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            try {
                transactions = [];
                var transfersToDisplay = [];
                var transferCurrency = mass.assetBalance.currency;
                var totalTransactions = 0;
                var totalAmount = Money.fromCoins(0, transferCurrency);
                var totalFee = Money.fromCoins(0, Currency.WAVES);
                var fee = Money.fromTokens(mass.autocomplete.getFeeAmount(), Currency.WAVES);
                var minimumPayment = Money.fromCoins(1, transferCurrency);
                _.forEach(mass.inputPayments, function (transfer) {
                    if (isNaN(transfer.amount)) {
                        throw new ValidationError('Failed to parse payment amount for address ' + transfer.recipient);
                    }

                    var assetTransfer = {
                        recipient: transfer.recipient,
                        amount: Money.fromTokens(transfer.amount, transferCurrency),
                        fee: fee,
                        attachment: transfer.id ? converters.stringToByteArray(transfer.id) : undefined
                    };

                    if (assetTransfer.amount.lessThan(minimumPayment)) {
                        throw new ValidationError('Payment amount ' + transfer.amount + ' to address ' +
                            transfer.recipient + ' is less than minimum (' + minimumPayment.formatAmount(true) + ')');
                    }

                    if (transfersToDisplay.length < FIRST_TRANSACTIONS_COUNT)
                        transfersToDisplay.push({
                            recipient: transfer.recipient,
                            amount: assetTransfer.amount.formatAmount(true)
                        });

                    transactions.push(assetService.createAssetTransferTransaction(assetTransfer, sender));

                    // statistics
                    totalAmount = totalAmount.plus(assetTransfer.amount);
                    totalFee = totalFee.plus(assetTransfer.fee);
                    totalTransactions++;
                });

                mass.broadcast.setTransaction(transactions);

                mass.summary.totalAmount = totalAmount;
                mass.summary.totalTransactions = totalTransactions;
                mass.summary.totalFee = totalFee;
                mass.transfers = transfersToDisplay;
                mass.stage = PROCESSING_STAGE;

                // cleaning up
                mass.filename = '';
                mass.inputPayments = [];
            }
            catch (e) {
                if (e instanceof ValidationError) {
                    mass.invalidPayment = true;
                    mass.inputErrorMessage = e.message;
                }
                else {
                    throw e;
                }
            }

            mass.loadingInProgress = false;
        }

        function processInputFile(form) {
            if (!form.validate(mass.validationOptions)) {
                return;
            }

            if (!mass.inputPayments || mass.inputPayments.length === 0) {
                notificationService.error('Payments were not provided or failed to parse. Nothing to load');

                return;
            }

            if (mass.inputPayments.length > MAXIMUM_TRANSACTIONS_PER_FILE) {
                notificationService.error('Too many payments for a single file. Maximum payments count ' +
                    'in a file should not exceed ' + MAXIMUM_TRANSACTIONS_PER_FILE);

                return;
            }

            mass.loadingInProgress = true;
            // loading transactions asynchronously
            $timeout(loadTransactionsFromFile, 150);
        }

        function submitPayment() {
            var paymentCost = !mass.sendingWaves ?
                mass.summary.totalFee :
                mass.summary.totalFee.plus(mass.summary.totalAmount);

            if (paymentCost.greaterThan(mass.wavesBalance)) {
                notificationService.error('Not enough Waves to make mass payment');

                return false;
            }

            if (mass.summary.totalAmount.greaterThan(mass.assetBalance)) {
                notificationService.error('Not enough "' + mass.assetBalance.currency.displayName +
                    '" to make mass payment');

                return false;
            }

            // setting data for the confirmation dialog
            mass.confirm.amount = mass.summary.totalAmount;
            mass.confirm.fee = mass.summary.totalFee;
            mass.confirm.recipients = mass.summary.totalTransactions;

            dialogService.close();
            $timeout(function () {
                dialogService.open('#asset-mass-pay-confirmation');
            }, 1);

            return true;
        }

        function cancel () {
            dialogService.close();
        }

        function broadcastTransaction() {
            mass.broadcast.broadcast();
        }

        function handleFile(file) {
            if (file.size > MAXIMUM_FILE_SIZE_BYTES) {
                notificationService.error('File "' + file.name + '" is too big. Maximum file size is ' +
                    MAXIMUM_FILE_SIZE_BYTES / 1024 + 'Kb');

                return;
            }

            var reader = new $window.FileReader();

            reader.onloadend = function (event) {
                NProgress.done();

                if (event.target.readyState == FileReader.DONE)
                    mass.loadInputFile(file.name, event.target.result);
            };
            reader.onloadstart = function (event) {
                cleanup();
                NProgress.start();
            };
            reader.onabort = function (event) {
                notificationService.error('File read cancelled');
            };
            reader.onerror = fileErrorHandler;

            reader.readAsText(file);
        }

        function transactionsToClipboard() {
            return $window.JSON.stringify(transactions, null, ' ');
        }

        function dataCopied() {
            notificationService.notice('Transactions copied successfully');
        }

        function cleanup() {
            mass.summary.totalAmount = ZERO_MONEY;
            mass.summary.totalTransactions = 0;
            mass.summary.totalFee = ZERO_MONEY;
            mass.stage = LOADING_STAGE;
            mass.invalidPayment = false;

            mass.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            mass.confirm.recipients = 0;
            mass.confirm.fee = Money.fromTokens(0, Currency.WAVES);

            mass.autocomplete.defaultFee(constants.MINIMUM_TRANSACTION_FEE);
        }
    }

    WavesMassPaymentController.$inject = ['$scope', '$window', '$timeout', 'constants.ui', 'portfolio.events',
        'applicationContext', 'autocomplete.fees',
        'notificationService', 'assetService', 'dialogService', 'transactionBroadcast', 'apiService'];

    angular
        .module('app.portfolio')
        .controller('massPaymentController', WavesMassPaymentController);
})();

(function () {
    'use strict';

    angular
        .module('app.portfolio')
        .directive('fileSelect', [function WavesFileSelectDirective() {
            return {
                restrict: 'A',
                scope: {
                    fileHandler: '&'
                },
                link: function (scope, element) {
                    element.on('change', function (changeEvent) {
                        var files = changeEvent.target.files;
                        if (files.length) {
                            scope.fileHandler({file: files[0]});
                        }
                    });
                }
            };
        }]);
})();
