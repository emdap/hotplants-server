import { Post, Route } from "tsoa";

@Route()
export class WakeUpController {
  @Post("wakeUp")
  public async wakeUp() {
    return "I'm awake!";
  }
}
