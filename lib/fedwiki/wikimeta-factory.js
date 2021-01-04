const fetch = require('node-fetch');
const wikimeta = {};

function fetchJson(scheme, host, path) {
    const url = `${scheme}://${host}${path}`;
    console.log(url);
    return fetch(url).then(res => res.json());
}

function fetchSeedNeighbors(scheme, host) {
    const url = `${scheme}://${host}/`;
    console.log(url);
    return fetch(url)
        .then(res => res.text())
        .then(text => text.match(new RegExp(`var seedNeighbors = '([^']*)';`)))
        .then(match => match[1].split(',').filter(neighbor => neighbor.length > 0 && neighbor !== host));
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

    return wikimeta[host];
}

module.exports = wikimetaFactory;
