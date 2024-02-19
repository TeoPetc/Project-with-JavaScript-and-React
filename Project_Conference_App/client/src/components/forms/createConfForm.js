import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleOnChange } from "../utils";

function CheckboxOption({ reviewer, isSelected, onChange }) {
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    value={reviewer.id}
                    checked={isSelected}
                    onChange={() => onChange(reviewer.id)}
                />
                {reviewer.firstName} {reviewer.lastName}
            </label>
        </div>
    );
}



function CreateConfForm() {
    const [conference, setConference] = useState({
        theme: '',
        name: '',
        startDate: ''
    });

    const [allReviewers, setAllReviewers] = useState([]);
    const [selectedReviewers, setSelectedReviewers] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviewers = async () => {
            try {
                const response = await fetch('/confapp/reviewers');
                const text = await response.text();
                const reviewersData = JSON.parse(text);
                if (response.ok) {
                    setAllReviewers(reviewersData);
                    setSelectedReviewers(reviewersData.map(reviewer => reviewer.id));
                } else {
                    console.error('Failed to fetch reviewers');
                }
            } catch (error) {
                console.error('Error fetching reviewers:', error);
            }
        };

        fetchReviewers();
    }, []);

    const handleCheckboxChange = (reviewerId) => {
        setSelectedReviewers((prevSelectedReviewers) => {
            if (prevSelectedReviewers.includes(reviewerId)) {
                return prevSelectedReviewers.filter((id) => id !== reviewerId);
            } else {
                return [...prevSelectedReviewers, reviewerId];
            }
        });
    };

    async function submitFormConf(event) {
        try {
            event.preventDefault()
            const response = await fetch('confapp/users/me/conf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(conference)
            });

            if (response.status === 201) {
                var reviewers = selectedReviewers.map(item => {
                    var obj = { id: item }
                    return obj
                })
                var confId = response.headers.get("ConfId")
                const response1 = await fetch(`confapp/confs/${confId}/reviewers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewers)
                });
                if (response1.status === 200) {
                    navigate('/my-conferences');
                } else {
                    let error = await response1.json()
                    alert(error.error)
                    var response2 = await fetch(`confapp/users/me/conf/${confId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(reviewers)
                    });
                }
            } else {
                let error = await response.json()
                alert(error.error)
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    return (
        <form onSubmit={submitFormConf}>
            <table>
                <tr>
                    <td align="right">
                        <b> Title name </b>
                    </td>
                    <td>
                        <input
                            type="text"
                            data="name"
                            value={conference.name}
                            onChange={event => handleOnChange(conference, setConference, event)}
                        />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Theme </b>
                    </td>
                    <td>
                        <input
                            type="text"
                            data="theme"
                            value={conference.theme}
                            onChange={event => handleOnChange(conference, setConference, event)}
                        />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Reviewers </b>
                    </td>
                    <td>
                        {allReviewers.map((reviewer) => (
                            <CheckboxOption
                                key={reviewer.id}
                                reviewer={reviewer}
                                isSelected={selectedReviewers.includes(reviewer.id)}
                                onChange={handleCheckboxChange}
                            />
                        ))}
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Start date </b>
                    </td>
                    <td>
                        <input
                            type="date"
                            data="startDate"
                            value={conference.startDate}
                            onChange={event => handleOnChange(conference, setConference, event)}
                        />
                    </td>
                </tr>
                <tr>
                    <td colSpan="2" align="center">
                        <input type="submit" value="Create" className="btn" />
                        <Link to="/my-conferences">
                            <button className='btn'>Cancel</button>
                        </Link>
                    </td>
                </tr>
            </table>
        </form>
    );
}

export default CreateConfForm;
