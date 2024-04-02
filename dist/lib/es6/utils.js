var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { decode } from '@gandlaf21/bolt11-decode';
import { encodeBase64ToJson, encodeJsonToBase64 } from './base64.js';
import { TOKEN_PREFIX, TOKEN_VERSION } from './utils/Constants.js';
import { bytesToHex } from '@noble/curves/abstract/utils';
import { sha256 } from '@noble/hashes/sha256';
function splitAmount(value, amountPreference) {
    var chunks = [];
    if (amountPreference) {
        chunks.push.apply(chunks, getPreference(value, amountPreference));
        value =
            value -
                chunks.reduce(function (curr, acc) {
                    return curr + acc;
                }, 0);
    }
    for (var i = 0; i < 32; i++) {
        var mask = 1 << i;
        if ((value & mask) !== 0) {
            chunks.push(Math.pow(2, i));
        }
    }
    return chunks;
}
function isPowerOfTwo(number) {
    return number && !(number & (number - 1));
}
function getPreference(amount, preferredAmounts) {
    var chunks = [];
    var accumulator = 0;
    preferredAmounts.forEach(function (pa) {
        if (!isPowerOfTwo(pa.amount)) {
            throw new Error('Provided amount preferences contain non-power-of-2 numbers. Use only ^2 numbers');
        }
        for (var i = 1; i <= pa.count; i++) {
            accumulator += pa.amount;
            if (accumulator > amount) {
                return;
            }
            chunks.push(pa.amount);
        }
    });
    return chunks;
}
function getDefaultAmountPreference(amount) {
    var amounts = splitAmount(amount);
    return amounts.map(function (a) {
        return { amount: a, count: 1 };
    });
}
function bytesToNumber(bytes) {
    return hexToNumber(bytesToHex(bytes));
}
function hexToNumber(hex) {
    return BigInt("0x".concat(hex));
}
//used for json serialization
function bigIntStringify(_key, value) {
    return typeof value === 'bigint' ? value.toString() : value;
}
/**
 * Helper function to encode a v3 cashu token
 * @param token
 * @returns
 */
function getEncodedToken(token) {
    return TOKEN_PREFIX + TOKEN_VERSION + encodeJsonToBase64(token);
}
/**
 * Helper function to decode cashu tokens into object
 * @param token an encoded cashu token (cashuAey...)
 * @returns cashu token object
 */
function getDecodedToken(token) {
    // remove prefixes
    var uriPrefixes = ['web+cashu://', 'cashu://', 'cashu:', 'cashuA'];
    uriPrefixes.forEach(function (prefix) {
        if (!token.startsWith(prefix)) {
            return;
        }
        token = token.slice(prefix.length);
    });
    return handleTokens(token);
}
/**
 * @param token
 * @returns
 */
function handleTokens(token) {
    var _a, _b;
    var obj = encodeBase64ToJson(token);
    // check if v3
    if ('token' in obj) {
        return obj;
    }
    // check if v1
    if (Array.isArray(obj)) {
        return { token: [{ proofs: obj, mint: '' }] };
    }
    // if v2 token return v3 format
    return { token: [{ proofs: obj.proofs, mint: (_b = (_a = obj === null || obj === void 0 ? void 0 : obj.mints[0]) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : '' }] };
}
/**
 * Returns the keyset id of a set of keys
 * @param keys keys object to derive keyset id from
 * @returns
 */
export function deriveKeysetId(keys) {
    var pubkeysConcat = Object.entries(keys)
        .sort(function (a, b) { return +a[0] - +b[0]; })
        .map(function (_a) {
        var pubKey = _a[1];
        return pubKey;
    })
        .join('');
    var hash = sha256(new TextEncoder().encode(pubkeysConcat));
    var hashHex = bytesToHex(hash);
    return '00' + hashHex.slice(0, 14);
}
/**
 * merge proofs from same mint,
 * removes TokenEntrys with no proofs or no mint field
 * and sorts proofs by id
 *
 * @export
 * @param {Token} token
 * @return {*}  {Token}
 */
export function cleanToken(token) {
    var _a;
    var _b;
    var tokenEntryMap = {};
    for (var _i = 0, _c = token.token; _i < _c.length; _i++) {
        var tokenEntry = _c[_i];
        if (!((_b = tokenEntry === null || tokenEntry === void 0 ? void 0 : tokenEntry.proofs) === null || _b === void 0 ? void 0 : _b.length) || !(tokenEntry === null || tokenEntry === void 0 ? void 0 : tokenEntry.mint)) {
            continue;
        }
        if (tokenEntryMap[tokenEntry.mint]) {
            (_a = tokenEntryMap[tokenEntry.mint].proofs).push.apply(_a, __spreadArray([], tokenEntry.proofs, true));
            continue;
        }
        tokenEntryMap[tokenEntry.mint] = {
            mint: tokenEntry.mint,
            proofs: __spreadArray([], tokenEntry.proofs, true)
        };
    }
    return {
        memo: token === null || token === void 0 ? void 0 : token.memo,
        token: Object.values(tokenEntryMap).map(function (x) { return (__assign(__assign({}, x), { proofs: sortProofsById(x.proofs) })); })
    };
}
export function sortProofsById(proofs) {
    return proofs.sort(function (a, b) { return a.id.localeCompare(b.id); });
}
export function isObj(v) {
    return typeof v === 'object';
}
export function checkResponse(data) {
    if (!isObj(data))
        return;
    if ('error' in data && data.error) {
        throw new Error(data.error);
    }
    if ('detail' in data && data.detail) {
        throw new Error(data.detail);
    }
}
export function joinUrls() {
    var parts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parts[_i] = arguments[_i];
    }
    return parts.map(function (part) { return part.replace(/(^\/+|\/+$)/g, ''); }).join('/');
}
export function decodeInvoice(bolt11Invoice) {
    var invoiceData = {};
    var decodeResult = decode(bolt11Invoice);
    invoiceData.paymentRequest = decodeResult.paymentRequest;
    for (var i = 0; i < decodeResult.sections.length; i++) {
        var decodedSection = decodeResult.sections[i];
        if (decodedSection.name === 'amount') {
            invoiceData.amountInSats = Number(decodedSection.value) / 1000;
            invoiceData.amountInMSats = Number(decodedSection.value);
        }
        if (decodedSection.name === 'timestamp') {
            invoiceData.timestamp = decodedSection.value;
        }
        if (decodedSection.name === 'description') {
            invoiceData.memo = decodedSection.value;
        }
        if (decodedSection.name === 'expiry') {
            invoiceData.expiry = decodedSection.value;
        }
        if (decodedSection.name === 'payment_hash') {
            invoiceData.paymentHash = decodedSection.value.toString('hex');
        }
    }
    return invoiceData;
}
export { bigIntStringify, bytesToNumber, getDecodedToken, getEncodedToken, hexToNumber, splitAmount, getDefaultAmountPreference };
//# sourceMappingURL=utils.js.map