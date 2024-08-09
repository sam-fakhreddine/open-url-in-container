/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
    getSigningKey,
    saveState,
    restoreState,
    CONTAINER_SELECTOR_STATE,
} from '../config.js'

import { getActiveTab } from '../tabs.js'
import { OpenerParameters } from '../params.js'

import { State } from './state.js'
import { hide, show } from './dom.js'

import { updateBookmarkLink } from './bookmark.js'
import { updateURL } from './url.js'
import { updateTerminalCommand } from './terminal.js'
import { updateSignatureCommand } from './signature.js'
import { setupFolderFolding } from './folders.js'
import {
    updateContainerSelector,
    updateContainerOptions,
    setupContainerSelector,
} from './containers.js'

const getHostname = (url) => new URL(url).hostname

const updateLinks = async (containers, containerState) => {
    const selectedContainer = containers.find(
        (c) => c.cookieStoreId === containerState.selectedContainerId
    )
    const tab = await getActiveTab()

    const containerProps = containerState.useHostnameForContainerName
        ? { name: getHostname(tab.url) }
        : {
            id: containerState.useContainerId
                ? selectedContainer.cookieStoreId
                : null,
            name: containerState.useContainerName ? selectedContainer.name : null,
        }

    const params = new OpenerParameters({
        url: tab.url,
        ...containerProps,
    })

    const { queryString, signature } = await params.sign(await getSigningKey())

    updateBookmarkLink(
        tab,
        queryString,
        containerProps.name || selectedContainer.name
    )
    updateURL(queryString)
    updateTerminalCommand(params, signature)
    updateSignatureCommand(signature)
}

const main = async () => {
    // Get containers
    const containers = await browser.contextualIdentities.query({})

    const restoredContainerState = await restoreState(CONTAINER_SELECTOR_STATE, {
        selectedContainerId: null,
        useContainerId: false,
        useContainerName: true,
        useHostnameForContainerName: false,
    })

    const initialContainerState = {
        ...restoredContainerState,
        selectedContainerId: containers.find(
            (c) => c.cookieStoreId === restoredContainerState.selectedContainerId
        )
            ? restoredContainerState.selectedContainerId
            : containers[0].cookieStoreId,
    }

    // Create container state manager
    const containerStateManager = new State(
        initialContainerState,
        ({ newState }) => {
            updateLinks(containers, newState)
            updateContainerOptions(newState)
            saveState(CONTAINER_SELECTOR_STATE, newState)
        }
    )

    // Update container select & links & commands
    updateContainerSelector(containers, initialContainerState)
    updateLinks(containers, initialContainerState)

    // Setup container selector
    setupContainerSelector(containers, containerStateManager)

    // Setup folders & display the UI
    setupFolderFolding()

    hide('loader')
    show('mainContainer')
}

main()
