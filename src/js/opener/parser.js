/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
    sanitizeURLSearchParams,
    required,
    url,
    integer,
    boolean,
    atLeastOneRequired,
    oneOfOrEmpty,
} from './validator.js'

const CUSTOM_PROTOCOL_PREFIX = 'ext+container:'

const ALLOWED_CONTAINER_COLORS = new Set([
    'blue',
    'turquoise',
    'green',
    'yellow',
    'orange',
    'red',
    'pink',
    'purple',
])

const ALLOWED_CONTAINER_ICONS = new Set([
    'fingerprint',
    'briefcase',
    'dollar',
    'cart',
    'circle',
    'gift',
    'vacation',
    'food',
    'fruit',
    'pet',
    'tree',
    'chill',
])

const openerParamsSchema = {
    // signature
    signature: [],

    // container params
    id: [],
    name: [],
    color: [oneOfOrEmpty(Array.from(ALLOWED_CONTAINER_COLORS))],
    icon: [oneOfOrEmpty(Array.from(ALLOWED_CONTAINER_ICONS))],

    // url params
    url: [required, url],
    index: [integer],
    pinned: [boolean],
    openInReaderMode: [boolean],

    // global validators
    __validators: [atLeastOneRequired(['id', 'name'])],
}

export function parseOpenerParams(rawHash) {
    if (!rawHash.startsWith('#')) {
        throw new Error('Not a valid location hash')
    }

    const uri = decodeURIComponent(rawHash.slice(1))

    if (!uri.startsWith(CUSTOM_PROTOCOL_PREFIX)) {
        throw new Error('Unknown URI protocol')
    }

    const qs = new URLSearchParams(uri.slice(CUSTOM_PROTOCOL_PREFIX.length))

    return sanitizeURLSearchParams(qs, openerParamsSchema)
}
