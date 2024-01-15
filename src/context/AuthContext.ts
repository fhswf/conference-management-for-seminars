import React, {createContext} from "react";
import User from "../entities/database/User.ts";

type AuthContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
});
