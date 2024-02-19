import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleOnChange, getFormData } from '../utils'

function CreateArtForm() {
    const [art, setArt] = useState({
        title: ''
    })

    const navigate = useNavigate()

    async function addArticle(event) {
        event.preventDefault()
        const formData = getFormData()
        formData.append('article', JSON.stringify(art))

        const response = await fetch('/confapp/users/me/articles', {
            method: "POST",
            body: formData
        })

        if (response.status === 201) {
            navigate('/my-articles')
        } else {
            let error = await response.json()
            alert(error.error)
            if (response.status === 201) {
                console.log(response.headers)
                navigate('/my-articles')
            } else {
                alert("Something went wrong. Please try again.")
            }
        }
    }
    
    return (
        <form onSubmit={addArticle} onReset={() => navigate('/my-articles')} encType="multipart/form-data">
            <table className="form-table">
                <tr>
                    <td align="right">
                        <b> Title </b>
                    </td>
                    <td>
                        <input type="text" data="title" value={art.title}
                            onChange={event => handleOnChange(art, setArt, event)} />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Article </b>
                    </td>
                    <td>
                        <input type="file" id="fileInput" data="content" accept="*.txt" />
                    </td>
                </tr>
                <tr>
                    <td colSpan="2" align="center">
                        <input className="btn" type="submit" value="Save article" />
                        <input className="btn" type="reset" value="Cancel" />
                    </td>
                </tr>
            </table>
        </form>
    );
}

export default CreateArtForm;