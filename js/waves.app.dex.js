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

    angular.module('app.dex', ['app.shared', 'ngSanitize']);
})();

(function () {
    'use strict';

    var POLLING_DELAY = 5000,
        HISTORY_LIMIT = 50;

    function DexController($scope, $interval, applicationContext, assetStoreFactory, datafeedApiService,
                           dexOrderService, dexOrderbookService, notificationService, utilsService, dialogService) {

        var ctrl = this,
            intervalPromise,

            assetStore = assetStoreFactory.createStore(applicationContext.account.address),

            sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

        ctrl.assetsList = [];

        ctrl.pair = {
            amountAsset: Currency.WAVES,
            priceAsset: Currency.MIR
        };

        emptyDataFields();

        var favoritePairs = [
			{ amountAsset: Currency.WAVES, priceAsset: Currency.DEIP },
			{ amountAsset: Currency.WAVES, priceAsset: Currency.LIBRE },
            { amountAsset: Currency.WAVES, priceAsset: Currency.MIR }
        ];

        ctrl.favoritePairs = favoritePairs;

        ctrl.createOrder = function (type, price, amount, fee, callback) {
            // TODO : add a queue for the orders which weren't yet accepted

            function emptyBadOrderFields() {
                ctrl.badOrderQuestion = '';
                ctrl.placeBadOrder = ctrl.refuseBadOrder = function () {};
            }

            var amountName = ctrl.pair.amountAsset.displayName,
                priceName = ctrl.pair.priceAsset.displayName,
                badSellOrder = (type === 'sell' && ctrl.buyOrders.length && price < ctrl.buyOrders[0].price * 0.9),
                badBuyOrder = (type === 'buy' && ctrl.sellOrders.length && price > ctrl.sellOrders[0].price * 1.1);

            if (badSellOrder || badBuyOrder) {

                ctrl.badOrderQuestion = 'Are you sure you want to ' + type + ' ' +
                    amountName + ' at price ' + price + ' ' + priceName + '?';

                ctrl.placeBadOrder = function () {
                    emptyBadOrderFields();
                    ctrl.realCreateOrder(type, price, amount, fee, callback);
                };

                ctrl.refuseBadOrder = function () {
                    emptyBadOrderFields();
                    callback();
                };

                dialogService.open('#dex-bad-order-confirmation');

            } else {
                ctrl.realCreateOrder(type, price, amount, fee, callback);
            }

        };

        ctrl.realCreateOrder = function (type, price, amount, fee, callback) {
            // TODO : add a queue for the orders which weren't yet accepted
            dexOrderService
                .addOrder(ctrl.pair, {
                    orderType: type,
                    amount: Money.fromTokens(amount, ctrl.pair.amountAsset),
                    price: OrderPrice.fromTokens(price, ctrl.pair),
                    fee: Money.fromTokens(fee, Currency.WAVES)
                }, sender)
                .then(function () {
                    refreshOrderbooks();
                    refreshUserOrders();
                    notificationService.notice('Order has been created!');
                    if (callback) {
                        callback();
                    }
                })
                .catch(function (e) {
                    var errorMessage = e.data ? e.data.message : null;
                    notificationService.error(errorMessage || 'Order has not been created!');
                    if (callback) {
                        callback();
                    }
                });
        };

        ctrl.cancelOrder = function (order) {
            // TODO : add a queue for the orders which weren't yet canceled

            // TODO : add different messages for cancel and delete actions
            dexOrderService
                .removeOrder(ctrl.pair, order, sender)
                .then(function () {
                    refreshOrderbooks();
                    refreshUserOrders();
                    notificationService.notice('Order has been canceled!');
                })
                .catch(function (e) {
                    console.log(e);
                    notificationService.error('Order could not be canceled!');
                });
        };

        ctrl.changePair = function (pair) {
            ctrl.pair = pair;
            emptyDataFields();
            refreshAll();
        };

        ctrl.fillBuyForm = fillBuyForm;

        ctrl.fillSellForm = fillSellForm;

        assetStore
            .getAll()
            .then(function (assetsList) {
                ctrl.assetsList = assetsList;
            })
            .then(function () {
                return dexOrderbookService.getOrderbook(ctrl.pair.amountAsset, ctrl.pair.priceAsset);
            })
            .then(function (orderbook) {
                ctrl.pair = {
                    // Here we just get assets by their IDs
                    amountAsset: assetStore.syncGetAsset(orderbook.pair.amountAsset),
                    priceAsset: assetStore.syncGetAsset(orderbook.pair.priceAsset)
                };

                ctrl.buyOrders = orderbook.bids;
                ctrl.sellOrders = orderbook.asks;
                refreshUserOrders();
                refreshTradeHistory();
            })
            .catch(function (e) {
                console.log(e);
            });

        // Events are from asset pickers
        $scope.$on('asset-picked', function (e, newAsset, type) {
            // Define in which widget the asset was changed
            ctrl.pair[type] = newAsset;
            emptyDataFields();
            refreshAll();
        });

        // Enable polling for orderbooks and newly created assets
        intervalPromise = $interval(function () {
            refreshAll();
        }, POLLING_DELAY);

        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        function emptyDataFields() {
            ctrl.buyOrders = [];
            ctrl.sellOrders = [];
            ctrl.userOrders = [];

            ctrl.buyFormValues = {};
            ctrl.sellFormValues = {};

            ctrl.tradeHistory = [];
            ctrl.lastTradePrice = 0;

            fillBuyForm();
            fillSellForm();

            // That forces children components to react on the pair change
            ctrl.pair = _.clone(ctrl.pair);
        }

        function refreshAll() {
            refreshOrderbooks();
            refreshUserOrders();
            refreshTradeHistory();
        }

        function refreshOrderbooks() {
            if (!ctrl.pair.amountAsset || !ctrl.pair.priceAsset) {
                return;
            }

            dexOrderbookService
                .getOrderbook(ctrl.pair.amountAsset, ctrl.pair.priceAsset)
                .then(function (orderbook) {
                    ctrl.buyOrders = orderbook.bids;
                    ctrl.sellOrders = orderbook.asks;
                    return orderbook.pair;
                })
                .then(function (pair) {
                    // Placing each asset in the right widget
                    if (ctrl.pair.amountAsset.id !== pair.amountAsset && ctrl.pair.priceAsset.id !== pair.priceAsset) {
                        var temp = ctrl.pair.amountAsset;
                        ctrl.pair.amountAsset = ctrl.pair.priceAsset;
                        ctrl.pair.priceAsset = temp;
                    }
                })
                .catch(function (e) {
                    console.log(e);
                });
        }

        function refreshUserOrders() {
            if (!ctrl.pair.amountAsset || !ctrl.pair.priceAsset) {
                return;
            }

            dexOrderService
                .getOrders(ctrl.pair)
                .then(function (orders) {
                    // TODO : add here orders from pending queues
                    ctrl.userOrders = orders;
                });
        }

        function refreshTradeHistory() {
            var pair = ctrl.pair;
            if (pair) {
                if (utilsService.isTestnet()) {
                    pair = utilsService.testnetSubstitutePair(pair);
                }

                datafeedApiService
                    .getTrades(pair, HISTORY_LIMIT)
                    .then(function (response) {
                        ctrl.tradeHistory = response.map(function (trade) {
                            return {
                                timestamp: trade.timestamp,
                                type: trade.type,
                                typeTitle: trade.type === 'buy' ? 'Buy' : 'Sell',
                                price: trade.price,
                                amount: trade.amount,
                                total: trade.price * trade.amount
                            };
                        });

                        ctrl.lastTradePrice = ctrl.tradeHistory[0].price;
                    });
            }
        }

        function fillBuyForm(price, amount, total) {
            ctrl.buyFormValues = {
                price: price,
                amount: amount,
                total: total
            };
        }

        function fillSellForm(price, amount, total) {
            ctrl.sellFormValues = {
                price: price,
                amount: amount,
                total: total
            };
        }
    }

    DexController.$inject = ['$scope', '$interval', 'applicationContext', 'assetStoreFactory', 'datafeedApiService',
        'dexOrderService', 'dexOrderbookService', 'notificationService', 'utilsService', 'dialogService'];

    angular
        .module('app.dex')
        .component('wavesDex', {
            controller: DexController,
            templateUrl: 'dex/component'
        });
})();

(function () {
    'use strict';

    var ASSET_ID_BYTE_LENGTH = 32;

    function AssetPickerController($scope, $element, autocomplete, apiService, utilityService) {
        var ctrl = this,
            autocompleteElement = $element.find('md-autocomplete');

        ctrl.isAssetLoading = false;
        ctrl.isPickingInProgress = false;
        ctrl.autocomplete = autocomplete.create();

        ctrl.$onChanges = function () {
            if (ctrl.assets && ctrl.pickedAsset) {
                if (!ctrl.isPickingInProgress) {
                    ctrl.autocomplete.selectedAsset = ctrl.pickedAsset;
                }

                ctrl.autocomplete.assets = ctrl.assets.map(function (asset) {
                    return asset.currency;
                }).filter(function (asset) {
                    return asset.verified && (asset !== ctrl.hiddenAsset);
                });
            }
        };

        autocompleteElement.on('focusin', function () {
            ctrl.isPickingInProgress = true;
        });

        autocompleteElement.on('focusout', function () {
            ctrl.isPickingInProgress = false;
            ctrl.autocomplete.selectedAsset = ctrl.pickedAsset;
        });

        ctrl.changeAsset = function () {
            var asset = ctrl.autocomplete.selectedAsset;
            if (asset && asset !== ctrl.pickedAsset) {
                ctrl.isPickingInProgress = false;
                $scope.$emit('asset-picked', asset, ctrl.type);
            }
        };

        ctrl.findAssets = function (query) {
            var assets = ctrl.autocomplete.querySearch(query);
            if (assets.length === 0 && isValidAssetId(query)) {
                ctrl.isAssetLoading = true;
                apiService.transactions.info(query).then(function (response) {
                    var currency = Currency.create({
                        id: response.id,
                        displayName: response.name,
                        precision: response.decimals
                    });

                    ctrl.autocomplete.assets.push(currency);
                    ctrl.autocomplete.selectedAsset = currency;

                    // That strangely unfocuses the element thus avoiding an empty dropdown.
                    autocompleteElement.focus();
                }).finally(function () {
                    ctrl.isAssetLoading = false;
                });
                return [];
            } else {
                ctrl.isAssetLoading = false;
                return assets;
            }
        };

        function isValidAssetId(str) {
            if (utilityService.isValidBase58String(str)) {
                return utilityService.base58StringToByteArray(str).length === ASSET_ID_BYTE_LENGTH;
            }
        }
    }

    AssetPickerController.$inject = ['$scope', '$element', 'autocomplete.assets', 'apiService', 'utilityService'];

    angular
        .module('app.dex')
        .component('wavesDexAssetPicker', {
            controller: AssetPickerController,
            bindings: {
                name: '@',
                type: '@',
                assets: '<',
                hiddenAsset: '<',
                pickedAsset: '<'
            },
            templateUrl: 'dex/asset.picker.component'
        });
})();

