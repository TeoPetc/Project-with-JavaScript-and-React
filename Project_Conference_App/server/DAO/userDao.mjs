import { User } from '../repository.mjs'
import { getConfUsers } from './userConfDao.mjs'

async function getUserByEmail(emailSent) {
    var user = await User.findOne({
        where: {
            email: emailSent
        }
    })

    return user
}

async function addUser (userSent) {
    var user = await User.create(userSent)
    return user
}

async function getUserById(confId) {
    var conf = await User.findByPk(confId)
    return conf
}

async function getAllReviewers() {
    var reviewers = await User.findAll({
        where: {
            role: 'reviewer'
        }
    })

    return reviewers
}

async function getConfMemberByRoleRev(conferenceIdSent) {

    var membersAtConf = await getConfUsers(conferenceIdSent);
    var userIds = membersAtConf.map(member => member.userId);

    var reviewers = await User.findAll({
        where: {
            id: userIds,
            role: 'reviewer'
        }
    });
    var randomIndex = Math.floor(Math.random() * reviewers.length);
    var randomReviewer = reviewers[randomIndex];

    return randomReviewer;
}


export { getUserByEmail, addUser, getUserById, getAllReviewers, getConfMemberByRoleRev }