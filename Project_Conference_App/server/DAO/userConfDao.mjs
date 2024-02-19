import { UserConf } from '../repository.mjs'

async function getUserConfs(userIdSent) {
    var confUsers = await UserConf.findAll({
        where: {
            userId: userIdSent
        }
    })

    return confUsers
}

async function getConfUsers(confIdSent) {
    var confUsers = await UserConf.findAll({
        where: {
            conferenceId: confIdSent
        }
    })

    return confUsers
}

async function addUserConf(userIdSent, confIdSent) {
    var confUser = {
        userId: userIdSent,
        conferenceId: confIdSent
    }

    var confUserDb = await UserConf.create(confUser)
    

    return confUserDb
}

async function userAccessToConf(userIdSent, conferenceIdSent) {
    var userConf = await UserConf.findOne({
        where: {
            userId: userIdSent,
            conferenceId: conferenceIdSent
        }
    })

    return userConf
}

export { getUserConfs, addUserConf, userAccessToConf, getConfUsers }