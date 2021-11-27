import {Injectable, CanActivate, ExecutionContext, Inject, forwardRef} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {UserService} from "../../user/serivce/user.service";
import {map, Observable} from "rxjs";
import {User} from "../../user/models/user.interface";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector,
                @Inject(forwardRef(()=>UserService))
                private readonly userService:UserService
                ) {}

    canActivate(context: ExecutionContext):boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>('roles',context.getHandler());

        if(!roles){
            return true;
        }

        const user:User = context.switchToHttp().getRequest().user.user;
        return this.userService.findOne(user.id).pipe((
            map((user:User)=>{
                const hasRole=() => roles.indexOf(user.role)>-1;
                let hasPermisssion: boolean=false;
                if(hasRole()){
                    hasPermisssion=true;
                }
                return user&&hasPermisssion;
            })
        ))
    }
}