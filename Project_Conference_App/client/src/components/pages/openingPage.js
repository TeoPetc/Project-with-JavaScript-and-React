import React from 'react';
import { Link } from 'react-router-dom';

const OpeningPage = () => {
  return (
<div className="opening-page">
    <div className="image-left">
        <img className = "image-logo" src="logo.png" alt="Left Image Description" />
    </div>
    
    <div className="content">
        <h1>Welcome to the Conference App</h1>
        <p>Unlock the power of knowledge and collaboration.</p>
        <blockquote>
            "The only source of knowledge is experience." - Albert Einstein
        </blockquote>
        <div>
            <Link to="/login">
                <button className='btn'>Login</button>
            </Link>
            <Link to="/create-account">
                <button className='btn'>Register</button>
            </Link>
        </div>
    </div>

    <div className="image-right">
        <img className = "image-logo" src="logo.png" alt="Right Image Description" />
    </div>
</div>
  );
};

export default OpeningPage;
