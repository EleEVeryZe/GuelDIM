import { gapi } from 'gapi-script';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

interface AuthContextProps {
	isSignedIn: boolean;
	signIn: () => void;
	signOut: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
	isSignedIn: false,
	signIn: () => { },
	signOut: () => { },
});

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

	useEffect(() => {
		try {
			const auth = gapi.auth2.getAuthInstance();
			if (auth) {
				setIsSignedIn(auth.isSignedIn.get());
				auth.isSignedIn.listen(setIsSignedIn);
			} else {
				console.error('gapi.auth2.getAuthInstance() returned null');
			}
		} catch (error) {
			console.error('Error accessing gapi.auth2:', error);
		}
	}, []);

	const signIn = () => {
		gapi.auth2.getAuthInstance().signIn();
	};

	const signOut = () => {
		gapi.auth2.getAuthInstance().signOut();
		setIsSignedIn(false);
	};

	return (
		<AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	);
};
