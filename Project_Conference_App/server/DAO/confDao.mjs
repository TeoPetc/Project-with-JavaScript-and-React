import { Conference } from '../repository.mjs'

async function getConfById(confId) {
    var conf = await Conference.findByPk(confId)
    return conf
}

async function createConference(userIdSent, conf) {
    var conference = conf
    conference.organiserId = userIdSent
    var confDb = await Conference.create(conference)

    return confDb
}

async function getAllConfsForOrganiser(organiserIdSent) {
    var confs = await Conference.findAll({
        where: {
            organiserId: organiserIdSent
        }
    })

    return confs
}

async function getAllConferences() {
    var confs = await Conference.findAll({
        
    })

    return confs
}

async function deleteConference(conf) {
    await conf.destroy()
}

export { getConfById, createConference, getAllConfsForOrganiser, deleteConference, getAllConferences }