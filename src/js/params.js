/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { generateSignature, verifySignature } from './security/signature.js'

export class SignatureError extends Error {}

export class OpenerParameters {
    constructor({ id, name, color, icon, url, index, pinned, openInReaderMode }) {
        this._data = {
            // container properties
            id,
            name,
            color,
            icon,

            // tab properties
            url,
            index,
            pinned,
            openInReaderMode,
        }
    }

    // container properties
    get id() {
        return this._data.id
    }
    get name() {
        return this._data.name
    }
    get color() {
        return this._data.color
    }
    get icon() {
        return this._data.icon
    }

    // tab properties
    get url() {
        return this._data.url
    }
    get index() {
        return this._data.index
    }
    get pinned() {
        return this._data.pinned
    }
    get openInReaderMode() {
        return this._data.openInReaderMode
    }

    toQueryString() {
        const qs = new URLSearchParams()

        Object.keys(this._data).forEach((key) => {
            if (this._data[key]) {
                qs.set(key, this._data[key])
            }
        })

        return qs
    }

    async sign(key) {
        const qs = this.toQueryString()
        const signature = await generateSignature(key, qs.toString())
        qs.set('signature', signature)

        return {
            queryString: qs,
            signature,
        }
    }

    async verify(key, signature) {
        const qs = this.toQueryString()

        if (!await verifySignature(key, signature, qs.toString())) {
            throw new SignatureError('signature invalid')
        }
    }
}

export class SignedQueryString extends URLSearchParams {
    set signature(signature) {
        this.set('signature', signature)
    }

    get signature() {
        return this.get('signature')
    }
}
