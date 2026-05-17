// Manual Validation Middleware
// Replaced express-validator to resolve "Module Not Found" crashes

exports.validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || name.trim() === '') {
        errors.push({ msg: 'Name is required' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push({ msg: 'Please provide a valid email address' });
    } else {
        req.body.email = email.toLowerCase().trim();
    }

    if (!password || password.length < 8) {
        errors.push({ msg: 'Password must be at least 8 characters long' });
    }

    req.validationErrors = errors;
    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push({ msg: 'Please provide a valid email address' });
    } else {
        req.body.email = email.toLowerCase().trim();
    }

    if (!password) {
        errors.push({ msg: 'Password is required' });
    }

    req.validationErrors = errors;
    next();
};
