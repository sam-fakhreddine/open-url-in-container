/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HEX_ENCODE_ARRAY = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
]

const HEX_DECODE_MAP = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    a: 0xa,
    b: 0xb,
    c: 0xc,
    d: 0xd,
    e: 0xe,
    f: 0xf,
}

export function hex2array(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string length')
    }

    const lHex = hex.toLowerCase()
    const arr = new Uint8Array(lHex.length / 2)

    for (let i = 0; i < lHex.length; i += 2) {
        const hi = HEX_DECODE_MAP[lHex[i]]
        const lo = HEX_DECODE_MAP[lHex[i + 1]]
        if (hi === undefined || lo === undefined) {
            throw new Error('Invalid character in hex string')
        }
        arr[i / 2] = hi << 4 | lo
    }

    return arr
}

export function array2hex(arr) {
    return Array.from(
        new Uint8Array(arr),
        (byte) => HEX_ENCODE_ARRAY[byte >>> 4] + HEX_ENCODE_ARRAY[byte & 0x0f]
    ).join('')
}
