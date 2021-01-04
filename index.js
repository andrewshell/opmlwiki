const config = require('./config');
const pureHttp = require('pure-http');
const cors = require('cors');
const fedwiki = require('./lib/fedwiki');
const xml2js = require('xml2js');

const app = pureHttp();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get('/*', async (req, res) => {
    const match = req.path.match(new RegExp('^/(.*)\\.(opml|json)$'))
    if (match == null) {
        return res.send('Not found', 404, { contentType: 'text/plain' });
    }

    const jstruct = await fedwiki.fetch(match[1], match[2]);

    if (req.query.format === 'data') {
        let url = new URL(config.baseHref);
        url.pathname = req.path;
        return res.json({
            url: `${url.toString()}`,
            ct: 1,
            when: new Date(),
            title: jstruct.title,
            description: '',
            socketserver: 'undefined'
        });
    }

    if (match[2] === 'opml') {
        return res.send(js2opml(jstruct), { contentType: 'text/xml' });
    }

    return res.json(jstruct);
});

app.listen(config.port);

function js2opml(jstruct) {
    const builder = new xml2js.Builder();

    let obj = {
        opml: {
            $: {
                "version": "2.0"
            },
            head: jstruct.head,
            body: {
                outline: []
            }
        }
    };

    addSubs(jstruct.body.subs, obj.opml.body.outline);

    return builder.buildObject(obj);
}

function addSubs(subs, outline) {
    for (let sub of subs) {
        let i = outline.length;
        outline.push({
            $: Object.assign({}, sub)
        });
        if (sub.subs != null) {
            delete outline[i].$.subs;
            outline[i].outline = [];
            addSubs(sub.subs, outline[i].outline);
        }
    }
}
