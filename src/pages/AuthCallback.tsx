import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const clientId = 'gfveb41bie2hsjq1528vatiav';
      const redirectUri = 'http://localhost:5173/auth-callback';
      const tokenUrl =
        'https://us-west-1v7nohthfb.auth.us-west-1.amazoncognito.com/oauth2/token';

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        navigate('/'); // Redirect to homepage
      } else {
        console.error('Failed to get token', data);
      }
    } catch (error) {
      console.error('Error during token exchange:', error);
    }
  };

  return <div>Authenticating...</div>;
};

export default AuthCallback;
