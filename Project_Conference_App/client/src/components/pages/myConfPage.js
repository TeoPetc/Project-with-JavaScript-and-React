import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuStrip } from '../utils';


function MyConfPage() {

    const navigate = useNavigate();
    const [confs, setConfs] = useState([]);

    useEffect(() => {
        const response = fetch('/confapp/users/me/conf', {
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
            }else {
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

    const goToConference = (confId) => {
        navigate(`/conf/${confId}`);
    };

    return (
        <div>
            <MenuStrip />
            <table className="display-table">
                <thead>
                    <tr><th colSpan="3">My Conferences</th></tr>
                    <tr>
                        <th>Name</th>
                        <th>Theme</th>
                        <th>Start Date</th>
                    </tr>
                </thead>
                <tbody>
                    {confs.map((conf) => (
                        <tr key={conf.id} onClick={() => goToConference(conf.id)}>
                            <td>{conf.name}</td>
                            <td>{conf.theme}</td>
                            <td>{conf.startDate ?
                                `${new Date(conf.startDate).toLocaleDateString()}  ${new Date(conf.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                                'No Date'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MyConfPage;