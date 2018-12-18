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

/**
 * @requires {decimal.js}
 */
var Currency = (function () {
	var currencyCache = {};

	function Currency(data) {
		data = data || {};

		this.id = data.id; // base58 encoded asset id of the currency
		this.displayName = data.displayName;
		this.shortName = data.shortName || data.displayName;
		this.precision = data.precision; // number of decimal places after a decimal point
		this.verified = data.verified || false;

		if (data.roundingMode !== undefined) {
			this.roundingMode = data.roundingMode;
		} else {
			this.roundingMode = Decimal.ROUND_HALF_UP;
		}

		return this;
	}

	Currency.prototype.toString = function () {
		if (this.shortName)
			return this.shortName;

		return this.displayName;
	};

	var WAVES = new Currency({
		id: '',
		displayName: 'Waves',
		shortName: 'WAVES',
		precision: 8,
		verified: true
	});

	var BTC = new Currency({
		id: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
		displayName: 'Bitcoin',
		shortName: 'BTC',
		precision: 8,
		verified: true
	});

	var USD = new Currency({
		id: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
		displayName: 'US Dollar',
		shortName: 'USD',
		precision: 2,
		verified: true
	});

	var EUR = new Currency({
		id: 'Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU',
		displayName: 'Euro',
		shortName: 'EUR',
		precision: 2,
		verified: true
	});

	var DEIP = new Currency({
		id: '8Wj49jM8y9qfFx2QG6HxQXbiaxdnTt8EGm8mEqXJWFL4',
		displayName: 'Platform',
		shortName: 'DEIP',
		precision: 2,
		verified: true
	});

	var LIBRE = new Currency({
		id: '8qqoeygkNFqSjqf8JrB1LtzkCPTS3zJPe3LHDotTJvdH',
		displayName: 'Libre',
		shortName: 'LIBRE',
		precision: 1,
		verified: true
	});

	var MIR = new Currency({
		id: 'HdPJha3Ekn1RUR2K9RrY7SG9xK1b21AHPwkL8pcwTmSZ',
		displayName: 'МИР',
		shortName: 'MIR',
		precision: 8,
		verified: true
	});

	function isCached(assetId) {
		return currencyCache.hasOwnProperty(assetId);
	}

	function invalidateCache() {
		currencyCache = {};

		currencyCache[WAVES.id] = WAVES;
		currencyCache[BTC.id] = BTC;
		currencyCache[USD.id] = USD;
		currencyCache[EUR.id] = EUR;
		currencyCache[DEIP.id] = DEIP;
		currencyCache[LIBRE.id] = LIBRE;
		currencyCache[MIR.id] = MIR;
	}

	invalidateCache();

	return {
		create: function (data) {
			// if currency data.id is not set - it's a temporary instance
			if (!_.has(data, 'id')) {
				return new Currency(data);
			}

			if (!currencyCache[data.id]) {
				currencyCache[data.id] = new Currency(data);
			}

			return currencyCache[data.id];
		},
		invalidateCache: invalidateCache,
		isCached: isCached,
		WAVES: WAVES,
		BTC: BTC,
		USD: USD,
		EUR: EUR,
		DEIP: DEIP,
		LIBRE: LIBRE,
		MIR: MIR
	};
})();

// set up decimal to format 0.00000001 as is instead of 1e-8
Decimal.config({toExpNeg: -(Currency.WAVES.precision + 1)});
