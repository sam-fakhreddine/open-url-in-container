/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export async function newTab(container, params) {
    try {
        const browserInfo = await browser.runtime.getBrowserInfo()
        const currentTab = await browser.tabs.getCurrent()

        const createTabParams = {
            cookieStoreId: container.cookieStoreId,
            url: params.url,
            index: params.index ?? currentTab.index + 1,
            pinned: params.pinned,
            ...browserInfo.version >= 58 && {
                openInReaderMode: params.openInReaderMode,
            },
        }

        await browser.tabs.create(createTabParams)
        await browser.tabs.remove(currentTab.id)
    } catch (e) {
        throw new Error(`creating new tab: ${e}`)
    }
}

export async function closeCurrentTab() {
    try {
        const currentTab = await browser.tabs.getCurrent()
        await browser.tabs.remove(currentTab.id)
    } catch (e) {
        throw new Error(`closing current tab: ${e}`)
    }
}

export async function getActiveTab() {
    try {
        const activeTabs = await browser.tabs.query({
            active: true,
            windowId: browser.windows.WINDOW_ID_CURRENT,
        })
        return activeTabs[0]
    } catch (e) {
        throw new Error(`getting active tab: ${e}`)
    }
}