(function () {
    'use strict';

    var CANDLE_NUMBER = 100,
        CANDLE_FRAME = 30,
        POLLING_DELAY = 5000;

    function isCandleEmpty(c) {
        return +c.open === 0 && +c.high === 0 && +c.low === 0 && +c.close === 0 && +c.vwap === 0;
    }

    function adjustCandles(candles) {

        var i = candles.length;
        while (isCandleEmpty(candles[--i])) {}

        var fix = candles[i].open;
        while (++i < candles.length) {
            candles[i].open = candles[i].high = candles[i].low = candles[i].close = candles[i].vwap = fix;
        }

        return candles;

    }

    function ChartController($element, $interval, datafeedApiService, utilsService, chartsFactory) {
        var ctrl = this,
            intervalPromise;

        setTimeout(function () {
            // That instantiation is placed here because of the synchronous width resolving issue.
            ctrl.chart = chartsFactory.create('candlestick', $element);
            refreshCandles();
        }, 100);

        intervalPromise = $interval(refreshCandles, POLLING_DELAY);

        ctrl.$onChanges = function (changes) {
            if (ctrl.chart && changes.pair) {
                ctrl.chart.clear();
                refreshCandles();
            }
        };

        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        function refreshCandles() {
            var pair = ctrl.pair;
            if (pair) {
                if (utilsService.isTestnet()) {
                    pair = utilsService.testnetSubstitutePair(pair);
                }

                datafeedApiService
                    .getLastCandles(pair, CANDLE_NUMBER, CANDLE_FRAME)
                    .then(function (response) {
                        response = adjustCandles(response);
                        ctrl.chart.draw(response);
                    });
            }
        }
    }

    ChartController.$inject = ['$element', '$interval', 'datafeedApiService', 'utilsService', 'chartsFactory'];

    angular
        .module('app.dex')
        .component('wavesDexChart', {
            controller: ChartController,
            bindings: {
                pair: '<'
            },
            templateUrl: 'dex/chart.component'
        });
})();

