import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(4)
  firstName: string;

  @IsString()
  @MinLength(4)
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  // TODO: arg para contraseñas mas seguras
  password: string;
}
