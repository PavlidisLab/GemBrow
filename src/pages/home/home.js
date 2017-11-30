import React from 'react';
import FontAwesome from 'react-fontawesome'
import './style.css'

const Home = () => (
    <div>
        <div className="center">
            <p className='big'>Welcome to the new web interface for the Gemma database of functional genomic data</p>
            <p>Work in progress</p>
            <p>
                <FontAwesome name="cog" size='2x' spin/>
            </p>
        </div>
    </div>
)


export default Home
