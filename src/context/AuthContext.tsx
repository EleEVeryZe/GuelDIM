import { gapi } from 'gapi-script';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import {
	API_KEY,
	CLIENT_ID,
	DISCOVERY_DOCS,
	SCOPES,
} from "../services/googleApi";

interface AuthContextProps {
	loadingAuth: boolean;
	isSignedIn: boolean;
	signIn: () => void;
	signOut: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
	loadingAuth: true,
	isSignedIn: false,
	signIn: () => { },
	signOut: () => { },
});

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
	const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
	const [gapiInitialized, setGapiInitialized] = useState<boolean>(false);

	useEffect(() => {
		gapiInitialization();
	}, []);

	const gapiInitialization = () => {
		const initClient = () => {
			gapi.client
				.init({
					apiKey: API_KEY,
					clientId: CLIENT_ID,
					discoveryDocs: DISCOVERY_DOCS,
					scope: SCOPES,
				})
				.then(
					() => {
						console.log("GAPI client initialized.");
						setGapiInitialized(true);
					},
					(error) => {
						console.error("Error initializing GAPI client:", error);
					}
				);
		};

		gapi.load("client:auth2", initClient);
	}


	useEffect(() => {
		if (!gapiInitialized) return;

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
		} finally {
			setLoadingAuth(false);
		}
	}, [gapiInitialized]);

	const signIn = () => {
		gapi.auth2.getAuthInstance().signIn();
	};

	const signOut = () => {
		gapi.auth2.getAuthInstance().signOut();
		setIsSignedIn(false);
	};

	return (
		<AuthContext.Provider value={{ isSignedIn, signIn, signOut, loadingAuth }}>
			{children}
		</AuthContext.Provider>
	);
};
