import express, { request, response } from 'express'
import session from 'express-session'
import multer from 'multer'
import { login, createAccount, addArticleToConf, deleteArticleFromConf, approveOrFeedback, getAllConfs, processArticle, addReviewerListToConf, getNumOfParticipants } from './service.mjs'
import { getMyConfs, deleteConf, createConf,  getFeedbackAndApproved} from './service.mjs'
import { getArticlesFromConf, getReviewers, getLoggedUserRole, getArticle } from './service.mjs'
import * as Service from './service.mjs'


const router = express.Router()
const subRouterUser = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//  login
router.route('/login')
    .get((request, response) => { })
    .post((request, response) => login(request, response))

router.route('/logout')
    .get((request, response) => {
        delete request.session.user
        response.status(200).json({ message: "Logged out successfully!"})
    })

//get logged in user role
router.route('/get-user-role')
    .get((request, response) => Service.getLoggedUserRole(request, response))

//  create account
router.route('/users')
    .post((request, response) => createAccount(request, response))

router.route('/reviewers')
    .get((request, response) => getReviewers(request, response))

router.use('/users/me', subRouterUser)

//  get all confs
router.route('/confs')
    .get((request, response) => getAllConfs(request, response))

router.route('/articles/:id')
    .get((request, response) => getArticle(request, response))

//  add article to conf or see all articles for a conf
router.route('/confs/:id/articles')
    .get((request, response) => getArticlesFromConf(request, response))
    .post((request, response) => addArticleToConf(request, response))

router.route('/confs/:id/reviewers')
    .post((request, response) => addReviewerListToConf(request, response))

//  delete an article from a conf or review it (patch)
router.route('/confs/:id/articles/:articleId')
    .get((request, response) => getFeedbackAndApproved(request, response))
    .delete((request, response) => deleteArticleFromConf(request, response))
    .patch((request, response) => approveOrFeedback(request, response))

router.route('/confs/:id/participants')
    .get((request, response) => getNumOfParticipants(request, response))

subRouterUser.route('/')
    .get((request, response) => getLoggedUserRole(request, response))


//  get my conf + create conf
subRouterUser.route('/conf')
    .get((request, response) => getMyConfs(request, response))
    .post((request, response) => createConf(request, response))

//  delete conf as organiser
subRouterUser.route('/conf/:id')
    .get((request, response) => Service.getConference(request, response))
    .delete((request, response) => deleteConf(request, response))

//  my articles - add and get all
subRouterUser.route('/articles')
    .get((request, response) => Service.getMyArticles(request, response))
    .post(upload.single('fileInput'), (request, response) => processArticle(request, response))

subRouterUser.route('/conf/:id/articles')
    .get((request, response) => Service.getMyArticlesConf(request, response))

//  remove or update one of my articles
subRouterUser.route('/articles/:id')
    .delete((request, response) => Service.deleteMyArticle(request, response))
    .patch(upload.single('fileInput'), (request, response) => Service.updateMyArticle(request,response))

export default router;