/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { el } from './dom.js'

const TERMINAL_INPUT_ID = 'terminalInput'

export const updateTerminalCommand = (params, signature) => {
    const propParams = [
        params.id && `--id '${params.id}'`,
        params.name && `--name '${params.name}'`,
    ].filter(Boolean) // Removes any falsy values

    el(TERMINAL_INPUT_ID).value = `firefox-container ${propParams.join(
        ' '
    )} --signature '${signature}' '${params.url}'`
}
