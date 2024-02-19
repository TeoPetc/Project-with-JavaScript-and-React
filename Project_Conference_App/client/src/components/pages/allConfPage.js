import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuStrip, useRole } from '../utils';

function AllConfPage() { // de adaugat buton add pt organiser

    const navigate = useNavigate();
    const [confs, setConfs] = useState([]);
    const userRole = useRole();

    useEffect(() => {
        const response = fetch('/confapp/confs', {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        response.then((res) => {
            if (res.status === 200) {
                const loadedConfs = res.json();
                loadedConfs.then((res2) => {
                    setConfs(res2);
                })
            } else if (res.status === 401) {
                alert('Please log in to view this content.')
                navigate(`/login`)
            } else {
                alert('Failed to load conferences.')
            }
        });

    }, []);

    async function joinConference(confId) {
        const response = await fetch('/confapp/users/me/conf', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "id": confId })
        });
        if (response.status === 201) {
            alert('Successfully registered')
        } else {
            if (response.headers.get("content-length") !== "0") {
                let error = await response.json()
                alert(error.error)
                if (response.status === 401) {
                    navigate(`/login`)
                }
            }
        }
    }

    const goAddConference = () => {
        navigate(`/conf/new-conf`);
    }

    return (
        <div>
            <MenuStrip />
            {(userRole === 'organiser') && (
                <button className="btn btn-add" onClick={goAddConference}>Create New Conference</button>
            )}
            <table className="display-table allconf-table">
                <thead>
                    <tr>
                        {(userRole === 'author') && (
                            <th colSpan="4">All Conferences</th>
                        )}
                        {(userRole !== 'author') && (
                            <th colSpan="3">All Conferences</th>
                        )}
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Theme</th>
                        <th>Start Date</th>
                        {(userRole === 'author') && (
                            <th>Register</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {confs.map((conf) => (
                        <tr key={conf.id}>
                            <td>{conf.name}</td>
                            <td>{conf.theme}</td>
                            <td>{conf.startDate ?
                                `${new Date(conf.startDate).toLocaleDateString()}  ${new Date(conf.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                                'No Date'}</td>
                            {(userRole === 'author') && (
                                <td align="center"><button className="btn" onClick={() => joinConference(conf.id)}>Join</button></td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllConfPage;