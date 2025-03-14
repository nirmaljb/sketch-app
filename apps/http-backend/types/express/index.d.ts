import { Request } from "express";

export interface RequestCustom extends Request {
    userid?: string;
}
