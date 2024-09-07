exports.successResponse = (status, error, message, result) =>{
    return { status, error, message, result };
};

exports.errorResponse = (status, error, message) =>{
    return { status: status ? status: 500, error, message };
};