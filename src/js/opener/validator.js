/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function sanitizeURLSearchParams(qs, schema) {
    const params = {}

    // Validate each key from the schema, except the '__validators' one
    for (const k of Object.keys(schema)) {
        if (k === '__validators') continue

        // Apply each validator
        let param = qs.get(k)
        for (const v of schema[k]) {
            param = v(param, k)
        }

        // Skip empty params
        if (isEmpty(param)) continue

        params[k] = param
    }

    // Apply global validators
    for (const v of schema.__validators || []) {
        Object.assign(params, v(params))
    }

    return params
}

const isEmpty = (v) => v === null || v === undefined || v === ''

export function url(p) {
    if (isEmpty(p)) return p

    try {
        return new URL(p).toString()
    } catch {
    // Try adding 'https://' prefix and try again
        const prefixedUrl = `https://${p}`
        try {
            return new URL(prefixedUrl).toString()
        } catch (e) {
            throw new Error(e.message)
        }
    }
}

export function required(p, name) {
    if (isEmpty(p)) {
        throw new Error(`"${name}" parameter is missing`)
    }
    return p
}

export function integer(p, name) {
    if (isEmpty(p)) return p

    if (!/^[-+]?(\d+|Infinity)$/.test(p)) {
        throw new Error(`"${name}" parameter should be an integer`)
    }

    return Number(p)
}

export function boolean(p, name) {
    if (isEmpty(p)) return p

    const truthyValues = ['true', 'yes', 'on', '1']
    const falsyValues = ['false', 'no', 'off', '0']

    const normalized = p.toLowerCase()

    if (truthyValues.includes(normalized)) return true
    if (falsyValues.includes(normalized)) return false

    throw new Error(
        `"${name}" parameter should be a boolean (true/false, yes/no, on/off, 1/0)`
    )
}

export function fallback(val) {
    return (p) => isEmpty(p) ? val : p
}

export function oneOf(vals) {
    return (p, name) => {
        if (!vals.includes(p)) {
            throw new Error(
                `"${name}" parameter should be one of ${vals.join(', ')}`
            )
        }
        return p
    }
}

export function oneOfOrEmpty(vals) {
    const validator = oneOf(vals)
    return (p, name) => isEmpty(p) ? p : validator(p, name)
}

export function atLeastOneRequired(requiredParams) {
    return (params) => {
        const isValid = requiredParams.some((p) => !isEmpty(params[p]))

        if (!isValid) {
            throw new Error(
                `At least one of "${requiredParams.join('", "')}" should be specified`
            )
        }

        return params
    }
}
