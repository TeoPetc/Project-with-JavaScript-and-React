import bcrypt from 'bcryptjs'
import session from 'express-session'
import { promisify } from 'util'
import validator from './validate.mjs'
import { getUserByEmail, addUser, getUserById, getAllReviewers } from './DAO/userDao.mjs'
import { getUserConfs, addUserConf, userAccessToConf, getConfUsers } from './DAO/userConfDao.mjs'
import { getConfById, createConference, getAllConfsForOrganiser, deleteConference, getAllConferences } from './DAO/confDao.mjs'
import { createArtRevConf, deleteAllAssociationsForArticle, existingAssociation, existingAssociationWithReviewer, getArticlesIdFromConf, updateApproved, updateFeedback } from './DAO/artRevConfDao.mjs'
import * as ArticleDAO from './DAO/articleDao.mjs'
import * as ArtRevConfDAO from './DAO/artRevConfDao.mjs'

const internalServerError = { error: "Internal server error" }
const unauthorizedError = { error: "You are not logged in" }
const invalidRequest = { error: "There are missing or empty fields" }

async function login(request, response) {
    if (validator.validateLogin(request.body)) {
        const email = request.body.username
        const password = request.body.password

        try {
            const user = await getUserByEmail(email)

            if (user) {
                let passwordDb = user.password

                const compareAsync = promisify(bcrypt.compare)

                const res = await compareAsync(password, passwordDb)
                if (res) {
                    request.session.user = user
                    response.status(200).send()
                } else {
                    response.status(401).json(unauthorizedError)
                }

            } else {
                response.status(401).json(unauthorizedError)
            }

        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(400).json(invalidRequest)
    }
}

async function createAccount(request, response) {
    if (validator.validateNewUser(request.body)) {
        try {
            const user = await getUserByEmail(request.body.email)
            if (!user) {

                const asyncHash = promisify(bcrypt.hash)
                const asyncGenSalt = promisify(bcrypt.genSalt)

                const salt = await asyncGenSalt(10)

                if (salt) {
                    const userSent = request.body
                    userSent.password = await asyncHash(userSent.password, salt)
                    const user = await addUser(userSent)

                    response.status(201)
                        .location(`${request.protocol}://${request.hostname}:${request.socket.localPort}${request.baseUrl}${request.url}/${user.id}`)
                        .send()
                } else {
                    console.log(error)
                    response.status(500).json(internalServerError)
                }
            } else {
                response.status(400).json({
                    error: "You already have an account"
                })

            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }

    } else {
        response.status(400).json(invalidRequest)
    }
}

async function getMyConfs(request, response) {
    const user = request.session.user

    if (user) {
        try {
            var confs = []
            if (user.role === "organiser") {
                confs = await getAllConfsForOrganiser(user.id)
            } else {
                var userConfs = await getUserConfs(user.id)
                if (userConfs) {
                    confs = await Promise.all(
                        userConfs.map(
                            async userConf => await getConfById(userConf.dataValues.conferenceId)
                        ))
                }
            }
            response.status(200).json(confs)
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }

}

async function createConf(request, response) {
    const user = request.session.user
    if (user) {
        if (user.role === 'organiser') {
            if (validator.validateCreateConf(request.body)) {
                try {
                    var conf = await createConference(user.id, request.body)
                    response.setHeader('ConfId', conf.id)
                    response.status(201)
                        .location(`${request.protocol}://${request.hostname}:${request.socket.localPort}${request.baseUrl}${request.url}/${conf.id}`)
                        .send()
                } catch (error) {
                    console.log(error)
                    response.status(500).json(internalServerError)
                }
            } else if (validator.validateRegisterReviewer(request.body)) {
                addReviewerToConf(request.body, response)
            } else {
                response.status(400).json(invalidRequest)
            }
        } else if (user.role === 'author') {
            if (validator.validateBodyHasId(request.body)) {
                try {
                    var conf = await getConfById(request.body.id)
                    if (conf) {
                        var userConfDb = await userAccessToConf(user.id, conf.id)
                        if (!userConfDb) {
                            var userConf = await addUserConf(user.id, conf.id)
                            response.status(201)
                                .location(`${request.protocol}://${request.hostname}:${request.socket.localPort}${request.baseUrl}${request.url}/${userConf.id}`)
                                .send()
                        } else {
                            response.status(400).json({ error: "You are already subscribed to this conference" })
                        }
                    } else {
                        response.status(400).json({ error: "Conference does not exist" })
                    }

                } catch (error) {
                    console.log(error)
                    response.status(500).json(internalServerError)
                }
            }
        } else {
            response.status(400).json({ error: "Operation not permitted" })
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function deleteConf(request, response) {
    const user = request.session.user
    if (user && user.role === 'organiser') {
        try {
            var conf = await getConfById(request.params.id)

            if (conf && conf.organiserId === user.id) {
                deleteConference(conf)
                response.status(204).send()

            } else {
                response.status(400).json(invalidRequest)
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }

}

async function getMyArticles(request, response) {
    const user = request.session.user
    if (user && (user.role === 'author' || user.role === 'reviewer')) {
        if (user.role === 'author') {
            try {
                var articles = []
                articles = await ArticleDAO.getAllArticles(user.id)
                response.status(200).json(articles)
            } catch (error) {
                console.log(error)
                response.status(500).json(internalServerError)
            }
        } else {
            try {
                var articleIDs = []
                articleIDs = await ArtRevConfDAO.getArticlesByReviewer(user.id)
                var articles = []
                articles = await Promise.all(articleIDs.map(async articleRev => await ArticleDAO.getArticleById(articleRev.articleId)))
                response.status(200).json(articles)
            } catch (error) {
                console.log(error)
                response.status(500).json(internalServerError)
            }
        }

    } else {
        response.status(401).json({ error: "Please log in as an author or reviewer to view articles" })
    }
}


async function getMyArticlesConf(request, response) {
    const user = request.session.user
    if (user && (user.role === 'reviewer' || user.role === 'author')) {
        try {
            var conf = await getConfById(request.params.id);
            if (conf) {
                var hasAccess = await userAccessToConf(user.id, conf.id)
                if (hasAccess) {
                    if (user.role === 'author') {
                        var articles = await ArticleDAO.getAllArticles(user.id)
                    } else {
                        var articleIds = await ArtRevConfDAO.getArticlesByReviewerAndConf(conf.id, user.id)
                        var articles = await Promise.all(articleIds.map(async artartRevConf => await ArticleDAO.getArticleById(artartRevConf.articleId)))
                    }
                    response.status(200).json(articles)
                } else {
                    response.status(400).json({
                        error: "Dont't have the permission."
                    })
                }
            } else {
                response.status(400).json({
                    error: "The conference doesn't exists."
                })
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json({ error: "Please log in as an author or reviewer to view articles" })
    }

}

async function processFile(request) {
    var uploadedFile = request.file
    var content = uploadedFile.buffer.toString('utf-8')
    return content
}

async function processArticle(request, response) {
    const user = request.session.user
    if (user && user.role === 'author') {
        if (validator.validateAddArticle(request.body)) {
            try {
                const article = JSON.parse(request.body.article)
                article.content = await processFile(request)
                article.authorId = user.id
                var articleDb = await ArticleDAO.createArticle(article)

                response.status(201)
                    .location(`${request.protocol}://${request.hostname}:${request.socket.localPort}${request.baseUrl}${request.url}/${articleDb.id}`)
                    .send()
            } catch (error) {
                console.log(error)
                response.status(500).json(internalServerError)
            }
        } else {
            response.status(400).json({
                error: "Article doesn't have title"
            })
        }

    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function updateMyArticle(request, response) {
    const user = request.session.user

    if (user && user.role === 'author') {
        try {
            var article = await ArticleDAO.getArticleById(request.params.id)

            if (article && article.authorId === user.id) {
                var content = await processFile(request)
                var id = request.params.id
                const article = {
                    id: id,
                    content: content
                }

                await ArticleDAO.updateArticle(article)

                var articleDb = await ArticleDAO.getArticleById(id)
                response.status(200).json(articleDb)

            } else {
                response.status(400).json({
                    error: "Article doesn't exist or it doesn't belong to the author"
                })
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(error)
        }
    }
}

async function deleteMyArticle(request, response) {
    const user = request.session.user
    var articleId = request.params.id
    if (user && user.role === 'author') {
        try {
            const article = ArticleDAO.getArticleById(articleId)
            if (article && await ArticleDAO.isTheAuthor(articleId, user.id)) {
                ArticleDAO.deleteArticle(articleId, user.id)
                response.status(204).send()
            } else {
                response.status(400).send()
            }

        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function getAllConfs(request, response) {
    const user = request.session.user
    if (user) {
        try {
            var confs = []
            confs = await getAllConferences()
            response.status(200).json(confs)
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function getArticlesFromConf(request, response) {
    const user = request.session.user

    if (user) {
        try {
            var conf = await getConfById(request.params.id);
            if (conf) {
                var hasAccess = null
                if (user.role === 'organiser') {
                    if (conf.organiserId === user.id) {
                        hasAccess = conf
                    }
                } else {
                    hasAccess = await userAccessToConf(user.id, conf.id)
                }
                if (hasAccess) {
                    if (user.role === 'author') {
                        var articles = await ArticleDAO.getAllArticlesForConf(conf.id, user.id)
                    } else {
                        var articleIdsResult = await getArticlesIdFromConf(conf.id)
                        var articleIds = articleIdsResult.map(item => item.articleId)
                        var articles = await ArticleDAO.getSomeArticles(articleIds)
                    }

                    response.status(200).json(articles)
                } else {
                    response.status(400).json({
                        error: "Dont't have the permission."
                    })
                }
            } else {
                response.status(400).json({
                    error: "The conference doesn't exists."
                })
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex]
}

function getRandomReviewer(reviewerIds) {
    var randomId = getRandomElement(reviewerIds)

    return randomId
}

async function addArticleToConf(request, response) {
    const user = request.session.user

    if (user) {
        var conferenceID = request.params.id

        if (user.role === 'author' && validator.validateBodyHasId(request.body)) {
            var articleID = request.body.id
            try {
                if (await ArticleDAO.isTheAuthor(articleID, user.id) && await userAccessToConf(user.id, conferenceID)) {

                    var associationExists = await existingAssociation(articleID, conferenceID)

                    if (!associationExists) {

                        var users = await getConfUsers(conferenceID)
                        users = await Promise.all(users.map(async user => await getUserById(user.userId)))
                        users = users.filter(user => user.role === 'reviewer')

                        if (users.length > 1) {
                            var reviewer1 = getRandomReviewer(users);
                            var reviewer2 = getRandomReviewer(users);
                            while (reviewer1 === reviewer2) {
                                reviewer2 = getRandomReviewer(users);
                            }

                            var artRevConf1 = await createArtRevConf(articleID, conferenceID, reviewer1.id);
                            var artRevConf2 = await createArtRevConf(articleID, conferenceID, reviewer2.id);

                            response.status(201).location(`${request.protocol}://${request.hostname}:${request.socket.localPort}${request.baseUrl}${request.url}/${artRevConf1.id}`).send()

                        } else {
                            response.status(400).json({
                                error: "There are not sufficient reviewers at the conference"
                            })
                        }
                    } else {
                        response.status(400).json({
                            error: "You have already registered the article"
                        })
                    }
                } else {
                    response.status(400).json({
                        error: "Don't have the permission."
                    })
                }
            } catch (error) {
                console.log(error)
                response.status(500).json(internalServerError)
            }
        } else {
            response.status(400).json(invalidRequest)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function deleteArticleFromConf(request, response) {
    const user = request.session.user

    if (user) {
        const conferenceID = request.params.id
        const articleID = request.params.articleId

        try {
            if (user.role === 'author' && await ArticleDAO.isTheAuthor(articleID, user.id) && await userAccessToConf(user.id, conferenceID)) {

                var associationExists = await existingAssociation(articleID, conferenceID)

                if (associationExists) {
                    await deleteAllAssociationsForArticle(articleID)
                    response.status(204).send()
                }
                else {
                    response.status(400).json({
                        error: "Association doesn't exist."
                    })
                }
            } else {
                response.status(401).json(unauthorizedError)
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function approveOrFeedback(request, response) {
    const user = request.session.user

    if (user && user.role === 'reviewer') {
        if (validator.validateBodyHasFeedbackOrApproved(request.body)) {
            var conferenceID = request.params.id
            var articleID = request.params.articleId
            var reviewerID = user.id
            try {
                var association = await existingAssociationWithReviewer(articleID, conferenceID, reviewerID)
                if (association && association.approved === false) {
                    if (request.body.feedback) {
                        var feedback = request.body.feedback
                        await updateFeedback(association.id, feedback)
                        response.status(200).send()
                    }
                    else if (request.body.approved) {
                        var approved = request.body.approved
                        await updateApproved(association.id, approved)
                        response.status(200).send()
                    }

                } else {
                    response.status(400).json({
                        error: "Association doesn't exist or the article is already approved."
                    })
                }
            } catch (error) {
                console.log(error)
                response.status(500).json(internalServerError)
            }

        } else {
            response.status(400).json(invalidRequest)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function addReviewerToConf(body, response) {
    try {
        if (body.id) {
            var conf = await getConfById(body.id)
        } else {
            var conf = body.conf
        }
        var reviewer = await getUserById(body.reviewerId)

        if (conf && reviewer && reviewer.role === 'reviewer') {
            var userConfDb = await userAccessToConf(reviewer.id, conf.id)
            if (!userConfDb) {
                var userConf = await addUserConf(reviewer.id, conf.id)

                if (response) {
                    response.status(201)
                        .location(`${request.protocol}://${request.hostname}:${request.socket.localPort}${request.baseUrl}${request.url}/${userConf.id}`)
                        .send()
                } else {
                    return userConf
                }

            } else {
                if (response) {
                    response.status(400).json({
                        error: "You are already registered at the conference"
                    })
                } else {
                    return 1
                }

            }
        } else {
            if (response) {
                response.status(400).json({
                    error: "You are not a reviewer"
                })
            } else {
                return 1
            }
        }

    } catch (error) {
        console.log(error)
        response.status(500).json(internalServerError)
    }
}

async function addReviewerListToConf(request, response) {
    var user = request.session.user
    if (user && user.role === 'organiser') {
        if (validator.validateAddReviewers(request.body)) {
            try {
                var conf = await getConfById(request.params.id)
                if (conf) {
                    var reviewers = request.body
                    var userConfs = await Promise.all(
                        reviewers.map(async reviewer => {
                            let body = {
                                reviewerId: reviewer.id,
                                conf: conf
                            }
                            let nr = await addReviewerToConf(body)

                            if (nr === 1) {
                                response.status(400).json({
                                    error: "The reviewers or the conference don't have correct values."
                                })
                            } else {
                                return 0
                            }
                        })
                    )
                    if (userConfs) {
                        response.status(200).send()
                    }
                    else {
                        response.status(400).json({
                            error: "The reviewers couldn't be added to the conference."
                        })
                    }
                } else {
                    response.status(400).json({
                        error: "The conference doesn't exist."
                    })
                }
            } catch (error) {
                console.log(error)
                response.status(500).json(internalServerError)
            }
        } else {
            response.status(400).json(invalidRequest)
        }

    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function getReviewers(request, response) {
    const user = request.session.user
    if (user && user.role === 'organiser') {
        var reviewers = await getAllReviewers()
        response.status(200).json(reviewers)
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function getNumOfParticipants(request, response) {
    const user = request.session.user
    if (user) {
        try {
            var conf = await getConfById(request.params.id);
            if (conf) {
                var confUsers = await getConfUsers(conf.id)

                if (confUsers) {
                    var authors = await Promise.all(confUsers.map(async confUser => await getUserById(confUser.userId)))
                    authors = authors.filter(user => user.role === 'author')

                    response.status(200).json({
                        "num": authors.length
                    })
                } else {
                    response.status(200).json([])
                }

            } else {
                response.status(400).json({
                    error: "The conference doesn't exist"
                })
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }

    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function getArticle(request, response) {
    const user = request.session.user
    if (user) {
        try {
            var article = await ArticleDAO.getArticleById(request.params.id)
            if (article) {
                var contentBuffer = Buffer.from(article.content)
                article.content = new TextDecoder('utf-8').decode(contentBuffer)
                response.status(200).json(article)
            } else {
                response.status(400).json({
                    error: "Article doesn't exist."
                })
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

function getLoggedUserRole(request, response) {
    {
        if (request.session.user) {
            response.status(200).json({ role: request.session.user.role })
        } else {
            response.status(401).json(unauthorizedError)
        }
    }
}

async function getFeedbackAndApproved(request, response) {
    const user = request.session.user
    if (user) {
        try {
            var conf = await getConfById(request.params.id);
            if (conf) {
                if (user.role === 'author' || user.role === 'reviewer') {
                    var hasAccess = await userAccessToConf(user.id, conf.id)
                } else {
                    var hasAccess = conf.organiserId === user.id
                }
                if (hasAccess) {
                    var article = await ArticleDAO.getArticleById(request.params.articleId)
                    if (article) {
                        var feedbackAndApprove = await ArtRevConfDAO.getApproveAndFeedbcack(article.id, conf.id)
                        if (feedbackAndApprove) {

                            var obj = {
                                approves: [],
                                feedbacks: []
                            }

                            var rev1 = feedbackAndApprove[0]
                            var rev2 = feedbackAndApprove[1]

                            if (rev1 && rev1.approved) {
                                obj.approves.push(rev1.approved)
                            }
                            if (rev1 && rev1.feedback) {
                                obj.feedbacks.push(rev1.feedback)
                            }

                            if (rev2 && rev2.approved) {
                                obj.approves.push(rev2.approved)
                            }
                            if (rev2 && rev2.feedback) {
                                obj.feedbacks.push(rev2.feedback)
                            }

                            response.status(200).json(obj)

                        } else {
                            response.status(400).json({
                                error: "Article doesn't belong to conference"
                            })
                        }

                    } else {
                        response.status(400).json({
                            error: "Article doesn't exist"
                        })
                    }
                } else {
                    response.status(400).json({
                        error: "User doesn't have access to the conference"
                    })
                }
            } else {
                response.status(400).json({
                    error: "Conference doesn't exist"
                })
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

async function getConference(request, response) {
    const user = request.session.user
    if (user) {
        try {
            var conference = await getConfById(request.params.id)

            if (user.role === 'author' || user.role === 'reviewer') {
                var hasAccess = await userAccessToConf(user.id, conference.id)
            } else {
                var hasAccess = conference.organiserId === user.id
            }
            if (hasAccess) {

                if (conference) {
                    response.status(200).json(conference)
                } else {
                    response.status(400).json({
                        error: "Conference doesn't exist."
                    })
                }
            } else {
                response.status(400).json({
                    error: "You don't have access to the conference."
                })
            }
        } catch (error) {
            console.log(error)
            response.status(500).json(internalServerError)
        }
    } else {
        response.status(401).json(unauthorizedError)
    }
}

export {
    login, createAccount, getMyConfs, createConf, deleteConf,
    processArticle, getAllConfs, getArticlesFromConf, addArticleToConf,
    deleteArticleFromConf, approveOrFeedback, addReviewerListToConf,
    getReviewers, getNumOfParticipants, getMyArticles, deleteMyArticle, getArticle, getLoggedUserRole, updateMyArticle,
    getConference, getMyArticlesConf,
    getFeedbackAndApproved
}