import { useEffect } from 'react';
import { handleAuthCallback, AuthError } from '@netlify/identity';
import toast from 'react-hot-toast';

const IdentityCallback = () => {
  useEffect(() => {
    handleAuthCallback()
      .then((result) => {
        if (!result) return;

        if (result.type === 'confirmation') {
          toast.success('Email confirmed. You can now sign in.');
        } else if (result.type === 'oauth') {
          toast.success('Signed in successfully.');
        } else if (result.type === 'email_change') {
          toast.success('Email address updated.');
        } else if (result.type === 'recovery') {
          toast.success('Password recovery confirmed.');
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof AuthError ? error.message : 'Unable to complete account confirmation.';
        toast.error(message);
      });
  }, []);

  return null;
};

export default IdentityCallback;
