import React, { useEffect, useState } from "react";

let logoutTimer;

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {}
});

const calculateRemainingTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    const adjExpirationTime = new Date(expirationTime).getTime();

    const remainingDuration = adjExpirationTime - currentTime

    return remainingDuration;
};

const retrieveStoredToken = () => {
    const sotredToken = localStorage.getItem('item');
    const storedExpirationDate = localStorage.getItem('expirationTime');

    const remainingTime = calculateRemainingTime(storedExpirationDate)

    if(remainingTime <= 3600){
        localStorage.removeItem('token')
        localStorage.removeItem('expirationTime');
        return null;
    }

    return {
        token: sotredToken,
        duration: remainingTime
    }
}

export const AuthContextProvider = (props) => {
    const tokenData = retrieveStoredToken();
    let initialToken = tokenData.token;
    if(tokenData){
        initialToken = tokenData.token;
    }
    const [token, setToken] = useState(initialToken)

    const userIsLoggedIn = !!token;

    const logoutHandler = () => {
        setToken(null);
        localStorage.removeItem('token');

        if(logoutTimer){
            clearTimeout(logoutTimer)
        }
    }
    const loginHandler = (token, expirationTime) => {
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime', expirationTime);

        const remainingTime = calculateRemainingTime(expirationTime);

        logoutTimer = setTimeout(loginHandler, remainingTime);
    };

    useEffect(() => {
        if(tokenData){
            console.log(tokenData.duration)
            logoutTimer = setTimeout(loginHandler, tokenData.duration);
        }
    }, [tokenData]);

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    }

    return <AuthContext.Provider value={contextValue}>
        {props.children}
    </AuthContext.Provider>
};

export default AuthContext;