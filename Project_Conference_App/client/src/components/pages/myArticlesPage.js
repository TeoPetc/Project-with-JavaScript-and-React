import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuStrip, useRole } from '../utils';


function MyArticlesPage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const userRole = useRole();

    useEffect(() => {
        const response = fetch('/confapp/users/me/articles', {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        response.then((res) => {
            if (res.status === 200) {
                const loadedArt = res.json();
                loadedArt.then((res2) => {
                    setArticles(res2);
                })
            } else {
                let error = res.json()
                error.then(res => {
                    alert(res.error)
                })
                if (res.status === 401) {
                    navigate(`/login`)
                }
            }
        });

    }, []);

    const goToArticle = (articleId) => {
        navigate(`/articles/${articleId}`);
    };
    const goAddArticle = () => {
        navigate(`/articles/new-art`);
    };

    return (
        <div>
            <MenuStrip />
            {(userRole === 'author') && (
                <button className="btn btn-add" onClick={goAddArticle}>Add New Article</button>
            )}
            <table className="display-table">
                <thead>
                    <tr><th colSpan="2">My Articles</th></tr>
                    <tr>
                        <th>Name</th>
                        <th>Last Modified</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map((art) => (
                        <tr key={art.id} onClick={() => goToArticle(art.id)}>
                            <td>{art.title}</td>
                            <td>{art.lastModified ?
                                `${new Date(art.lastModified).toLocaleDateString()}  ${new Date(art.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                                'No Date'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MyArticlesPage;