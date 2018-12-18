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


var Money = function(amount, currency) {
	var DECIMAL_SEPARATOR = '.';
	var THOUSANDS_SEPARATOR = ',';

	if (amount === undefined)
		throw Error('Amount is required');

	if (currency === undefined)
		throw Error('Currency is required');

	this.amount = new Decimal(amount)
		.toDecimalPlaces(currency.precision, Decimal.ROUND_FLOOR);
	this.currency = currency;

	var integerPart = function (value) {
		return value.trunc();
	};

	var fractionPart = function (value) {
		return value.minus(integerPart(value));
	};

	var format = function (value) {
		return value.toFixed(currency.precision, currency.roundingMode);
	};

	var validateCurrency = function (expected, actual) {
		if (expected.id !== actual.id)
			throw new Error('Currencies must be the same for operands. Expected: ' +
				expected.displayName + '; Actual: ' + actual.displayName);
	};

	var fromTokensToCoins = function (valueInTokens, currencyPrecision) {
		return valueInTokens.mul(Math.pow(10, currencyPrecision)).trunc();
	};

	var fromCoinsToTokens = function (valueInCoins, currencyPrecision) {
		return valueInCoins.trunc().div(Math.pow(10, currencyPrecision));
	};

	// in 2016 Safari doesn't support toLocaleString()
	// that's why we need this method
	var formatWithThousandsSeparator = function (formattedAmount) {
		var parts = formattedAmount.split(DECIMAL_SEPARATOR);
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);

		return parts.join(DECIMAL_SEPARATOR);
	};

	this.formatAmount = function (stripZeroes, useThousandsSeparator) {
		var result = stripZeroes ?
			this.toTokens().toFixed(this.amount.decimalPlaces()) :
			format(this.amount);

		return useThousandsSeparator ? formatWithThousandsSeparator(result) : result;
	};

	this.formatIntegerPart = function () {
		return integerPart(this.amount).toFixed(0);
	};

	this.formatFractionPart = function () {
		var valueWithLeadingZero = format(fractionPart(this.amount));

		return valueWithLeadingZero.slice(1); // stripping the leading zero
	};

	this.toTokens = function () {
		var result = fromCoinsToTokens(fromTokensToCoins(this.amount, this.currency.precision),
			this.currency.precision);

		return result.toNumber();
	};

	this.toCoins = function () {
		return fromTokensToCoins(this.amount, this.currency.precision).toNumber();
	};

	this.plus = function (money) {
		validateCurrency(this.currency, money.currency);

		return new Money(this.amount.plus(money.amount), this.currency);
	};

	this.minus = function (money) {
		validateCurrency(this.currency, money.currency);

		return new Money(this.amount.minus(money.amount), this.currency);
	};

	this.greaterThan = function (other) {
		validateCurrency(this.currency, other.currency);

		return this.amount.greaterThan(other.amount);
	};

	this.greaterThanOrEqualTo = function (other) {
		validateCurrency(this.currency, other.currency);

		return this.amount.greaterThanOrEqualTo(other.amount);
	};

	this.lessThan = function (other) {
		validateCurrency(this.currency, other.currency);

		return this.amount.lessThan(other.amount);
	};

	this.lessThanOrEqualTo = function (other) {
		validateCurrency(this.currency, other.currency);

		return this.amount.lessThanOrEqualTo(other.amount);
	};

	this.multiply = function (multiplier) {
		if (!_.isNumber(multiplier))
			throw new Error('Number is expected');

		if (isNaN(multiplier))
			throw new Error('Multiplication by NaN is not supported');

		return new Money(this.amount.mul(multiplier), this.currency);
	};

	this.toString = function () {
		return this.formatAmount(false, true) + ' ' + this.currency.toString();
	};

	return this;
};

Money.fromTokens = function (amount, currency) {
	return new Money(amount, currency);
};

Money.fromCoins = function (amount, currency) {
	currency = currency || {};
	if (currency.precision === undefined)
		throw new Error('A valid currency must be provided');

	amount = new Decimal(amount);
	amount = amount.div(Math.pow(10, currency.precision));

	return new Money(amount, currency);
};
