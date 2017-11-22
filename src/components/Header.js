import React from 'react';
import {Link, Route, Switch} from 'react-router-dom'
import {
    Button,
    Collapse,
    Container,
    Jumbotron,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    NavItem,
    NavLink
} from 'reactstrap';
import '../styles/Header.css';

const Header = () => (

    <div>
        <div className="header">
            <NavBar/>
            <Switch>
                <Route exact path='/' component={BigHeader}/>
            </Switch>
        </div>
    </div>
)


const NavBar = () => {
    let isOpen = false;
    
    let toggle = function () {
        isOpen = !isOpen;
    }

    return (
        <Navbar dark expand id="navbar-my">
            <NavbarToggler onClick={toggle()}/>
            <NavbarBrand tag={Link} to='/'>GemBrow</NavbarBrand>
            <Collapse isOpen={isOpen} navbar>
                <Nav className="ml-auto" navbar>
                    <NavItem>
                        <NavLink tag={Link} to='/'>Home</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink tag={Link} to='/datasets'>Datasets</NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    )
}

const BigHeader = () => (
    <Jumbotron id="jumbotron-my">
        <Container>
            <h1>Gemma Browser</h1>
            <p>
                <Button
                    tag="a"
                    color="secondary"
                    size="large"
                    href="https://gemma.msl.ubc.ca/resources/restapidocs/"
                    target="_blank"
                >
                    View API Docs
                </Button>
            </p>
        </Container>
    </Jumbotron>
)

export default Header;
