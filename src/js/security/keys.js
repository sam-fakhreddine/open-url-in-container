/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hex2array, array2hex } from './hex.js'

async function exportKey(key) {
    const rawKey = await window.crypto.subtle.exportKey('raw', key)
    return array2hex(rawKey)
}

export async function importKey(rawHexKey) {
    const rawKey = hex2array(rawHexKey)
    const key = await window.crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        true,
        ['sign', 'verify']
    )
    return key
}


export async function generateKey() {
    const key = await window.crypto.subtle.generateKey(
        { name: 'HMAC', hash: { name: 'SHA-256' }, length: 256 },
        true,
        ['sign', 'verify']
    )
    return exportKey(key)
}
