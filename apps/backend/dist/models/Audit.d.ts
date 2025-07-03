import mongoose from 'mongoose';
import { IAudit } from '../types/index.js';
export declare const Audit: mongoose.Model<IAudit, {}, {}, {}, mongoose.Document<unknown, {}, IAudit, {}> & IAudit & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Audit.d.ts.map