(function () {
    'use strict';

    angular
        .module('app.dex')
        .factory('chartsFactory', [function () {
            function CandlestickChart($element) {
                var w = $element.width(),
                    h = $element.height(),
                    elem = $element.children('.chart').get(0),
                    margins = {left: 60, top: 20, right: 60, bottom: 30};

                this.width = w - margins.left - margins.right;
                this.height = h - margins.top - margins.bottom;

                this.x = techan.scale.financetime().range([0, this.width]);
                this.y = d3.scaleLinear().range([this.height, 0]);
                this.yVolume = d3.scaleLinear().range([this.y(0), this.y(0.2)]);

                this.candlestick = techan.plot.candlestick().xScale(this.x).yScale(this.y);
                this.accessor = this.candlestick.accessor();
                this.volume = techan.plot.volume()
                    .accessor(this.accessor)
                    .xScale(this.x)
                    .yScale(this.yVolume);

                this.xAxis = d3.axisBottom(this.x);
                this.yAxis = d3.axisLeft(this.y);
                this.yAxisRight = d3.axisRight(this.y);
                this.volumeAxis = d3.axisRight(this.yVolume).ticks(2).tickFormat(d3.format(',.3s'));

                this.svg = d3
                    .select(elem)
                    .append('svg')
                    .attr('width', this.width + margins.left + margins.right)
                    .attr('height', this.height + margins.top + margins.bottom);

                this.chart = this.svg
                    .append('g')
                    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

                this.chart.append('g')
                    .attr('class', 'candlestick');

                this.chart.append('g')
                    .attr('class', 'volume');

                this.chart.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + this.height + ')');

                this.chart.append('g')
                    .attr('class', 'y axis');

                this.chart.append('g')
                    .attr('class', 'y axis-right')
                    .attr('transform', 'translate(' + this.width + ',0)');

                this.chart.append('g')
                    .attr('class', 'volume axis');

                this.chart.append('text')
                    .attr('class', 'note')
                    .attr('transform', 'translate(' + (this.width - 250) + ',10)')
                    .text('Candles cover 30 minute intervals');

                this.chart.append('text')
                    .attr('class', 'ticker')
                    .attr('transform', 'translate(' + (this.width - 250) + ',30)');
            }

            CandlestickChart.prototype.clear = function () {
                this.draw([]);
            };

            CandlestickChart.prototype.draw = function (data) {
                data = this.prepareData(data);

                this.x.domain(data.map(this.accessor.d));
                this.y.domain(techan.scale.plot.ohlc(data, this.accessor).domain());
                this.yVolume.domain(techan.scale.plot.volume(data).domain());

                this.chart.selectAll('g.candlestick').datum(data).call(this.candlestick);
                this.chart.selectAll('g.volume').datum(data).call(this.volume);
                this.chart.selectAll('g.x.axis').call(this.xAxis);
                this.chart.selectAll('g.y.axis').call(this.yAxis);
                this.chart.selectAll('g.y.axis-right').call(this.yAxisRight);
                this.chart.selectAll('g.volume.axis').call(this.volumeAxis);

                var now = new Date(),
                    hh = now.getHours(),
                    mm = now.getMinutes(),
                    ss = now.getSeconds();
                hh = hh < 10 ? '0' + hh : hh;
                mm = mm < 10 ? '0' + mm : mm;
                ss = ss < 10 ? '0' + ss : ss;
                this.chart.selectAll('text.ticker').text('Last updated: ' + hh + ':' + mm + ':' + ss);
            };

            CandlestickChart.prototype.prepareData = function (rawData) {
                var self = this,
                    lastTradePrice = 0;
                return rawData.map(function (candle) {
                    var adjustedHigh = Math.min(+candle.high, +candle.vwap * 1.5),
                        adjustedLow = Math.max(+candle.low, +candle.vwap / 2);

                    return {
                        date: candle.timestamp,
                        open: +candle.open,
                        high: adjustedHigh,
                        low: adjustedLow,
                        close: +candle.close,
                        volume: +candle.volume
                    };
                }).sort(function (a, b) {
                    return d3.ascending(self.accessor.d(a), self.accessor.d(b));
                }).map(function (c) {
                    if (c.open === 0 && c.high === 0 && c.low === 0 && c.close === 0) {
                        c.open = c.high = c.low = c.close = lastTradePrice;
                    } else {
                        lastTradePrice = c.close;
                    }

                    return c;
                });
            };

            return {
                create: function (type, $element) {
                    if (type === 'candlestick') {
                        return new CandlestickChart($element);
                    }
                }
            };
        }]);
})();

