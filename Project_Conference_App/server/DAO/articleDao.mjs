import { ArtRevConf, Article, Conference, User } from '../repository.mjs'
import { Sequelize } from 'sequelize'

function removeDuplicates (allArticles){
    var articlesWithoutArtRevConf = allArticles.map((article) => {
        const { ArtRevConf, art_rev_conf, ...articleWithoutArtRevConf } = article.toJSON()
        return articleWithoutArtRevConf
    })

    var uniqueArticleIds = new Set()

    var articlesWithoutDuplicates = articlesWithoutArtRevConf.filter((article) => {
        const articleId = article.id

        if (!uniqueArticleIds.has(articleId)) {
            uniqueArticleIds.add(articleId)
            return true
        }

        return false
    })

    return articlesWithoutDuplicates
}

async function getMyArticlesFromConf(conferenceId, authorId) {
    var articlesAuthor = await Article.findAll({
        include: [
            {
                model: ArtRevConf,
                attributes: ['articleId', 'conferenceId'],
                where: { conferenceId: conferenceId }
            },
        ],
        where: {
            authorId: authorId
        }
    })

    return articlesAuthor
}

async function getAllArticlesForConf(conferenceId, authorId) {
    var articlesAuthor = await getMyArticlesFromConf(conferenceId, authorId)

    var articlesNotAuthor = await Article.findAll({
        include: [
            {
                model: ArtRevConf,
                attributes: ['articleId', 'conferenceId'],
                where: { conferenceId: conferenceId }
            },
        ],
        where: {
            authorId: {
                [Sequelize.Op.not]: authorId
            }
        },
        distinct: true
    })
    var allArticles = [...articlesAuthor, ...articlesNotAuthor]

    var articlesWithoutDuplicates = removeDuplicates(allArticles)

    return articlesWithoutDuplicates
}

async function getArticleById(articleId) {
    var article = await Article.findByPk(articleId)
    return article
}

async function getSomeArticles(articleIds) {
    var articles = await Article.findAll({
        where: {
            id: articleIds
        }
    })

    return articles
}

async function getAllArticles(sentUserId) {
    var articles = await Article.findAll({
        where: {
            authorId: sentUserId
        }
    })
    return articles
}

async function isTheAuthor(articleId, userId) {
    var article = await Article.findByPk(articleId)
    if (article) {
        var author = await User.findByPk(article.authorId)

        if (author && author.id === userId) {
            return true
        }
    }
}

async function deleteArticle(articleId, userId) {
    await Article.destroy({
        where: {
            id: articleId,
            authorId: userId
        }
    });
    return true;
}

async function createArticle(article) {
    var artDb = await Article.create(article)

    return artDb
}

async function updateArticle(article) {
    await Article.update({ content: article.content, lastModified: Sequelize.literal('CURRENT_TIMESTAMP') }, {
        where: {
            id: article.id
        }
    })
}

export { getArticleById, getSomeArticles, isTheAuthor, getAllArticles, deleteArticle, createArticle, updateArticle, getAllArticlesForConf }

