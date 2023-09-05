import { Injectable } from "@nestjs/common";
import { AuthGuard} from "@nestjs/passport";

@Injectable()
export class FortytwoAuthGuard extends AuthGuard('fortytwo') { }