(function () {
    'use strict';

    function FavoritesController() {
        var ctrl = this;

        ctrl.onClick = function (pair) {
            ctrl.switchPair({
                amountAsset: pair.amountAsset,
                priceAsset: pair.priceAsset
            });
        };
    }

    angular
        .module('app.dex')
        .component('wavesDexFavorites', {
            controller: FavoritesController,
            bindings: {
                pairs: '<',
                switchPair: '<'
            },
            templateUrl: 'dex/favorites.component'
        });
})();

(function () {
    'use strict';

    function HistoryController() {}

    angular
        .module('app.dex')
        .component('wavesDexHistory', {
            controller: HistoryController,
            bindings: {
                pair: '<',
                trades: '<'
            },
            templateUrl: 'dex/history.component'
        });
})();

(function () {
    'use strict';

    var FEE = 0.003,
        BALANCE_UPDATE_DELAY = 5000;

    function OrderCreatorController($interval, applicationContext, matcherApiService) {

        var ctrl = this,
            intervalPromise;

        ctrl.buy = {
            price: '',
            amount: '',
            total: '',
            fee: FEE,
            blocked: false
        };

        ctrl.sell = {
            price: '',
            amount: '',
            total: '',
            fee: FEE,
            blocked: false
        };

        ctrl.submitBuyOrder = function () {
            if (!ctrl.buy.amount || !ctrl.buy.price) {
                return;
            }

            ctrl.buy.blocked = true;
            ctrl.submit('buy', ctrl.buy.price, ctrl.buy.amount, FEE, function () {
                ctrl.buy.blocked = false;
                refreshBalances();
            });
        };

        ctrl.submitSellOrder = function () {
            if (!ctrl.sell.amount || !ctrl.sell.price) {
                return;
            }

            ctrl.sell.blocked = true;
            ctrl.submit('sell', ctrl.sell.price, ctrl.sell.amount, FEE, function () {
                ctrl.sell.blocked = false;
                refreshBalances();
            });
        };

        // Those two methods are called to update `total` after user's input:

        ctrl.updateBuyTotal = function () {
            ctrl.buy.total = ctrl.buy.price * ctrl.buy.amount || '';
        };

        ctrl.updateSellTotal = function () {
            ctrl.sell.total = ctrl.sell.price * ctrl.sell.amount || '';
        };

        // Those two methods calculate the amount as current balance divided by last history price:

        ctrl.buyFullBalance = function () {
            var price = ctrl.buy.price || ctrl.lastPrice,
                balance = ctrl.priceAssetBalance.toTokens();

            if (price && balance) {
                ctrl.buy.price = price;
                ctrl.buy.amount = Money.fromTokens(balance / price, ctrl.pair.amountAsset).toTokens();
                ctrl.updateBuyTotal();
            }
        };

        ctrl.sellFullBalance = function () {
            var price = ctrl.sell.price || ctrl.lastPrice,
                balance = ctrl.amountAssetBalance.toTokens();

            if (price && balance) {
                ctrl.sell.price = price;
                ctrl.sell.amount = balance;
                ctrl.updateSellTotal();
            }
        };

        intervalPromise = $interval(refreshBalances, BALANCE_UPDATE_DELAY);

        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        ctrl.$onChanges = function (changes) {
            refreshBalances();

            // Those lines write directly to the `total` field when it's calculated in an orderbook:

            if (changes.outerBuyValues) {
                ctrl.buy.price = ctrl.outerBuyValues.price || '';
                ctrl.buy.amount = ctrl.outerBuyValues.amount || '';
                ctrl.buy.total = ctrl.outerBuyValues.total || ctrl.buy.price * ctrl.buy.amount || '';
            }

            if (changes.outerSellValues) {
                ctrl.sell.price = ctrl.outerSellValues.price || '';
                ctrl.sell.amount = ctrl.outerSellValues.amount || '';
                ctrl.sell.total = ctrl.outerSellValues.total || ctrl.sell.price * ctrl.sell.amount || '';
            }
        };

        function refreshBalances() {
            var amountAsset = ctrl.pair.amountAsset,
                priceAsset = ctrl.pair.priceAsset;

            matcherApiService
                .getTradableBalance(amountAsset.id, priceAsset.id, applicationContext.account.address)
                .then(function (data) {
                    ctrl.amountAssetBalance = Money.fromCoins(data[amountAsset.id], amountAsset);
                    ctrl.priceAssetBalance = Money.fromCoins(data[priceAsset.id], priceAsset);
                });
        }
    }

    OrderCreatorController.$inject = ['$interval', 'applicationContext', 'matcherApiService'];

    angular
        .module('app.dex')
        .component('wavesDexOrderCreator', {
            controller: OrderCreatorController,
            bindings: {
                pair: '<',
                submit: '<',
                lastPrice: '<',
                outerBuyValues: '<buyValues',
                outerSellValues: '<sellValues'
            },
            templateUrl: 'dex/order.creator.component'
        });
})();

