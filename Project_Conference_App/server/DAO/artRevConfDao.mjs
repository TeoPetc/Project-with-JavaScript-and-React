import { ArtRevConf } from '../repository.mjs'

async function getArticlesIdFromConf(conferenceId) {
    var articlesID = await ArtRevConf.findAll({
        where: {
            conferenceId: conferenceId
        }
    })

    return articlesID
}

async function getArticlesByReviewer(reviewerId) {
    var artRevConf = await ArtRevConf.findAll({
        where: {
            reviewerId: reviewerId
        }
    })

    return artRevConf
}

async function createArtRevConf(articleIdSent, conferenceIdSent, reviewerIdSent) {
    const artRevConf = {
        articleId: articleIdSent,
        conferenceId: conferenceIdSent,
        reviewerId: reviewerIdSent
    }

    const artRevConfDb = await ArtRevConf.create(artRevConf)

    return artRevConf
}

async function existingAssociation(articleIdSend, conferenceIdSend) {
    const association = await ArtRevConf.findOne({
        where: {
            articleId: articleIdSend,
            conferenceId: conferenceIdSend
        }
    })

    return association
}

async function getApproveAndFeedbcack(articleIdSend, conferenceIdSend) {
    const associations = await ArtRevConf.findAll({
        where: {
            articleId: articleIdSend,
            conferenceId: conferenceIdSend
        }
    })

    return associations
}

async function deleteAllAssociationsForArticle(articleIDsend) {
    await ArtRevConf.destroy({
        where: {
            articleId: articleIDsend
        }
    })
}

async function existingAssociationWithReviewer(articleIdSend, conferenceIdSend, reviewerIDSend) {

    const association = await ArtRevConf.findOne({
        where: {
            articleId: articleIdSend,
            conferenceId: conferenceIdSend,
            reviewerId: reviewerIDSend
        }
    })

    return association
}

async function updateFeedback(associationIDsend, feedbackSend) {
    await ArtRevConf.update({ feedback: feedbackSend }, {
        where: {
            id: associationIDsend
        }
    })
}

async function updateApproved(associationIDsend, approvedSend) {
    await ArtRevConf.update({ approved: approvedSend }, {
        where: {
            id: associationIDsend
        }
    })
}

async function getArticlesByReviewerAndConf(confIdSent, reviewerIdSent) {
    var articlesIds = await ArtRevConf.findAll({
        where: {
            conferenceId: confIdSent,
            reviewerId: reviewerIdSent
        }
    })

    return articlesIds
}

export {
    getArticlesIdFromConf, createArtRevConf, existingAssociation, deleteAllAssociationsForArticle, updateApproved,
    updateFeedback, existingAssociationWithReviewer, getArticlesByReviewer, getApproveAndFeedbcack, getArticlesByReviewerAndConf
}