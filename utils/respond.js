function isBrowser(req)
{
    return req.headers.accept && req.headers.accept.includes('text/html');
}

// handle error statuses and pages
function respondOrRedirect(req, res, statusCode, message) {
    // send json for api req (tests) and serve html for clients
    if (isBrowser(req)) {
        const errorUrl = new URL('/error.html', `${req.protocol}://${req.get('host')}`);
        errorUrl.searchParams.set('error', message);
        return res.redirect(errorUrl.toString());
    } else {
        return res.status(statusCode).json({ error: message });
    }
}

module.exports = { isBrowser, respondOrRedirect };
