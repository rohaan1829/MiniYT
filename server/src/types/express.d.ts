import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            username: string;
            channelId?: string | null;
            name?: string | null;
            image?: string | null;
            channel?: any;
        }

        interface Request {
            user?: User;
        }
    }
}

export { };
