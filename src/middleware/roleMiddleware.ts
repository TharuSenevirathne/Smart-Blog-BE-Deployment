import { Response,NextFunction } from "express";
import { Role } from "../model/userModel";
import { AuthRequest } from "../middleware/authMiddleware";

export const requireRole = (allowedRoleList: Role[]) => {
    
    return (req: AuthRequest, res: Response, next: NextFunction) => {

        const roles = req.user?.roles;

        if(!roles){
            res.status(403).json({message: 'Unauthorized!', data: null});
            return;
        }

        for (let i = 0; i < roles.length; i++) {
            const role = roles[i];

            if(allowedRoleList.includes(role)){
                next();
                return;
            }  
        }

        res.status(403).json({message: 'Unauthorized!', data: null});
        return;

    }
}