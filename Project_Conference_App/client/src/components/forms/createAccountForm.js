import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOnChange } from '../utils'

function CreateAccountForm() {
    const [account, setAccount] = useState({
        role: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    async function submitForm(event) {
        event.preventDefault()
        const response = await fetch('/confapp/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(account)
        });

        if (response.status === 201) {
            navigate('/login')
        }  else {
            let error = await response.json()
            alert(error.error)
        }
    }

    return (
        <form onSubmit={submitForm}>

            <table className="form-table">
                <tr>
                    <td align="right">
                        <b> Role </b>
                    </td>
                    <td>
                        <select data="role" value={account.role} onChange={event => handleOnChange(account, setAccount, event)} >
                            <option value="">Select an option...</option>
                            <option value="organiser">Organiser</option>
                            <option value="author">Author</option>
                            <option value="reviewer">Reviewer</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> First Name </b>
                    </td>
                    <td>
                        <input type="text" data="firstName" value={account.firstName}
                            onChange={event => handleOnChange(account, setAccount, event)} />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Last Name </b>
                    </td>
                    <td>
                        <input type="text" data="lastName" value={account.lastName}
                            onChange={event => handleOnChange(account, setAccount, event)} />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Birth Date </b>
                    </td>
                    <td>
                        <input
                            type="date"
                            data="birthDate"
                            value={account.birthDate}
                            onChange={event => handleOnChange(account, setAccount, event)}
                        />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Email </b>
                    </td>
                    <td>
                        <input
                            type="text"
                            data="email"
                            value={account.email}
                            onChange={event => handleOnChange(account, setAccount, event)} />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <b> Passsword </b>
                    </td>
                    <td>
                        <input type="password" data="password" value={account.password}
                            onChange={event => handleOnChange(account, setAccount, event)} />
                    </td>
                </tr>
            </table>
            <div>
                <input className="btn" type="submit" value="Register" />
            </div>
        </form>
    )
}

export default CreateAccountForm;