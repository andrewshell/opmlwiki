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

    const jstruct = await fedwiki.fetch(match[1]);

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

    for (let sub of jstruct.body.subs) {
        obj.opml.body.outline.push({
            $: sub
        });
    }

    return builder.buildObject(obj);
}
