const fastify = require('fastify')({ logger: true });
const fs = require('fs');

const ALL_CHARITIES = [
    'Redcross', 'WWF', 'unicef', 'unesco'
];

let userData = {};
let globalDonationLog = [];

function shutdownHook() {
    fs.writeFileSync('users.json', JSON.stringify(userData));
    fs.writeFileSync('donations.json', JSON.stringify(globalDonationLog));

    process.exit();
}

function generateCPM() {
    return 0.3;
}

function findOrCreateUser(username) {
    if (userData[username] === undefined) {
        userData[username] = {
            charity: ALL_CHARITIES[0],
            donations: {}
        };
    }

    return userData[username];
}

function addFunds(user, value) {
    if (user.donations[user.charity] === undefined) {
        user.donations[user.charity] = value;
    } else {
        user.donations[user.charity] += value;
    }
}

fastify.get('/donations', async (request, reply) => {
    return { donations: globalDonationLog };
});

fastify.get('/stat', async (request, reply) => {
    if (request.query.user === undefined) {
        return { error: 'No user to query' };
    }

    const user = findOrCreateUser(request.query.user);

    return { user: user };
});

fastify.get('/ad', async (request, reply) => {
    const username = request.query.user;
    if (username === undefined) {
        return { error: 'No user to query' };
    }

    const user = findOrCreateUser(username);
    const cpm = generateCPM();
    addFunds(user, cpm);

    globalDonationLog.push([username, user.charity, cpm]);

    reply.code(200);
    reply.header('Content-Type', 'text/html');
    reply.type('text/html');

    return fs.readFileSync('ad.html').toString();
});

fastify.get('/charity', async (request, reply) => {
    if (request.query.user === undefined) {
        return { error: 'No user to query' };
    }

    const user = findOrCreateUser(request.query.user);
    user.charity = ALL_CHARITIES[request.query.id];

    return { status: 'OK' };
});

// Run the server!
const start = async () => {
    if (fs.existsSync('users.json')) {
        userData = JSON.parse(fs.readFileSync('users.json').toString());
    }

    if (fs.existsSync('donations.json')) {
        globalDonationLog = JSON.parse(fs.readFileSync('donations.json').toString());
    }

    process.on('SIGINT', function() {
        shutdownHook();
    });

    fastify.addHook('onClose', (instance, done) => {
        shutdownHook();
        done();
    });

    try {
        await fastify.listen(3000);
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();