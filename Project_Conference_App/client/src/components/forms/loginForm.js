import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleOnChange } from '../utils'

function LoginForm() {
    const [user, setUser] = useState({
        username: '',
        password: ''
    })

    const navigate = useNavigate()

    async function login(event) {
        event.preventDefault()
        const response = await fetch('/confapp/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })

        if (response.status === 200) {
            navigate('/conf')
        } else {
            alert('Username or password is not correct. Please try again.')
        }

    }

    return (
        <form onSubmit={login} onReset={() => navigate('/create-account')}>
            <table className="form-table">
                <tbody>
                    <tr>
                        <td align="right">
                            <b> Username </b>
                        </td>
                        <td>
                            <input type="text" data="username" value={user.username}
                                onChange={event => handleOnChange(user, setUser, event)} />
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <b> Password </b>
                        </td>
                        <td>
                            <input type="password" data="password" value={user.password}
                                onChange={event => handleOnChange(user, setUser, event)} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" align="center">
                            <input className="btn" type="submit" value="Login" />
                            <input className="btn" type="reset" value="Create account" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>

    );
}

export default LoginForm;