import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ScanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const model = searchParams.get('model');
    const machineNumber = searchParams.get('number');
    const loc = searchParams.get('loc');

    if (model && machineNumber) {
      // Save the machine context in localStorage (or Redux, etc.)
      localStorage.setItem('currentMachineModel', model);
      localStorage.setItem('currentMachineNumber', machineNumber);
      localStorage.setItem('currentLocation', loc || '');

      // Go to your AdminPanel or any route you want
      navigate('/admin');
    } else {
      alert('Invalid QR code or missing machine info!');
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Loading machine context from QR code...</h2>
      <p>Please wait...</p>
    </div>
  );
};

export default ScanPage;
