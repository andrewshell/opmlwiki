const fetch = require('node-fetch');
const wikimeta = {};

function fetchJson(scheme, host, path) {
    const url = `${scheme}://${host}${path}`;
    console.log(url);
    return fetch(url, {
        follow: 3,
        timeout: 500
    }).then(res => res.json());
}

async function wikimetaFactory(host) {
    if (wikimeta[host]) {
        return wikimeta[host];
    }

    try {
        wikimeta[host] = {
            https: false,
            host: host,
            sitemap: await fetchJson('http', host, '/system/sitemap.json'),
            seedNeighbors: []
        };
    } catch (err) {
        console.error(err);
    }

    if (wikimeta[host] == null) {
        try {
            wikimeta[host] = {
                https: true,
                sitemap: await fetchJson('https', host, '/system/sitemap.json'),
                seedNeighbors: []
            };
        } catch (err) {
            console.error(err);
        }
    }

    if (wikimeta[host] == null) {
        throw new Error(`Cannot get sitemap for ${host}`);
    }

    return wikimeta[host];
}

module.exports = wikimetaFactory;
