import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { handleOnChange, getFormData, setProperty, useRole, MenuStrip } from '../utils';

function ArticlePage() {
    const navigate = useNavigate()
    const userRole = useRole()
    const [article, setArticle] = useState({
        title: '',
        content: ''
    });
    const [refreshArt, setRefreshArt] = useState(false);
    const [refreshFeedbackAndApp, setRefreshFeedbackAndApp] = useState(false);
    const [feedbackObj, setFeedbackObj] = useState({
        feedback: ''
    })
    const [feedbacks, setFeedbacks] = useState([])
    const [approves, setApproves] = useState([])
    const { id } = useParams()
    const { confId } = useParams()

    async function LoadArticle() {
        var response = await fetch(`/confapp/articles/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        return response
    }

    async function submitFeedback() {
        var response = await fetch(`/confapp/confs/${confId}/articles/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(feedbackObj)
        })
        if (response.status === 200) {
            setRefreshFeedbackAndApp(!refreshFeedbackAndApp)
            alert("Feedback added")
        } else {
            var error = response.json()
            error.then((res) => alert(res.error))
        }
    }

    async function GetFeedback() {
        var response = await fetch(`/confapp/confs/${confId}/articles/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        return response
    }

    async function approve() {
        var response = await fetch(`/confapp/confs/${confId}/articles/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ approved: true })
        })
        if (response.status === 200) {
            setRefreshFeedbackAndApp(!refreshFeedbackAndApp)
            alert("Approved")
        } else {
            var error = response.json()
            error.then((res) => alert(res.error))
        }
    }

    function updateFeedback() {

        GetFeedback().then(res => {
            if (res.status === 200) {
                var json = res.json()
                json.then((res2) => {
                    setFeedbacks(res2.feedbacks)
                    setApproves(res2.approves)
                    var text = document.getElementById("approve")
                    if (text) {
                        text.classList = []
                        switch (res2.approves.length) {
                            case 0: text.classList.add('red-text'); break;
                            case 1: text.classList.add('yellow-text'); break;
                            case 2: text.classList.add('green-text'); break;
                        }
                    }
                })
            } else {
                let error = res.json()
                error.then(res2 => {
                    alert(res2.error)
                })
            }

        })
    }

    async function updateArticle() {
        var formData = getFormData()

        const response = await fetch(`/confapp/users/me/articles/${id}`, {
            method: "PATCH",
            body: formData
        })

        if (response.status === 200) {
            let articleDb = await response.json()
            setProperty(article, setArticle, "content", articleDb.content)
            setRefreshArt(!refreshArt)
        } else {
            let error = await response.json()
            alert(error.error)
        }
    }

    useEffect(() => {
        LoadArticle().then(res => {
            if (res.status === 200) {
                var json = res.json()
                json.then((res2) => {
                    setArticle(res2)
                })
            } else {
                let error = res.json()
                error.then(res2 => {
                    alert(res2.error)
                })
                if (res.status === 401) {
                    alert('Please log in to view this content.')
                    navigate(`/login`)
                }
            }
        })
        if (confId) {
            updateFeedback()
        }

    }, [refreshArt])

    useEffect(() => {
        if (confId) {
            updateFeedback()
        }
    }, [confId, refreshFeedbackAndApp])

    return (
        <div>
            <MenuStrip />
            <div className="article-layout">
                <article className="article-content">
                    <header className="article-title">
                        <b> {article.title} </b>
                    </header>

                    {article.content}
                </article>
                <div className="under-article-info">
                    <div className='left-area'>
                        {
                            !confId && userRole === 'author' &&
                            <div className="upload-section">
                                <div className="article-subtitle">
                                    <label><b>Upload new article version</b></label>
                                </div>
                                <div className="upload-controls">
                                    <input type="file" id="fileInput" data="content" accept=".txt" />
                                    <button className='btn' onClick={updateArticle}>Submit</button>
                                </div>
                            </div>
                        }
                        {
                            confId && userRole === 'reviewer' &&
                            <section>
                                <div className="textarea-and-submit">
                                    <textarea
                                        className="feedback-textarea"
                                        placeholder="Enter your feedback here..."
                                        value={feedbackObj.feedback}
                                        data="feedback"
                                        onChange={event => handleOnChange(feedbackObj, setFeedbackObj, event)}>
                                    </textarea>
                                    <br></br>
                                    <button className="btn submit-btn" onClick={submitFeedback}>Submit Feedback</button>
                                </div>
                            </section>
                        }
                        {
                            confId && (userRole === 'author' || userRole === 'reviewer') && feedbacks.length > 0 &&
                            <div >
                                <b>Feedback</b>
                                <ul className='feedback-list'>
                                    {feedbacks.map(item => (
                                        <li>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        }
                    </div>
                    <div className='right-area'>
                        {
                            confId && userRole === 'reviewer' &&
                            <button className="btn approve-btn" onClick={approve}>Approve</button>
                        }
                        {
                            confId && approves &&
                            <b id="approve"> The article has {approves.length} / 2 approvals </b>
                        }
                    </div>
                </div>


            </div>
        </div>

    );
}

export default ArticlePage;