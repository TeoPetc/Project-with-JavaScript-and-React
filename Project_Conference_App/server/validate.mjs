function validateNewUser(user) {
    return user.firstName 
        && user.lastName 
        && user.email 
        && user.password
        && user.role
}

function validateLogin(user) {
    return user.username && user.password
}

function validateCreateConf(conf) {
    return conf.name
        && conf.theme 
        && conf.startDate
}

function validateRegisterReviewer(conf) {
    return conf.id 
        && conf.reviewerId
}

function validateBodyHasId(body) {
    return body.id
}

function validateBodyHasFeedbackOrApproved(body) { 
    return body.feedback || body.approved
}

function validateAddReviewers(body) {
    return Array.isArray(body) && body.length > 1 && body.every(item => item.id);
}

function validateAddArticle (body) {
    return body.article
}

const validator = {
    validateNewUser,  validateLogin, validateCreateConf, 
    validateBodyHasId, validateRegisterReviewer, validateBodyHasFeedbackOrApproved,
    validateAddReviewers, validateAddArticle
}

export default validator