(function () {
    'use strict';

    var ACCEPTED = 'Accepted',
        PARTIALLY = 'PartiallyFilled',
        FILLED = 'Filled',
        CANCELLED = 'Cancelled',
        NOT_FOUND = 'NotFound',

        ORDER_CANCELED = 'OrderCanceled',
        ORDER_DELETED = 'OrderDeleted';

    function DexOrderService(matcherRequestService, matcherApiService, applicationContext) {

        // TODO : clean that all from the state.

        this.addOrder = function (pair, order, sender) {
            return matcherApiService
                .loadMatcherKey()
                .then(function (matcherKey) {
                    order.matcherKey = matcherKey;
                    var signedRequest = matcherRequestService.buildCreateOrderRequest(order, sender);
                    return matcherApiService.createOrder(signedRequest);
                }).catch(function (e) {
                    throw new Error(e);
                });
        };

        this.removeOrder = function (pair, order, sender) {
            var signedRequest = matcherRequestService.buildCancelOrderRequest(order.id, sender);
            if (order.status === ACCEPTED || order.status === PARTIALLY) {
                return matcherApiService
                    .cancelOrder(pair.amountAsset.id, pair.priceAsset.id, signedRequest)
                    .then(function (response) {
                        if (response.status !== ORDER_CANCELED) {
                            throw new Error();
                        }
                    }).catch(function (e) {
                        throw new Error(e);
                    });
            } else if (order.status === FILLED || order.status === CANCELLED) {
                return matcherApiService
                    .deleteOrder(pair.amountAsset.id, pair.priceAsset.id, signedRequest)
                    .then(function (response) {
                        if (response.status !== ORDER_DELETED) {
                            throw new Error();
                        }
                    }).catch(function (e) {
                        throw new Error(e);
                    });
            }
        };

        this.getOrders = function (pair) {
            return matcherApiService
                .loadUserOrders(pair.amountAsset.id, pair.priceAsset.id, {
                    publicKey: applicationContext.account.keyPair.public,
                    privateKey: applicationContext.account.keyPair.private
                })
                .then(function (response) {
                    return response.map(function (o) {
                        if (o.amount === null || o.price === null || o.filled === null || o.timestamp === null) {
                            console.error('Bad order!', o);
                            o.amount = o.amount || 0;
                            o.price = o.price || 0;
                            o.filled = o.filled || 0;
                            o.timestamp = o.timestamp || 0;
                        }

                        var orderPrice = OrderPrice.fromBackendPrice(o.price, pair).toTokens();

                        return {
                            id: o.id,
                            type: o.type,
                            price: Money.fromTokens(orderPrice, pair.priceAsset),
                            amount: Money.fromCoins(o.amount, pair.amountAsset),
                            filled: Money.fromCoins(o.filled, pair.amountAsset),
                            status: o.status || NOT_FOUND,
                            timestamp: o.timestamp
                        };
                    });
                })
                .catch(function (e) {
                    throw new Error(e);
                });
        };
    }

    DexOrderService.$inject = ['matcherRequestService', 'matcherApiService', 'applicationContext'];

    angular
        .module('app.dex')
        .service('dexOrderService', DexOrderService);
})();

