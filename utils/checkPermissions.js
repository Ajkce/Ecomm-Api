const CustomError = require('../errors');

const checkPermissions = (requestUser, resourceUserId) => {
    console.log(resourceUserId);
    if(requestUser.role === 'admin') return;
    if(requestUser.userId === resourceUserId.toString()) return
    
    throw new CustomError.UnAuthorisedError("Not authorised to access this route");

}

module.exports = checkPermissions;