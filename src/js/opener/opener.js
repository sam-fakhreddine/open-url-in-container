/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSigningKey } from '../config.js'
import { prepareContainer } from '../containers.js'
import { newTab, closeCurrentTab } from '../tabs.js'
import { SignatureError, OpenerParameters } from '../params.js'
import { parseOpenerParams } from './parser.js'

const error = (e) => {
    console.error(e)
    document.getElementById('internalErrorBody').textContent = e
    document.getElementById('internalErrorContainer').classList.remove('hidden')
}

const openTabInContainer = async (params) => {
    await newTab(await prepareContainer(params), params)
}

const requestConfirmation = (params) => {
    document.getElementById('securityConfirmationContainerName').textContent =
    params.name
    document.getElementById('securityConfirmationUrl').textContent = params.url
    document
        .getElementById('securityConfirmationContainer')
        .classList.remove('hidden')

    document.getElementById('securityConfirmationConfirm').onclick = () => {
        openTabInContainer(params)
    }

    document.getElementById('securityConfirmationGoBack').onclick = async () => {
        if (window.history.length > 1) {
            window.history.back()
        } else {
            await closeCurrentTab()
        }
    }
}

const main = async () => {
    try {
    // Get extension parameters
        const parsedParams = parseOpenerParams(window.location.hash)
        const openerParams = new OpenerParameters(parsedParams)

        // Verify input signature to prevent clickjacking
        try {
            await openerParams.verify(await getSigningKey(), parsedParams.signature)
        } catch (e) {
            if (e instanceof SignatureError) {
                // Require user confirmation if signature verification failed
                requestConfirmation(openerParams)
                return
            }
            throw e
        }

        // Finally, open a new tab
        openTabInContainer(openerParams)
    } catch (e) {
        error(e)
    }
}

main()
