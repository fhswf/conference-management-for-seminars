import CurrentUser from "../entities/CurrentUser.ts";
import React, {createContext} from "react";

type AuthContextType = {
    user: CurrentUser | null;
    setUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {}, // empty function as a placeholder
});
