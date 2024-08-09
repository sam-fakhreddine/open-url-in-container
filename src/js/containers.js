/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const defaultIcon = 'fingerprint'
const availableContainerColors = [
    'blue',
    'turquoise',
    'green',
    'yellow',
    'orange',
    'red',
    'pink',
    'purple',
]

function randomColor() {
    return availableContainerColors[
        Math.floor(Math.random() * availableContainerColors.length)
    ]
}

async function getContainerByName(name) {
    const containers = await browser.contextualIdentities.query({ name })

    return containers.length ? containers[0] : null
}

async function lookupContainer({ id, name }) {
    if (id) {
        return await browser.contextualIdentities.get(id)
    }

    if (name) {
        return await getContainerByName(name)
    }

    throw new Error(
        'Looking up container: neither id nor name is present in the params'
    )
}

function createContainer({ name, color, icon }) {
    return browser.contextualIdentities.create({
        name,
        color: color || randomColor(),
        icon: icon || defaultIcon,
    })
}

export async function prepareContainer({ id, name, color, icon }) {
    const container = await lookupContainer({ id, name })

    return container || createContainer({ name, color, icon })
}
