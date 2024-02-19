import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './styles/index.css'
import OpeningPage from './components/pages/openingPage'
import LoginForm from './components/forms/loginForm'
import CreateAccountForm from './components/forms/createAccountForm'
import AllConfPage from './components/pages/allConfPage'
import ConfPage from './components/pages/confPage'
import MyConfPage from './components/pages/myConfPage'
import MyArticlesPage from './components/pages/myArticlesPage'
import ArticlePage from './components/pages/articlePage'
import CreateArtForm from './components/forms/createArtForm'
import CreateConfForm from './components/forms/createConfForm'


const root = ReactDOM.createRoot(document.getElementById('root'))


root.render(
    <HashRouter>
        <Routes>
            <Route path="/" element={<OpeningPage/>}/>
            <Route path="/login" element={<LoginForm/>}/>
            <Route path="/create-account" element={<CreateAccountForm/>}/>
            <Route path="/conf" element={<AllConfPage/>}/>
            <Route path="/my-conferences" element={<MyConfPage/>}/>
            <Route path="/conf/:id" element={<ConfPage/>}/>
            <Route path="/my-articles" element={<MyArticlesPage/>}/>
            <Route path=":confId?/articles/:id" element={<ArticlePage/>}/>
            <Route path="/articles/new-art" element={<CreateArtForm/>}/>
            <Route path="/conf/new-conf" element={<CreateConfForm/>}/>
        </Routes>
    </HashRouter>
)