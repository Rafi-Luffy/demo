export declare const generateAccessToken: (userId: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyRefreshToken: (token: string) => {
    id: string;
};
export declare const sendTokenResponse: (user: any, statusCode: number, res: any) => void;
//# sourceMappingURL=jwt.d.ts.map