/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { el } from './dom.js'

const LINK_ELEMENT = 'linkElement'
const LINK_ICON = 'linkIcon'
const LINK_TITLE = 'linkTitle'
const BOOKMARK_BUTTON = 'bookmarkButton'

const escapeHTML = (text) => {
    const div = document.createElement('div')
    div.innerText = text
    return div.innerHTML
}

const bookmarkUrl = (tab, qs) => {
    const url = `ext+container:${qs.toString()}`
    if (!tab.favIconUrl) {
        return url
    }

    const dataUrlMatch = tab.favIconUrl.match(/data:(.+)[;,]/)
    const favIconType = dataUrlMatch ? dataUrlMatch[1] : ''

    const bookmarkBody = `
         <html>
             <head>
                 <title>${escapeHTML(tab.title)}</title>
                 <link rel="icon" type="${favIconType}" href="${
    tab.favIconUrl
}">
                 <meta http-equiv="refresh" content="0; url=${url}">
             </head>
         </html>
     `
    return `data:text/html;charset=UTF8,${encodeURIComponent(bookmarkBody)}`
}

const refreshBookmarks = async (url, title) => {
    try {
        const bookmarks = await browser.bookmarks.search({ title })
        const existingBookmarks = bookmarks.filter(
            (b) => b.parentId === 'unfiled_____' && b.url === url
        )

        if (existingBookmarks.length > 0) {
            el(BOOKMARK_BUTTON).classList.add('exists')
        } else {
            el(BOOKMARK_BUTTON).classList.remove('exists')
        }

        return existingBookmarks
    } catch (error) {
        console.error('Error refreshing bookmarks:', error)
        return [] // Ensure a return value even in case of an error
    }
}

const toggleBookmark = async (url, title) => {
    try {
        const bookmarksFound = await refreshBookmarks(url, title)

        if (bookmarksFound.length === 0) {
            await browser.bookmarks.create({ title, url })
        } else {
            const removalPromises = bookmarksFound.map((bookmark) =>
                browser.bookmarks.remove(bookmark.id)
            )
            await Promise.all(removalPromises)
        }

        await refreshBookmarks(url, title)
    } catch (error) {
        console.error('Error toggling bookmark:', error)
    }
}

export const updateBookmarkLink = (tab, qs, containerName) => {
    const url = bookmarkUrl(tab, qs)
    const title = `[${containerName}] ${tab.title}`

    el(LINK_ELEMENT).href = url
    el(LINK_ICON).style.backgroundImage = `url(${tab.favIconUrl})`
    el(LINK_TITLE).textContent = tab.title

    el(LINK_ELEMENT).onclick = (e) => {
        e.preventDefault()
        toggleBookmark(url, title)
    }

    el(LINK_ELEMENT).onmouseenter = (e) => e.target.classList.add('hovered')
    el(LINK_ELEMENT).onmouseleave = (e) => e.target.classList.remove('hovered')
    el(LINK_ELEMENT).ondragstart = (e) => {
        e.target.classList.remove('hovered')
        e.target.classList.add('dragged')
    }
    el(LINK_ELEMENT).ondragend = (e) => e.target.classList.remove('dragged')

    refreshBookmarks(url, title)

    el(BOOKMARK_BUTTON).onclick = (e) => {
        e.preventDefault()
        toggleBookmark(url, title)
    }
}
