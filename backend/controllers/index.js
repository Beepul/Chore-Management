class BaseController{

    handleAsync(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch((error) => {
                return this.sendError(res, error.message);
            });
        };
    }

    sendSuccess(res, data, message= "", statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data,
            message
        });
    }

    sendError(res, message, statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            message
        });
    }

    isAdmin(member) {
        return member && member.role === "admin";
    }

    // Polymorphic Method #1
    validateRequestBody(data, action = "") {
        throw new Error(`${this.constructor.name} must implement validateRequestBody()`);
    }
}

module.exports = BaseController;