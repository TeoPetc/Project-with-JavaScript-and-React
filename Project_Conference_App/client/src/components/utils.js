import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function setProperty(targetObj, objSetterFunction, property, value) {
    const objCopy = { ...targetObj }
    objCopy[property] = value
    objSetterFunction(objCopy)
}

function handleOnChange(targetObj, objSetterFunction, event) {
    setProperty(targetObj, objSetterFunction, event.target.getAttribute('data'), event.target.value)
}

function MenuStrip() {
    const navigate = useNavigate();
    const userRole = useRole();

    const goToConferences = () => navigate('/conf');
    const goToMyConferences = () => navigate('/my-conferences');
    const goToMyArticles = () => navigate('/my-articles');
    const goLogout = async () => {
        var response = await fetch('/confapp/logout', {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const res2 = await response.json()
        alert(res2.message)
        navigate('/login')
    }

    return (
        <div className="menu-bar">
            <div>
                <button className="menu-btn" onClick={goToConferences}>All Conferences</button>
                <button className="menu-btn" onClick={goToMyConferences}>My Conferences</button>
                {(userRole === 'author' || userRole === 'reviewer') && (
                    <button className="menu-btn" onClick={goToMyArticles}>My Articles</button>
                )}
            </div>

            <button align="right" className="menu-btn logout-btn" onClick={goLogout}>Logout</button>
        </div>
    );
}

function getFormData() {
    const fileInput = document.getElementById("fileInput")
    const file = fileInput.files[0]

    const formData = new FormData()
    formData.append('fileInput', file)

    return formData
}

async function GetUser() {
    var response = await fetch('/confapp/users/me/', {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    return response
}

function useRole() {
    const [userRole, setUserRole] = useState('');
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await GetUser();
                const userData = await response.json();
                setUserRole(userData.role)
            } catch (error) {
                console.error("Failed to fetch user role:", error);
            }
        };
        fetchUser();
    }, []);

    return userRole
}

export { handleOnChange, MenuStrip, getFormData, GetUser, setProperty, useRole };