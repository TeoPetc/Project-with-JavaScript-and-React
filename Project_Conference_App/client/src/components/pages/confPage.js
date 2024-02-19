import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MenuStrip, useRole } from "../utils";

function ConfPage() {
  const navigate = useNavigate();

  const userRole = useRole();
  const [articles, setArticles] = useState([]);
  const [conference, setConference] = useState({});
  const [showArticlesDropdown, setShowArticlesDropdown] = useState(true);
  const [showMyArticlesDropdown, setShowMyArticlesDropdown] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [refreshArticles, setRefreshArticles] = useState(true)

  const { id } = useParams();


  async function getArticles() {
    try {
      const response = await fetch(`/confapp/users/me/conf/${id}/articles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const articlesData = await response.json();
        setArticles(articlesData);
      } else {

        if (response.status === 401) {
          alert('Please log in to view this content.');
          navigate('/login');
        } else {
          let error = await response.json()
          alert(error.error)
        }
      }
    } catch (error) {
      console.error('Error fetching user articles:', error);
    }
  }

  async function getAllArticles() {
    try {
      const response = await fetch(`/confapp/confs/${id}/articles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const articlesData = await response.json();
        setAllArticles(articlesData);
      } else {
        if (response.status === 401) {
          alert('Please log in to view this content.');
          navigate('/login');
        } else {
          let error = await response.json()
          alert(error.error)
        }
      }
    } catch (error) {
      console.error('Error fetching all articles:', error);
    }
  }

  async function getConference() {
    const response = await fetch(`/confapp/users/me/conf/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      var conf = await response.json();
      setConference(conf);
    } else {
      if (response.status === 401) {
        alert('Please log in to view this content.');
        navigate('/login');
      } else {
        let error = await response.json()
        alert(error.error)
      }
    }
  }

  useEffect(() => {
    const fetchConf = async () => { await getConference() }
    fetchConf()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (userRole === 'author') {
        await getArticles();
        await getAllArticles();
      } else if (userRole === 'organiser') {
        await getAllArticles();
      } else if (userRole === 'reviewer') {
        await getArticles();
      }
    };

    fetchData();
  }, [id, userRole, refreshArticles]);

  const handleCollapseClick = (event) => {
    if (event.target.id == "all") {
      setShowArticlesDropdown(!showArticlesDropdown);
    } else {
      setShowMyArticlesDropdown(!showMyArticlesDropdown);
    }
  };


  const goToArticle = (articleId) => {
    navigate(`/${id}/articles/${articleId}`);
  };

  const handleCheckboxChange = (articleId) => {
    setSelectedArticle((prevSelectedArticle) =>
      prevSelectedArticle === articleId ? null : articleId
    );
  };

  const handleAddSelectedArticle = async () => {

    if (!selectedArticle) {
      alert('Select an article to add to the conference.');
      return;
    }

    try {
      const response = await fetch(`/confapp/confs/${id}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedArticle }),
      });

      if (response.ok) {
        alert('Selected article added to the conference successfully.');
        setRefreshArticles(!refreshArticles);

      } else {
        if (response.status === 401) {
          alert('Please log in to view this content.');
          navigate('/login');
        } else {
          var error = response.json()
          error.then((res) => alert(res.error))
        }
      }
    } catch (error) {
      console.error('Error adding selected article to the conference:', error);
    }
  };

  return (
    <div>
      <MenuStrip />
      <div className="conf-title">{conference.name}</div>
      <div className="conf-theme">- {conference.theme} -</div>
      <div className="conf-page-container">
        {(userRole === 'author' || userRole === 'reviewer') && (
          <div>
            <div className="your-articles-view">
              <h4>Your Articles:</h4>
              <button id="my" className="btn-collapse-expand" onClick={handleCollapseClick}>
                {showMyArticlesDropdown ? "Collapse" : "Expand"}
              </button>
              <br />
              {showMyArticlesDropdown && (
                <table className="confpage-my-articles">
                  <thead>
                    <tr>

                      {userRole === 'author' && <th>Select</th>}
                      <th>Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id}>
                        {userRole === 'author' && (
                          <td>
                            <input
                              type="radio"
                              name="selectedArticle"
                              value={article.id}
                              onChange={() => handleCheckboxChange(article.id)}
                              checked={selectedArticle === article.id}
                            />
                          </td>
                        )}
                        <td onClick={() => goToArticle(article.id)}>{article.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {userRole === 'author' && (
                <button className="btn btn-add-article" onClick={handleAddSelectedArticle}>
                  Add Selected Article To Conference
                </button>
              )}
            </div>
          </div>
        )}

        {(userRole === 'organiser' || userRole === 'author') && (
          <div>
            <div className="all-articles-view">
              <h4>All Articles:</h4>
              <button id="all" className="btn-collapse-expand" onClick={handleCollapseClick}>
                {showArticlesDropdown ? "Collapse" : "Expand"}
              </button>
              {showArticlesDropdown && (
                <ul className="confpage-all-articles">
                  {allArticles.map((article) => (
                    <li key={article.id}>
                      <span onClick={() => goToArticle(article.id)}>
                        {article.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default ConfPage;
