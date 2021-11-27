import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {UserService} from "../serivce/user.service";
import {User} from "../models/user.interface";
import {catchError, map, Observable, of} from "rxjs";
import {UserEntity} from "../models/user.entity";
import {hasRoles} from "../../auth/decorator/roles.decorator";
import {JwtAuthGuard} from "../../auth/guards/jwt-guard";
import {RolesGuard} from "../../auth/guards/roles.guard";
import {UserRole} from "../models/userRole.enum";

@Controller('user')
export class UserController {
    constructor(
        private userService:UserService
    ) {}


    @Get()
    findAll(){
        return this.userService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id:number){
        return this.userService.findOne(id);
    }
    @Post()
    create(@Body() user:User):Observable<User | Object>{
        return this.userService.create(user).pipe(
            map((user:User)=>user),
            catchError(err => of({error: err.message}))
        );
    }
    @Put(':id')
    updateOne(@Param('id') id:number, @Body() user:User):Observable<any>{
        return this.userService.updateOne(id,user);
    }

    @Delete(':id')
    deleteOne(@Param('id') id:number){
        return this.userService.deleteOne(id);
    }

    @Post('login')
    login(@Param() params):Observable<Object>{
        const newUser= new UserEntity();
        newUser.email=params.email;
        newUser.password=params.password;
        return this.userService.login(newUser).pipe(
            map((jwt:string)=>{return  {access_token: jwt}})
        );
    }
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRoleOfUser(@Param('id') id:string, @Body() user:User):Observable<any>{
        return this.userService.updateRoleById(id,user);
    }
}