(function () {
    'use strict';

    function denormalizeOrders(orders) {
        if (!orders || !orders.length) {
            return [];
        }

        var currentSum = 0;
        return orders.map(function (order) {
            var total = order.price * order.amount;
            currentSum += total;
            return {
                id: order.id,
                price: order.price,
                amount: order.amount,
                total: total,
                sum: currentSum
            };
        });
    }

    function calculateStringLength(n, precision) {
        // Get initial string length with a given precision.
        var len = n.toFixed(precision).length;
        // Add some length for commas (e.g. 10,000,000.0000).
        return len + Math.floor(n.toFixed(0).length / 3);
    }

    function getMaxLengths(orders, pair) {
        var price = 0,
            amount = 0,
            total = 0,
            sum = 0;

        // Get max value for each column.
        orders.forEach(function (order) {
            if (order.price > price) {
                price = order.price;
            }
            if (order.amount > amount) {
                amount = order.amount;
            }
            if (order.total > total) {
                total = order.total;
            }
            if (order.sum > sum) {
                sum = order.sum;
            }
        });

        return {
            price: calculateStringLength(price, pair.priceAsset.precision),
            amount: calculateStringLength(amount, pair.amountAsset.precision),
            total: calculateStringLength(total, pair.priceAsset.precision),
            sum: calculateStringLength(sum, pair.priceAsset.precision)
        };
    }

    function OrderbookController() {
        var ctrl = this;

        ctrl.lineClick = function (index) {
            var order = ctrl.orders[index],
                cumulativeAmount = ctrl.orders.slice(0, index + 1).reduce(function (amountSum, order) {
                    return amountSum + order.amount;
                }, 0);

            ctrl.onClick(Number(order.price).toFixed(8), cumulativeAmount, order.sum);
        };

        ctrl.$onChanges = function (changes) {
            if (!changes.rawOrders) {
                return;
            }

            var denormPreviousValue = denormalizeOrders(changes.rawOrders.previousValue),
                denormCurrentValue = denormalizeOrders(changes.rawOrders.currentValue);

            if (!_.isEqual(denormPreviousValue, denormCurrentValue)) {
                ctrl.orders = denormCurrentValue;
                ctrl.lengths = getMaxLengths(ctrl.orders, ctrl.pair);
            }
        };
    }

    angular
        .module('app.dex')
        .component('wavesDexOrderbook', {
            controller: OrderbookController,
            bindings: {
                type: '@',
                name: '@',
                pair: '<',
                onClick: '<',
                rawOrders: '<orders'
            },
            templateUrl: 'dex/orderbook.component'
        });
})();

