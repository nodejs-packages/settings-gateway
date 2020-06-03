/**
 * Returns an object created by key-value entries for properties and methods
 * @param entries An iterable object that contains key-value entries for properties and methods.
 */
function ObjectFromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>): { [k in PropertyKey]: T };
/**
 * Returns an object created by key-value entries for properties and methods
 * @param entries An iterable object that contains key-value entries for properties and methods.
 */
function ObjectFromEntries(entries: Iterable<readonly unknown[]>): any;
/* istanbul ignore next: Polyfill, only used in Node.js versions older than 12.4.0 */
function ObjectFromEntries(entries: Iterable<readonly unknown[]>): unknown {
	const obj = {};

	for (const pair of entries) {
		if (Object(pair) !== pair) {
			throw new TypeError('iterable for fromEntries should yield objects');
		}

		const { 0: key, 1: val } = pair;

		Object.defineProperty(obj, key as PropertyKey, {
			configurable: true,
			enumerable: true,
			writable: true,
			value: val
		});
	}

	return obj;
}

/* istanbul ignore next: Polyfill, first branch is used in Node.js 12.4.0 and newer, the other by older versions */
export const fromEntries = typeof Object.fromEntries === 'function' ? Object.fromEntries : ObjectFromEntries;
