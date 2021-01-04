const config = require('../config');
const wikimetaFactory = require('./fedwiki/wikimeta-factory');
const pagemetaFactory = require('./fedwiki/pagemeta-factory');

function renderRootOpml(wikimeta) {
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
            url: `${config.baseHref}${wikimeta.host}/${page.slug}.opml`
        });
    }

    return jstruct;
}

function asSlug(name) {
    return name.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase();
}


async function renderBlockOutline(host, page, block) {
    const neighbors = [host, ...page.neighbors];
    const match = block.text.match(new RegExp(`\\[\\[([^\\]]+)\\]\\]`));
    const jstruct = Object.assign({}, block, { wikitype: block.type });
    delete jstruct.type;

    if (match) {
        jstruct.relpath = asSlug(match[1]);

        console.log(jstruct.relpath);
        for (const neighbor of neighbors) {
            let wikimeta = await wikimetaFactory(neighbor);
            if (-1 < wikimeta.sitemap.findIndex(sitepage => sitepage.slug === jstruct.relpath)) {
                jstruct.type = 'include';
                jstruct.url = `${config.baseHref}${neighbor}/${jstruct.relpath}.opml`;
                break;
            }
        }
    }

    return jstruct;
}

async function renderPageOpml(host, page) {
    const jstruct = {
        head: {
            title: page.title
        },
        body: {
            subs: []
        }
    };

    for (const block of page.story) {
        jstruct.body.subs.push(await renderBlockOutline(host, page, block));
    }

    return jstruct;
}

async function renderOpml(wikiPath) {
    const [ host, path ] = wikiPath.split('/', 2);
    const wikimeta = await wikimetaFactory(host);

    if (path == null) {
        return renderRootOpml(wikimeta);
    }

    let page = await pagemetaFactory(wikimeta, path);

    return await renderPageOpml(host, page);

    // return page;
}

module.exports.fetch = renderOpml;