(function () {
    'use strict';

    function normalizeOrder(order, pair) {
        return {
            price: OrderPrice.fromBackendPrice(order.price, pair).toTokens(),
            amount: Money.fromCoins(order.amount, pair.amountAsset).toTokens()
        };
    }

    function DexOrderbookService(matcherApiService) {
        this.getOrderbook = function (assetOne, assetTwo) {
            var assets = {};
            assets[assetOne.id] = assetOne;
            assets[assetTwo.id] = assetTwo;
            return matcherApiService
                .loadOrderbook(assetOne.id, assetTwo.id)
                .then(function (orderbook) {
                    var pair = {
                        amountAsset: assets[orderbook.pair.amountAsset],
                        priceAsset: assets[orderbook.pair.priceAsset]
                    };

                    return {
                        timestamp: orderbook.timestamp,
                        pair: orderbook.pair,
                        bids: orderbook.bids.map(function (order) {
                            return normalizeOrder(order, pair);
                        }),
                        asks: orderbook.asks.map(function (order) {
                            return normalizeOrder(order, pair);
                        })
                    };
                });
        };
    }

    DexOrderbookService.$inject = ['matcherApiService'];

    angular
        .module('app.dex')
        .service('dexOrderbookService', DexOrderbookService);
})();

(function () {
    'use strict';

    var statuses = {
        'PartiallyFilled': {
            title: 'Partial',
            order: 2
        },
        'Accepted': {
            title: 'Opened',
            order: 4
        },
        'Filled': {
            title: 'Closed',
            order: 6
        },
        'Cancelled': {
            title: 'Canceled',
            order: 8
        },
        'NotFound': {
            title: 'NotFound',
            order: 10
        }
    };

    var types = {
        'buy': {
            title: 'Buy',
            order: 0
        },
        'sell': {
            title: 'Sell',
            order: 1
        }
    };

    function status(s) {
        return statuses[s] ? statuses[s].title : '---';
    }

    function type(t) {
        return types[t] ? types[t].title : '---';
    }

    function denormalizeUserOrders(orders) {
        if (!orders || !orders.length) {
            return [];
        }

        return orders.map(function (order) {
            var price = order.price.toTokens(),
                amount = order.amount.toTokens(),
                filled = order.filled.toTokens();

            return {
                id: order.id,
                status: order.status,
                statusTitle: status(order.status),
                type: order.type,
                typeTitle: type(order.type),
                price: price,
                amount: amount,
                total: price * amount,
                filled: filled,
                timestamp: order.timestamp
            };
        });
    }

    function sortUserOrders(orders) {
        return orders.sort(function (a, b) {
            var aVal = statuses[a.status].order + types[a.type].order,
                bVal = statuses[b.status].order + types[b.type].order;
            return aVal - bVal;
        });
    }

    function UserOrdersController() {
        var ctrl = this;

        ctrl.cancel = function (obj) {
            ctrl.cancelOrder(obj.order);
        };

        ctrl.$onChanges = function (changes) {
            if (!changes.rawOrders) {
                return;
            }

            var denormPreviousValue = denormalizeUserOrders(changes.rawOrders.previousValue),
                denormCurrentValue = denormalizeUserOrders(changes.rawOrders.currentValue);

            if (!_.isEqual(denormPreviousValue, denormCurrentValue)) {
                ctrl.orders = sortUserOrders(denormCurrentValue);
            }
        };
    }

    angular
        .module('app.dex')
        .component('wavesDexUserOrders', {
            controller: UserOrdersController,
            bindings: {
                pair: '<',
                rawOrders: '<orders',
                cancelOrder: '<'
            },
            templateUrl: 'dex/user.orders.component'
        });
})();
