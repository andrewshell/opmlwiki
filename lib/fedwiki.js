const config = require('../config');
const wikimetaFactory = require('./fedwiki/wikimeta-factory');
const pagemetaFactory = require('./fedwiki/pagemeta-factory');

function renderRootOpml(wikimeta, extension) {
    const jstruct = {
        head: {
            title: wikimeta.host
        },
        body: {
            subs: []
        }
    };

    for (const page of wikimeta.sitemap) {
        jstruct.body.subs.push({
            text: page.title,
            relpath: page.slug,
            type: 'include',
            url: `${config.baseHref}${wikimeta.host}/${page.slug}.${extension}`
        });
    }

    return jstruct;
}

function asSlug(name) {
    return name.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase();
}


async function renderBlockOutline(host, page, block, extension) {
    const neighbors = [host, ...page.neighbors];
    const matches = block.text.matchAll(new RegExp(`\\[\\[([^\\]]+)\\]\\]`, 'g'));
    const jstruct = Object.assign({}, block);

    for (const match of matches) {
        console.log(match[0]);

        let sub = {
            text: match[0],
            slug: asSlug(match[1])
        };

        for (const neighbor of neighbors) {
            let wikimeta = await wikimetaFactory(neighbor);
            if (-1 < wikimeta.sitemap.findIndex(sitepage => sitepage.slug === sub.slug)) {
                sub.type = 'include';
                sub.url = `${config.baseHref}${neighbor}/${sub.slug}.${extension}`;
                break;
            }
        }

        if (sub.type === 'include') {
            if (jstruct.subs == null) {
                jstruct.subs = [];
            }
            jstruct.subs.push(sub);
        }
    }

    return jstruct;
}

async function renderPageOpml(host, page, extension) {
    const jstruct = {
        head: {
            title: page.title
        },
        body: {
            subs: []
        }
    };

    for (const block of page.story) {
        jstruct.body.subs.push(await renderBlockOutline(host, page, block, extension));
    }

    return jstruct;
}

async function renderOpml(wikiPath, extension) {
    const [ host, path ] = wikiPath.split('/', 2);
    const wikimeta = await wikimetaFactory(host);

    if (path == null) {
        return renderRootOpml(wikimeta, extension);
    }

    let page = await pagemetaFactory(wikimeta, path);

    return await renderPageOpml(host, page, extension);

    // return page;
}

module.exports.fetch = renderOpml;
