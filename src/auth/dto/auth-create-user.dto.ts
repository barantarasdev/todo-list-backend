import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsInt, Length, Matches, Max, Min } from 'class-validator'
import { VALIDATES_REGEXP } from 'src/constants/app.constants'

const { EMAIL, PASSWORD, PHONE, SITE } = VALIDATES_REGEXP

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User email' })
  @Matches(EMAIL)
  userEmail: string

  @ApiProperty({ example: 'User', description: 'User name' })
  @Length(2)
  userName: string

  @ApiProperty({ example: '123aaA/', description: 'User password' })
  @Matches(PASSWORD)
  userPassword: string

  @ApiProperty({ example: '+380964212611', description: 'User phone' })
  @Matches(PHONE)
  userPhone: string

  @ApiProperty({ example: '36', description: 'User age' })
  @IsInt()
  @Min(18)
  @Max(60)
  userAge: number

  @ApiProperty({ example: 'f', description: 'User gender' })
  @IsIn(['f', 'm'])
  userGender: string

  @ApiProperty({ example: 'google.com', description: 'User site' })
  @Matches(SITE)
  userSite: string
}
