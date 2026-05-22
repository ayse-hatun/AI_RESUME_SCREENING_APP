require('dotenv').config({ override: true });

const dns = require('dns');
// Force Node.js to prefer IPv4 DNS resolution globally
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
// Disable resolving IPv6 AAAA records to bypass ENETUNREACH on IPv4-only networks (like Railway)
dns.resolve6 = function(hostname, options, callback) {
    const cb = typeof options === 'function' ? options : callback;
    if (typeof cb === 'function') {
        cb(new Error('IPv6 resolution disabled'));
    } else {
        return Promise.reject(new Error('IPv6 resolution disabled'));
    }
};
if (dns.promises && dns.promises.resolve6) {
    dns.promises.resolve6 = function() {
        return Promise.reject(new Error('IPv6 resolution disabled'));
    };
}
const originalResolve = dns.resolve;
dns.resolve = function(hostname, rrtype, callback) {
    let type = rrtype;
    let cb = callback;
    if (typeof rrtype === 'function') {
        cb = rrtype;
        type = 'A';
    }
    if (type === 'AAAA') {
        if (typeof cb === 'function') {
            cb(new Error('IPv6 resolution disabled'));
            return;
        }
        return Promise.reject(new Error('IPv6 resolution disabled'));
    }
    return originalResolve.apply(this, arguments);
};
if (dns.promises && dns.promises.resolve) {
    const originalPromisesResolve = dns.promises.resolve;
    dns.promises.resolve = function(hostname, rrtype) {
        if (rrtype === 'AAAA') {
            return Promise.reject(new Error('IPv6 resolution disabled'));
        }
        return originalPromisesResolve.apply(this, arguments);
    };
}

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    console.error('The application cannot start without a secure JWT secret.');
    process.exit(1);
}

const app = require('./app');
const connectDB = require('./DB/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
    console.error('🔥 UNHANDLED REJECTION! Shutting down...', err.name, err.message);
    process.exit(1);
});