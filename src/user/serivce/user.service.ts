import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../models/user.entity";
import {Repository} from "typeorm";
import {User} from "../models/user.interface";
import {catchError, from, map, Observable, switchMap, throwError} from "rxjs";
import {AuthService} from "../../auth/service/auth.service";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity) private readonly userRepo:Repository<UserEntity>,
        private readonly authService: AuthService
    ) {
    }

    create(user: User):Observable<User>{
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash:string)=>{
                const newUser:User= new UserEntity();
                newUser.email=user.email;
                newUser.username=user.username;
                newUser.name=user.name;
                newUser.password=passwordHash;
                newUser.role=user.role;
                return from(this.userRepo.save(newUser)).pipe(
                    map((user:User)=>{
                        const {password, ...result}=user;
                        return result;
                    }),
                    catchError(err => throwError(err))
                )
            })
        )
        //return from(this.userRepo.save(user));
    }

    findAll():Observable<User[]>{
        return from(this.userRepo.find()).pipe(
            map((users)=>{
                users.forEach(v=>
                    delete v.password
                )
                return users;
            }),
            catchError(err => throwError(err))
        );
    }
    findOne(id:number):Observable<User>{
        return from(this.userRepo.findOne(id)).pipe(
            map((user:User)=>{
                const {password, ...result}=user;
                return result;
            }),
            catchError(err => throwError(err))
        );
    }

    deleteOne(id:number): Observable<any>{
        return from(this.userRepo.delete(id));
    }
    updateOne(id:number, user:User):Observable<any>{
        delete user.email;
        delete user.password;

        return from(this.userRepo.update(id,user));
    }

    login(user: User):Observable<string>{
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user:User)=>{
                if(user){
                    return this.authService.generateJwt(user).pipe(
                        map((jwt:string)=> jwt)
                    )
                }else{
                    return "Wrong Credentials";
                }
            })
        );
    }

    validateUser(email:string, password:string):Observable<User>{
        return this.findByMail(email).pipe(
            switchMap((user:User)=>this.authService.comparePasswords(password, user.password).pipe(
                map((match:boolean)=>{
                    if(match){
                        const{password, ... result} =user;
                        return result;
                    }else{
                        throw  Error('Invalid User');
                    }
                })
            )),
            catchError(err => throwError(err))
        )
    }
    findByMail(email:string):Observable<User>{
        return from(this.userRepo.findOne(email));
    }

    updateRoleById(id: string, user: User) {
        return from(this.userRepo.update(id,user));
    }
}
