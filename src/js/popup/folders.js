/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { saveState, restoreState, POPUP_FOLDER_STATE } from '../config.js'
import { State } from './state.js'
import { el } from './dom.js'

const updateFolderFoldingState = ({ newState, update }) => {
    saveState(POPUP_FOLDER_STATE, newState)

    Object.keys(update).forEach((id) => {
        if (newState[id]) {
            el(id).classList.remove('folded')
        } else {
            el(id).classList.add('folded')
        }
    })
}

const setupFolderFoldingListeners = (s) => {
    const folderIds = Object.keys(s.state())
    folderIds.forEach((folderId) => {
        el(folderId).querySelector('.title').onclick = () => {
            const state = s.state()
            s.update({
                [folderId]: !state[folderId],
            })
        }
    })
}

export const setupFolderFolding = async () => {
    // Initial folder state
    const initialState = {
        containerFolder: true,
        bookmarkFolder: true,
        urlFolder: false,
        terminalFolder: false,
        signatureFolder: false,
    }

    // Restore saved folder state
    const folderState = {
        ...initialState,
        ...await restoreState(POPUP_FOLDER_STATE, initialState),
    }

    updateFolderFoldingState({
        newState: folderState,
        update: folderState,
    })

    // Set up folder folding listeners
    setupFolderFoldingListeners(new State(folderState, updateFolderFoldingState))
}
