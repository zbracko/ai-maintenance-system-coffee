import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import favicon from '../assets/favicon.png';
import slide3 from '../assets/slide3.jpg';
import slidePerson from '../assets/slide_person.png';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { useAuth } from '../context/AuthContext';

const userPool = new CognitoUserPool({
  UserPoolId: 'us-west-1_V7nOhthfb', // Replace with your User Pool ID
  ClientId: 'gfveb41bie2hsjq1528vatiav', // Replace with your App Client ID
});

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState(''); 
  const [givenName, setGivenName] = useState(''); // Store user's first name
  const [showNewPasswordField, setShowNewPasswordField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/'); // Redirect to home or dashboard
    }
  }, [navigate]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const user = new CognitoUser({ Username: username, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: username, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const accessToken = session.getAccessToken().getJwtToken();
        localStorage.setItem('access_token', accessToken);
        login(); 
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      },
      onFailure: (err) => {
        console.error('Authentication failed:', err);
        setError('Login failed. Please check your credentials.');
        setLoading(false);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        console.log('Missing attributes:', requiredAttributes);
        setShowNewPasswordField(true);
        setLoading(false);
      },
    });
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const user = new CognitoUser({ Username: username, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: username, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: () => {},
      onFailure: (err) => {
        console.error('Authentication failed:', err);
        setError('Login failed. Please check your credentials.');
        setLoading(false);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // ✅ Remove `email_verified` from attributes to avoid error
        const updatedAttributes = { ...userAttributes, given_name: givenName };
        delete updatedAttributes.email_verified; 

        user.completeNewPasswordChallenge(newPassword, updatedAttributes, {
          onSuccess: (session) => {
            const accessToken = session.getAccessToken().getJwtToken();
            localStorage.setItem('access_token', accessToken);
            login();
            setLoading(false);
            setSuccess(true);
            navigate('/');
          },
          onFailure: (err) => {
            console.error('New password change failed:', err);
            setError('Failed to set new password. Please try again.');
            setLoading(false);
          },
        });
      },
    });
};

  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      overflow="hidden"
      sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${slide3})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: 0.3,
          zIndex: 0,
        }}
      />
      <Box
        component="img"
        src={slidePerson}
        alt="Slide Person"
        sx={{
          position: 'absolute',
          right: 0,
          top: '60%',
          transform: 'translate(-100px, -50%)',
          width: { xs: '42%', md: '30%' },
          zIndex: 1,
          filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))',
        }}
      />
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: '24px',
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <img 
            src={favicon} 
            alt="Logo" 
            style={{ 
              width: 50, 
              height: 50,
              filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))'
            }} 
          />
        </Box>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{
            color: '#1e293b',
            fontWeight: 700
          }}
        >
          {showNewPasswordField ? 'Set New Password' : 'Welcome Back'}
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fecaca'
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#86efac'
            }}
          >
            Login successful! Redirecting...
          </Alert>
        )}

        {showNewPasswordField ? (
          <form onSubmit={handleNewPasswordSubmit}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#1e293b',
                  '& fieldset': {
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
              }}
            />
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              required
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#1e293b',
                  '& fieldset': {
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                mt: 3,
                py: 1.5,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(15px)',
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.5)',
                  color: '#64748b'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Set New Password'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#1e293b',
                  '& fieldset': {
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#1e293b',
                  '& fieldset': {
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                mt: 3,
                py: 1.5,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(15px)',
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.5)',
                  color: '#64748b'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
