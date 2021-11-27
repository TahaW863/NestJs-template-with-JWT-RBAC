import {UserRole} from "./userRole.enum";


export interface User{
    id?:number;
    name?:string;
    username?:string;
    password?:string;
    email?:string;
    role?:UserRole;
}