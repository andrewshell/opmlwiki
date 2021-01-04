const fetch = require('node-fetch');

function fetchJson(scheme, host, path) {
    const url = `${scheme}://${host}${path}`;
    console.log(url);
    return fetch(url).then(res => res.json());
}

async function pagemetaFactory(wikimeta, slug) {
    const page = await fetchJson(wikimeta.https ? 'https' : 'http', wikimeta.host, `/${slug}.json`);

    page.slug = slug;
    page.neighbors = [...wikimeta.seedNeighbors];

    for (const action of page.journal) {
        if (action.type === 'fork' && action.site != null && -1 === page.neighbors.indexOf(action.site)) {
            page.neighbors.unshift(action.site);
        }
    }

    for (const block of page.story) {
        if (block.type === 'reference' && block.site != null && -1 === page.neighbors.indexOf(block.site)) {
            page.neighbors.unshift(block.site);
        }
    }

    return page;
}

module.exports = pagemetaFactory;
