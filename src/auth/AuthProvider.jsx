import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const domain = "dev-ujx6mu4palvd72gp.us.auth0.com";  
  const clientId = "IsR59xZDwe26WkGVH1JKo33FFZcuaTQY";
  
  
  // Obtener la URL completa actual
  const currentUrl = window.location.href;
  // Determinar si estamos en GitHub Pages
  const isGitHubPages = currentUrl.includes('github.io');
  
  const redirectUri = isGitHubPages 
    ? 'https://boschx8.github.io/anitrack-app'
    : window.location.origin;

  console.log('Current redirectUri:', redirectUri); 

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;