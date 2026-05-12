class BaseController{
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
}

module.exports = BaseController;